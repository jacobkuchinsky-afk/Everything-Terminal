// Grid coordinate point
export interface Point {
  x: number;
  y: number;
}

// Grid cell representation
export interface Cell {
  x: number;
  y: number;
  available: boolean;
  hasVia?: boolean;
  hasPin?: boolean;
}

// Pin button data
export interface Pin {
  id: string;
  x: number;
  y: number;
  size: number;
  connectedTraces: string[];
  label?: string;
  route?: string;
}

// Trace path data
export interface Trace {
  id: string;
  points: Point[];
  width: number;
  isDecorative?: boolean;
}

// Via hole data
export interface Via {
  id: string;
  x: number;
  y: number;
  outerRadius: number;
  innerRadius: number;
}

// Grid system configuration
export interface GridConfig {
  width: number;
  height: number;
  cellSize: number;
  cols: number;
  rows: number;
}

// Direction vectors for 8 directions (45° increments)
export type DirectionIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Direction {
  dx: number;
  dy: number;
  angle: number; // degrees
}

// Circuit board generation result
export interface CircuitData {
  pins: Pin[];
  traces: Trace[];
  vias: Via[];
  decorativeTraces: Trace[];
}

// Circuit board component props
export interface CircuitBoardProps {
  pinCount?: number;
  cellSize?: number;
  traceWidth?: number;
  seed?: number;
}

// Pin button component props
export interface PinButtonProps {
  pin: Pin;
  onClick?: () => void;
  onNavigate?: (route: string) => void;
}

// Trace component props
export interface TraceProps {
  trace: Trace;
}

// Via component props
export interface ViaProps {
  via: Via;
}

// Seeded random number generator interface
export interface SeededRandom {
  (): number;
  quick(): number;
}
