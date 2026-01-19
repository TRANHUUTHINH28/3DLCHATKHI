
export enum ProcessMode {
  ISOTHERMAL = 'Isothermal (Constant T)',
  ISOBARIC = 'Isobaric (Constant P)',
  ISOCHORIC = 'Isochoric (Constant V)'
}

export interface GasState {
  pressure: number;    // P
  volume: number;      // V (mapped to height of container)
  temperature: number; // T
  nR: number;         // Constant nR
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface GraphPoint {
  p: number;
  v: number;
  t: number;
}
