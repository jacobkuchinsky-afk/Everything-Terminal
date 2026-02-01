// Equation types supported by the graphing calculator
export type EquationType = 
  | "explicit"      // y = f(x)
  | "implicit"      // F(x,y) = 0
  | "parametric"    // x(t), y(t)
  | "polar"         // r = f(theta)
  | "inequality";   // y > f(x), y < f(x), etc.

export type InequalityType = ">" | ">=" | "<" | "<=";

// Available colors for equations
export const EQUATION_COLORS = [
  "#c74440", // red
  "#2d70b3", // blue
  "#388c46", // green
  "#6042a6", // purple
  "#fa7e19", // orange
  "#e85d9c", // pink
  "#2d9db3", // cyan
  "#d4a72c", // yellow
] as const;

export type EquationColor = typeof EQUATION_COLORS[number];

// Main equation interface
export interface Equation {
  id: string;
  expression: string;           // Raw input string
  type: EquationType;
  color: EquationColor;
  visible: boolean;
  error?: string;               // Parsing error if any
  // For parametric equations
  xExpression?: string;         // x(t)
  yExpression?: string;         // y(t)
  // For inequalities
  inequalityType?: InequalityType;
  // For implicit equations, the left side and right side
  leftSide?: string;
  rightSide?: string;
}

// Variable/slider definition
export interface Variable {
  id: string;
  name: string;                 // Single letter like 'a', 'b', 'c'
  value: number;
  min: number;
  max: number;
  step: number;
  isAnimating: boolean;
  animationSpeed: number;       // Steps per second
  animationDirection: 1 | -1;   // Forward or backward
}

// Viewport/view bounds
export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// Detected point types
export type PointType = "root" | "intersection" | "maximum" | "minimum";

export interface DetectedPoint {
  id: string;
  type: PointType;
  x: number;
  y: number;
  equationIds: string[];        // Which equation(s) this point belongs to
  label?: string;               // Optional label
}

// Canvas transform for coordinate conversion
export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// Graph state interface
export interface GraphState {
  equations: Equation[];
  variables: Variable[];
  viewport: Viewport;
  detectedPoints: DetectedPoint[];
  selectedEquationId: string | null;
  highlightedPointId: string | null;
  isDragging: boolean;
  canvasSize: { width: number; height: number };
}

// Actions for the graph state
export type GraphAction =
  | { type: "ADD_EQUATION" }
  | { type: "UPDATE_EQUATION"; id: string; updates: Partial<Equation> }
  | { type: "DELETE_EQUATION"; id: string }
  | { type: "REORDER_EQUATIONS"; fromIndex: number; toIndex: number }
  | { type: "ADD_VARIABLE"; name: string; value: number }
  | { type: "UPDATE_VARIABLE"; id: string; updates: Partial<Variable> }
  | { type: "DELETE_VARIABLE"; id: string }
  | { type: "SET_VIEWPORT"; viewport: Viewport }
  | { type: "PAN"; deltaX: number; deltaY: number }
  | { type: "ZOOM"; factor: number; centerX: number; centerY: number }
  | { type: "RESET_VIEWPORT" }
  | { type: "SET_DETECTED_POINTS"; points: DetectedPoint[] }
  | { type: "SELECT_EQUATION"; id: string | null }
  | { type: "HIGHLIGHT_POINT"; id: string | null }
  | { type: "SET_DRAGGING"; isDragging: boolean }
  | { type: "SET_CANVAS_SIZE"; width: number; height: number };

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Helper to get next available color
export function getNextColor(usedColors: EquationColor[]): EquationColor {
  for (const color of EQUATION_COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // If all colors used, cycle back
  return EQUATION_COLORS[usedColors.length % EQUATION_COLORS.length];
}

// Default viewport
export const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

// Default variable settings
export const DEFAULT_VARIABLE: Omit<Variable, "id" | "name" | "value"> = {
  min: -10,
  max: 10,
  step: 0.1,
  isAnimating: false,
  animationSpeed: 30,
  animationDirection: 1,
};
