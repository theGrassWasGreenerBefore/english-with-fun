// Shapes for minigame/<gameType>/gameConfig.json. See AGENTS.md section 5.
// Only the "coin" game type exists at this stage.

export interface CoinCoordinate {
  readonly x: number;
  readonly y: number;
}

export interface CoinEdgeCoordinate extends CoinCoordinate {
  readonly width: number;
  readonly height: number;
}

export interface CoinCoordinates {
  readonly heads: CoinCoordinate;
  readonly tails: CoinCoordinate;
  readonly edge: CoinEdgeCoordinate;
}

export interface CoinChrono {
  readonly throw: number;
  readonly land: number;
  readonly vibration_stop: number;
}

export interface CoinConfig {
  readonly texture: string;
  readonly radius: number;
  readonly coordinates: CoinCoordinates;
  readonly sound: string;
  readonly chrono: CoinChrono;
}
