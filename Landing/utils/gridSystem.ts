import { Cell, GridConfig, Point, Direction, DirectionIndex } from "@/types/circuit";

// 8 directions for trace routing (45° increments)
// Starting from top-left, going clockwise
export const DIRECTIONS: Direction[] = [
  { dx: -1, dy: -1, angle: 315 }, // 0: top-left (diagonal)
  { dx: 0, dy: -1, angle: 0 },    // 1: top (vertical)
  { dx: 1, dy: -1, angle: 45 },   // 2: top-right (diagonal)
  { dx: 1, dy: 0, angle: 90 },    // 3: right (horizontal)
  { dx: 1, dy: 1, angle: 135 },   // 4: bottom-right (diagonal)
  { dx: 0, dy: 1, angle: 180 },   // 5: bottom (vertical)
  { dx: -1, dy: 1, angle: 225 },  // 6: bottom-left (diagonal)
  { dx: -1, dy: 0, angle: 270 },  // 7: left (horizontal)
];

// Only allow 45° and 90° angles (indices 1, 3, 5, 7 for 90°, and 0, 2, 4, 6 for 45°)
export const VALID_DIRECTION_INDICES: DirectionIndex[] = [0, 1, 2, 3, 4, 5, 6, 7];

// Create grid configuration from viewport dimensions
export function createGridConfig(
  width: number,
  height: number,
  cellSize: number
): GridConfig {
  return {
    width,
    height,
    cellSize,
    cols: Math.ceil(width / cellSize) + 1,
    rows: Math.ceil(height / cellSize) + 1,
  };
}

// Initialize empty grid with all cells available
export function createGrid(config: GridConfig): Cell[][] {
  const grid: Cell[][] = [];
  
  for (let x = 0; x < config.cols; x++) {
    grid[x] = [];
    for (let y = 0; y < config.rows; y++) {
      grid[x][y] = {
        x,
        y,
        available: true,
        hasVia: false,
        hasPin: false,
      };
    }
  }
  
  return grid;
}

// Convert grid coordinates to pixel coordinates
export function gridToPixel(gridX: number, gridY: number, cellSize: number): Point {
  return {
    x: (gridX + 0.5) * cellSize,
    y: (gridY + 0.5) * cellSize,
  };
}

// Convert pixel coordinates to grid coordinates
export function pixelToGrid(pixelX: number, pixelY: number, cellSize: number): Point {
  return {
    x: Math.floor(pixelX / cellSize),
    y: Math.floor(pixelY / cellSize),
  };
}

// Check if grid coordinates are within bounds
export function isInBounds(x: number, y: number, config: GridConfig): boolean {
  return x >= 0 && x < config.cols && y >= 0 && y < config.rows;
}

// Check if a cell is available for routing
export function isCellAvailable(
  grid: Cell[][],
  x: number,
  y: number,
  config: GridConfig
): boolean {
  if (!isInBounds(x, y, config)) return false;
  return grid[x][y].available;
}

// Mark a cell as occupied
export function markCellOccupied(grid: Cell[][], x: number, y: number): void {
  if (grid[x] && grid[x][y]) {
    grid[x][y].available = false;
  }
}

// Mark a cell as having a pin
export function markCellAsPin(grid: Cell[][], x: number, y: number): void {
  if (grid[x] && grid[x][y]) {
    grid[x][y].available = false;
    grid[x][y].hasPin = true;
  }
}

// Mark a cell as having a via
export function markCellAsVia(grid: Cell[][], x: number, y: number): void {
  if (grid[x] && grid[x][y]) {
    grid[x][y].hasVia = true;
  }
}

// Get all available cells in the grid
export function getAvailableCells(grid: Cell[][], config: GridConfig): Cell[] {
  const available: Cell[] = [];
  
  for (let x = 0; x < config.cols; x++) {
    for (let y = 0; y < config.rows; y++) {
      if (grid[x][y].available) {
        available.push(grid[x][y]);
      }
    }
  }
  
  return available;
}

// Check if diagonal movement would cross over another trace
export function noCrossOver(
  grid: Cell[][],
  dirIndex: DirectionIndex,
  x: number,
  y: number,
  config: GridConfig
): boolean {
  // Only check for diagonal movements
  if (dirIndex === 1 || dirIndex === 3 || dirIndex === 5 || dirIndex === 7) {
    return true; // Non-diagonal, no crossover check needed
  }
  
  // For diagonals, check adjacent cells to prevent visual crossing
  switch (dirIndex) {
    case 0: // top-left
      return (
        (isInBounds(x + 1, y, config) && grid[x + 1][y].available) ||
        (isInBounds(x, y + 1, config) && grid[x][y + 1].available)
      );
    case 2: // top-right
      return (
        (isInBounds(x - 1, y, config) && grid[x - 1][y].available) ||
        (isInBounds(x, y + 1, config) && grid[x][y + 1].available)
      );
    case 4: // bottom-right
      return (
        (isInBounds(x - 1, y, config) && grid[x - 1][y].available) ||
        (isInBounds(x, y - 1, config) && grid[x][y - 1].available)
      );
    case 6: // bottom-left
      return (
        (isInBounds(x + 1, y, config) && grid[x + 1][y].available) ||
        (isInBounds(x, y - 1, config) && grid[x][y - 1].available)
      );
    default:
      return true;
  }
}

// Calculate distance between two points
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Calculate Manhattan distance between two grid points
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// Normalize direction index to 0-7 range
export function normalizeDirection(dir: number): DirectionIndex {
  let normalized = dir % 8;
  if (normalized < 0) normalized += 8;
  return normalized as DirectionIndex;
}

// Get opposite direction
export function getOppositeDirection(dir: DirectionIndex): DirectionIndex {
  return normalizeDirection(dir + 4);
}

// Get adjacent directions (for turning)
export function getAdjacentDirections(dir: DirectionIndex): [DirectionIndex, DirectionIndex] {
  return [
    normalizeDirection(dir - 1),
    normalizeDirection(dir + 1),
  ];
}
