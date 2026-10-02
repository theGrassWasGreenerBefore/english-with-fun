// Shapes for minigame/<gameType>/gameConfig.json (coin flip). See AGENTS.md section 5.

export interface CoinRectCoord {
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly height?: number;
}

export interface CoinCoordinates {
  readonly heads: CoinRectCoord;
  readonly tails: CoinRectCoord;
  readonly edge: CoinRectCoord;
}

export interface CoinChrono {
  readonly throw: number;
  readonly land: number;
  readonly vibration_stop: number;
}

export interface CoinGameConfig {
  readonly texture: string;
  readonly radius?: number;
  readonly coordinates: CoinCoordinates;
  readonly sound: string;
  readonly chrono: CoinChrono;
}
