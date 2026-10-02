// Vanilla WebGL embeddable module for the `minigame` section (coin flip). See AGENTS.md section 4.
// Owns the <canvas>/<audio> only; no external events listened, none emitted (skill-minigame.md).
import "./CoinGame.css";
import type { EmbeddableModule } from "../../types/embeddable";
import type { CoinGameConfig, CoinRectCoord } from "../../types/coinGame";

// "constant 5 with a random 0|1 addition that defines the new side" (skill-minigame.md).
const BASE_HALF_TURNS = 5;
const EDGE_THRESHOLD = 0.15;
const SETTLE_WOBBLE_FREQ = 18;
const SETTLE_WOBBLE_AMPLITUDE = 0.08;
// Fraction of the canvas's clip-space half-HEIGHT the coin occupies at rest.
// Kept small enough that even the airborne 2x grow factor plus the shadow's
// spread/offset stay within the [-1, 1] clip bounds on a non-square canvas.
const BASE_RADIUS_FRACTION = 0.35;
const MAX_DEVICE_PIXEL_RATIO = 2;

type CoinSide = "heads" | "tails";
type GameState = "still" | "pending";

interface UVRect {
  readonly u0: number;
  readonly v0: number;
  readonly uw: number;
  readonly vh: number;
}

const FACE_VERTEX_SRC = `#version 300 es
in vec2 aPos;
in vec2 aUV;
uniform vec2 uScale;
uniform vec4 uUVRect;
out vec2 vUV;
void main() {
  gl_Position = vec4(aPos * uScale, 0.0, 1.0);
  // Un-flipped texImage2D upload means V=0 samples the image's top row; flip here
  // (once, globally) rather than per-rect, so region selection stays untangled from orientation.
  vUV = uUVRect.xy + vec2(aUV.x, 1.0 - aUV.y) * uUVRect.zw;
}`;

const FACE_FRAGMENT_SRC = `#version 300 es
precision mediump float;
in vec2 vUV;
uniform sampler2D uTex;
out vec4 outColor;
void main() {
  outColor = texture(uTex, vUV);
}`;

const SHADOW_VERTEX_SRC = `#version 300 es
in vec2 aPos;
uniform vec2 uScale;
uniform vec2 uTranslate;
out vec2 vPos;
void main() {
  gl_Position = vec4(aPos * uScale + uTranslate, 0.0, 1.0);
  vPos = aPos;
}`;

const SHADOW_FRAGMENT_SRC = `#version 300 es
precision mediump float;
in vec2 vPos;
uniform float uSoftness;
uniform float uOpacity;
out vec4 outColor;
void main() {
  float d = length(vPos);
  float a = clamp(1.0 - d, 0.0, 1.0);
  a = pow(a, mix(1.0, 3.0, uSoftness));
  outColor = vec4(0.0, 0.0, 0.0, a * uOpacity);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("CoinGame: failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`CoinGame: shader compile failed: ${log ?? "unknown error"}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexSrc: string, fragmentSrc: string): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  const program = gl.createProgram();
  if (!program) throw new Error("CoinGame: failed to create program");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`CoinGame: program link failed: ${log ?? "unknown error"}`);
  }
  return program;
}

function toUVRect(rect: CoinRectCoord, imageWidth: number, imageHeight: number, radius?: number): UVRect {
  // heads/tails give no explicit width/height: x/y are a circle's CENTER, and the
  // sampled square is the full diameter (2 * radius), not the radius itself.
  // edge gives explicit width/height: x/y there are already a top-left corner.
  const isCircle = rect.width === undefined && rect.height === undefined;
  const size = (radius ?? 0) * 2;
  const left = isCircle ? rect.x - (radius ?? 0) : rect.x;
  const top = isCircle ? rect.y - (radius ?? 0) : rect.y;
  const width = isCircle ? size : (rect.width ?? 0);
  const height = isCircle ? size : (rect.height ?? 0);
  return { u0: left / imageWidth, v0: top / imageHeight, uw: width / imageWidth, vh: height / imageHeight };
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export class CoinGame implements EmbeddableModule<CoinGameConfig> {
  private container: HTMLElement | null = null;
  private abortController: AbortController | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafHandle: number | null = null;

  private faceProgram: WebGLProgram | null = null;
  private shadowProgram: WebGLProgram | null = null;
  private quadBuffer: WebGLBuffer | null = null;
  private texture: WebGLTexture | null = null;
  private audio: HTMLAudioElement | null = null;

  private faceUniforms: { scale: WebGLUniformLocation; uvRect: WebGLUniformLocation; tex: WebGLUniformLocation } | null =
    null;
  private shadowUniforms: {
    scale: WebGLUniformLocation;
    translate: WebGLUniformLocation;
    softness: WebGLUniformLocation;
    opacity: WebGLUniformLocation;
  } | null = null;

  private uvRects: Record<CoinSide | "edge", UVRect> | null = null;
  private chrono: CoinGameConfig["chrono"] = { throw: 0, land: 0, vibration_stop: 0 };

  private state: GameState = "still";
  private currentSide: CoinSide = "heads";
  private pendingStartTime = 0;
  private pendingHalfTurns = BASE_HALF_TURNS;

  async init(container: HTMLElement, config: CoinGameConfig): Promise<void> {
    this.container = container;
    this.abortController = new AbortController();
    this.state = "still";
    this.currentSide = Math.random() < 0.5 ? "heads" : "tails";
    this.chrono = config.chrono;

    const canvas = document.createElement("canvas");
    canvas.className = "mg-coin__canvas";
    this.canvas = canvas;

    const root = document.createElement("div");
    root.className = "mg-coin";
    root.append(canvas);
    container.replaceChildren(root);

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("CoinGame: WebGL2 is not supported");
    this.gl = gl;

    this.faceProgram = createProgram(gl, FACE_VERTEX_SRC, FACE_FRAGMENT_SRC);
    this.shadowProgram = createProgram(gl, SHADOW_VERTEX_SRC, SHADOW_FRAGMENT_SRC);
    this.faceUniforms = {
      scale: this.requireUniform(gl, this.faceProgram, "uScale"),
      uvRect: this.requireUniform(gl, this.faceProgram, "uUVRect"),
      tex: this.requireUniform(gl, this.faceProgram, "uTex"),
    };
    this.shadowUniforms = {
      scale: this.requireUniform(gl, this.shadowProgram, "uScale"),
      translate: this.requireUniform(gl, this.shadowProgram, "uTranslate"),
      softness: this.requireUniform(gl, this.shadowProgram, "uSoftness"),
      opacity: this.requireUniform(gl, this.shadowProgram, "uOpacity"),
    };

    this.quadBuffer = this.createQuadBuffer(gl);
    this.texture = await this.loadTexture(gl, config);
    this.audio = this.createAudio(config.sound);

    this.wireEvents();
    this.applyCanvasSize();
    this.rafHandle = requestAnimationFrame(() => this.renderLoop());
  }

  destroy(): void {
    try {
      this.abortController?.abort();
      if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
      this.resizeObserver?.disconnect();

      if (this.audio) {
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.load();
      }

      const gl = this.gl;
      if (gl) {
        if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
        if (this.texture) gl.deleteTexture(this.texture);
        if (this.faceProgram) gl.deleteProgram(this.faceProgram);
        if (this.shadowProgram) gl.deleteProgram(this.shadowProgram);
      }

      this.container?.replaceChildren();
    } catch (error) {
      console.error("CoinGame: cleanup failed", error);
    } finally {
      this.container = null;
      this.abortController = null;
      this.canvas = null;
      this.gl = null;
      this.resizeObserver = null;
      this.rafHandle = null;
      this.faceProgram = null;
      this.shadowProgram = null;
      this.quadBuffer = null;
      this.texture = null;
      this.audio = null;
      this.faceUniforms = null;
      this.shadowUniforms = null;
      this.uvRects = null;
      this.state = "still";
      this.currentSide = "heads";
      this.pendingStartTime = 0;
      this.pendingHalfTurns = BASE_HALF_TURNS;
    }
  }

  private requireUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
    const location = gl.getUniformLocation(program, name);
    if (!location) throw new Error(`CoinGame: missing uniform ${name}`);
    return location;
  }

  private createQuadBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("CoinGame: failed to create buffer");
    // Interleaved: position.xy, uv.xy — one unit quad shared by both programs.
    const data = new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      1, 1, 1, 1,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  private async loadTexture(gl: WebGL2RenderingContext, config: CoinGameConfig): Promise<WebGLTexture> {
    const texture = gl.createTexture();
    if (!texture) throw new Error("CoinGame: failed to create texture");

    const image = await this.loadImage(config.texture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (image) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      const { coordinates, radius } = config;
      this.uvRects = {
        heads: toUVRect(coordinates.heads, image.naturalWidth, image.naturalHeight, radius),
        tails: toUVRect(coordinates.tails, image.naturalWidth, image.naturalHeight, radius),
        edge: toUVRect(coordinates.edge, image.naturalWidth, image.naturalHeight, radius),
      };
    } else {
      // Texture file missing during development — flat placeholder, full-rect UVs. See AGENTS.md section 7.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([200, 200, 200, 255]));
      const fullRect: UVRect = { u0: 0, v0: 0, uw: 1, vh: 1 };
      this.uvRects = { heads: fullRect, tails: fullRect, edge: fullRect };
    }
    return texture;
  }

  private loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => {
        console.error(`CoinGame: failed to load texture "${src}"`);
        resolve(null);
      };
      image.src = src;
    });
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio();
    audio.src = src;
    audio.preload = "auto";
    return audio;
  }

  private wireEvents(): void {
    const signal = this.abortController?.signal;
    const canvas = this.canvas;
    if (!signal || !canvas) return;

    canvas.addEventListener("click", () => this.handleClick(), { signal });

    this.resizeObserver = new ResizeObserver(() => this.applyCanvasSize());
    if (this.container) this.resizeObserver.observe(this.container);
  }

  private handleClick(): void {
    if (this.state !== "still") return;

    this.state = "pending";
    this.pendingStartTime = performance.now();
    this.pendingHalfTurns = BASE_HALF_TURNS + (Math.random() < 0.5 ? 0 : 1);
    this.canvas?.classList.add("mg-coin__canvas--busy");

    if (this.audio) {
      this.audio.currentTime = 0;
      void this.audio.play().catch((error: unknown) => console.error("CoinGame: audio play failed", error));
    }
  }

  private applyCanvasSize(): void {
    const canvas = this.canvas;
    const container = this.container;
    const gl = this.gl;
    if (!canvas || !container || !gl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const width = Math.max(1, Math.round(container.clientWidth * dpr));
    const height = Math.max(1, Math.round(container.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  private renderLoop(): void {
    this.draw();
    this.rafHandle = requestAnimationFrame(() => this.renderLoop());
  }

  private draw(): void {
    const gl = this.gl;
    const faceProgram = this.faceProgram;
    const shadowProgram = this.shadowProgram;
    const faceUniforms = this.faceUniforms;
    const shadowUniforms = this.shadowUniforms;
    const quadBuffer = this.quadBuffer;
    const uvRects = this.uvRects;
    if (!gl || !faceProgram || !shadowProgram || !faceUniforms || !shadowUniforms || !quadBuffer || !uvRects) return;

    const frame = this.computeFrame();
    // Clip space is normalized to each axis independently, so on a non-square
    // canvas a uniform scale would stretch the coin into an ellipse. Dividing
    // the X scale by the aspect ratio keeps it circular in actual pixels.
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Shadow (bottom layer): softer/larger and more transparent the higher the coin flies.
    const shadowScale = BASE_RADIUS_FRACTION * (1 + 0.15 * frame.grow);
    gl.useProgram(shadowProgram);
    this.bindQuadAttributes(gl, shadowProgram, { withUV: false });
    gl.uniform2f(shadowUniforms.scale, shadowScale / aspect, shadowScale);
    gl.uniform2f(shadowUniforms.translate, (0.04 * frame.grow) / aspect, -0.05 * frame.grow);
    gl.uniform1f(shadowUniforms.softness, clamp01(frame.grow));
    gl.uniform1f(shadowUniforms.opacity, 0.35 * (1 - 0.5 * clamp01(frame.grow)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Coin face/edge (top layer). Squash (flip foreshortening) applies only to
    // the height axis, matching the real rotation axis; width stays circular.
    const rect = frame.showEdge ? uvRects.edge : uvRects[frame.side];
    const faceScale = BASE_RADIUS_FRACTION * frame.grow;
    gl.useProgram(faceProgram);
    this.bindQuadAttributes(gl, faceProgram, { withUV: true });
    gl.uniform2f(faceUniforms.scale, faceScale / aspect, faceScale * frame.squash);
    gl.uniform4f(faceUniforms.uvRect, rect.u0, rect.v0, rect.uw, rect.vh);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(faceUniforms.tex, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private bindQuadAttributes(gl: WebGL2RenderingContext, program: WebGLProgram, { withUV }: { withUV: boolean }): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

    const posLoc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);

    if (withUV) {
      const uvLoc = gl.getAttribLocation(program, "aUV");
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    }
  }

  private computeFrame(): { side: CoinSide; showEdge: boolean; squash: number; grow: number } {
    if (this.state === "still") {
      return { side: this.currentSide, showEdge: false, squash: 1, grow: 1 };
    }

    const elapsedSeconds = (performance.now() - this.pendingStartTime) / 1000;

    const { throw: throwAt, land, vibration_stop: vibrationStop } = this.chrono;
    const mid = (throwAt + land) / 2;
    const totalAngle = this.pendingHalfTurns * Math.PI;

    let angle: number;
    if (elapsedSeconds <= throwAt) {
      angle = 0;
    } else if (elapsedSeconds >= land) {
      angle = totalAngle;
    } else {
      angle = easeInOutQuad(clamp01((elapsedSeconds - throwAt) / Math.max(1e-6, land - throwAt))) * totalAngle;
    }

    let grow: number;
    if (elapsedSeconds <= mid) {
      grow = 1 + easeInOutQuad(clamp01(elapsedSeconds / Math.max(1e-6, mid)));
    } else if (elapsedSeconds <= land) {
      grow = 2 - easeInOutQuad(clamp01((elapsedSeconds - mid) / Math.max(1e-6, land - mid)));
    } else {
      grow = 1;
    }

    let squash = Math.abs(Math.cos(angle));
    if (elapsedSeconds > land && elapsedSeconds < vibrationStop) {
      const settleProgress = clamp01((elapsedSeconds - land) / Math.max(1e-6, vibrationStop - land));
      const wobble = Math.sin((elapsedSeconds - land) * SETTLE_WOBBLE_FREQ) * SETTLE_WOBBLE_AMPLITUDE * (1 - settleProgress);
      squash = clamp01(squash + wobble);
    }

    const nominalFaceIndex = Math.floor((angle + Math.PI / 2) / Math.PI);
    const flipped = nominalFaceIndex % 2 !== 0;
    const side: CoinSide = flipped ? this.oppositeSide(this.currentSide) : this.currentSide;
    const showEdge = squash < EDGE_THRESHOLD;

    if (elapsedSeconds >= vibrationStop) {
      this.state = "still";
      this.currentSide = side;
      this.canvas?.classList.remove("mg-coin__canvas--busy");
      return { side, showEdge: false, squash: 1, grow: 1 };
    }

    return { side, showEdge, squash, grow };
  }

  private oppositeSide(side: CoinSide): CoinSide {
    return side === "heads" ? "tails" : "heads";
  }
}
