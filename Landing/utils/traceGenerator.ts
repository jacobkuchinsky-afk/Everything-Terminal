import seedrandom from "seedrandom";
import {
  Cell,
  GridConfig,
  Pin,
  Trace,
  Via,
  Point,
  CircuitData,
  DirectionIndex,
  SeededRandom,
} from "@/types/circuit";
import {
  createGrid,
  createGridConfig,
  gridToPixel,
  DIRECTIONS,
  isCellAvailable,
  markCellOccupied,
  markCellAsPin,
  markCellAsVia,
  isInBounds,
  manhattanDistance,
} from "./gridSystem";

// Configuration for trace generation
interface GeneratorConfig {
  pinCount: number;
  cellSize: number;
  traceWidth: number;
  minPinSpacing: number;
  viaChance: number;
  decorativeTraceCount: number;
  borderExtension: number;
}

const DEFAULT_CONFIG: GeneratorConfig = {
  pinCount: 4,
  cellSize: 70,
  traceWidth: 8,
  minPinSpacing: 6,
  viaChance: 0.03,
  decorativeTraceCount: 2,
  borderExtension: 3,
};

// Utility definitions for pin labels and routes
const UTILITY_DEFINITIONS = [
  { label: "YouTube", route: "/youtube" },
  { label: "Cipher", route: "/cipher" },
  { label: "Color", route: "/color" },
  { label: "Calc", route: "/calc" },
  { label: "Graph", route: "/graph" },
];

// Generate unique ID
function generateId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

// A* pathfinding to connect two grid points
function findPath(
  grid: Cell[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  config: GridConfig,
  rng: SeededRandom
): Point[] | null {
  interface Node {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent: Node | null;
  }

  const openSet: Node[] = [];
  const closedSet = new Set<string>();
  
  const heuristic = (x: number, y: number) => manhattanDistance(x, y, endX, endY);
  
  const startNode: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY),
    f: heuristic(startX, startY),
    parent: null,
  };
  
  openSet.push(startNode);
  
  const dirPriority = [1, 3, 5, 7, 0, 2, 4, 6];
  
  let iterations = 0;
  const maxIterations = 5000;
  
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    // Reached the goal
    if (current.x === endX && current.y === endY) {
      const path: Point[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }
    
    closedSet.add(`${current.x},${current.y}`);
    
    const shuffledDirs = [...dirPriority];
    if (rng() > 0.8) {
      const i = Math.floor(rng() * shuffledDirs.length);
      const j = Math.floor(rng() * shuffledDirs.length);
      [shuffledDirs[i], shuffledDirs[j]] = [shuffledDirs[j], shuffledDirs[i]];
    }
    
    for (const dirIdx of shuffledDirs) {
      const dir = DIRECTIONS[dirIdx];
      const newX = current.x + dir.dx;
      const newY = current.y + dir.dy;
      
      const key = `${newX},${newY}`;
      if (closedSet.has(key)) continue;
      if (!isInBounds(newX, newY, config)) continue;
      
      // Allow path near start/end even if occupied
      const nearStart = manhattanDistance(newX, newY, startX, startY) <= 1;
      const nearEnd = manhattanDistance(newX, newY, endX, endY) <= 1;
      
      if (!grid[newX][newY].available && !nearStart && !nearEnd) continue;
      
      const moveCost = (dirIdx % 2 === 0) ? 1.4 : 1.0;
      const g = current.g + moveCost;
      const h = heuristic(newX, newY);
      const f = g + h;
      
      const existingIdx = openSet.findIndex(n => n.x === newX && n.y === newY);
      if (existingIdx !== -1) {
        if (openSet[existingIdx].g <= g) continue;
        openSet.splice(existingIdx, 1);
      }
      
      openSet.push({ x: newX, y: newY, g, h, f, parent: current });
    }
  }
  
  return null;
}

// Smooth path
function smoothPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;
  
  const smoothed: Point[] = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = smoothed[smoothed.length - 1];
    const curr = path[i];
    const next = path[i + 1];
    
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    
    if (dx1 !== dx2 || dy1 !== dy2) {
      smoothed.push(curr);
    }
  }
  
  smoothed.push(path[path.length - 1]);
  return smoothed;
}

// Mark path as occupied
function markPathOccupied(grid: Cell[][], path: Point[], config: GridConfig): void {
  for (const point of path) {
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    if (isInBounds(x, y, config)) {
      markCellOccupied(grid, x, y);
    }
  }
}

// Place pins spread across the entire visible area
function placePins(
  grid: Cell[][],
  config: GridConfig,
  genConfig: GeneratorConfig,
  rng: SeededRandom,
  visibleCols: number,
  visibleRows: number,
  borderOffset: number
): (Pin & { gridX: number; gridY: number })[] {
  const pins: (Pin & { gridX: number; gridY: number })[] = [];
  const margin = 2;
  
  // Divide screen into regions to ensure spread
  const regions: { minX: number; maxX: number; minY: number; maxY: number }[] = [];
  const gridCols = 3;
  const gridRows = 3;
  const regionWidth = Math.floor((visibleCols - margin * 2) / gridCols);
  const regionHeight = Math.floor((visibleRows - margin * 2) / gridRows);
  
  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      regions.push({
        minX: borderOffset + margin + gx * regionWidth,
        maxX: borderOffset + margin + (gx + 1) * regionWidth,
        minY: borderOffset + margin + gy * regionHeight,
        maxY: borderOffset + margin + (gy + 1) * regionHeight,
      });
    }
  }
  
  // Shuffle regions
  for (let i = regions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [regions[i], regions[j]] = [regions[j], regions[i]];
  }
  
  // Place pins in different regions
  let regionIdx = 0;
  let attempts = 0;
  const maxAttempts = genConfig.pinCount * 50;
  
  while (pins.length < genConfig.pinCount && attempts < maxAttempts) {
    attempts++;
    
    const region = regions[regionIdx % regions.length];
    const x = region.minX + Math.floor(rng() * (region.maxX - region.minX));
    const y = region.minY + Math.floor(rng() * (region.maxY - region.minY));
    
    if (!isInBounds(x, y, config) || !isCellAvailable(grid, x, y, config)) {
      continue;
    }
    
    // Check spacing from other pins
    let tooClose = false;
    for (const pin of pins) {
      const dist = manhattanDistance(x, y, pin.gridX, pin.gridY);
      if (dist < genConfig.minPinSpacing) {
        tooClose = true;
        break;
      }
    }
    
    if (tooClose) continue;
    
    const pixelPos = gridToPixel(x - borderOffset, y - borderOffset, genConfig.cellSize);
    markCellAsPin(grid, x, y);
    
    const utilityDef = UTILITY_DEFINITIONS[pins.length % UTILITY_DEFINITIONS.length];
    pins.push({
      id: generateId("pin", pins.length),
      x: pixelPos.x,
      y: pixelPos.y,
      gridX: x,
      gridY: y,
      size: genConfig.cellSize * 0.5,
      connectedTraces: [],
      label: utilityDef.label,
      route: utilityDef.route,
    });
    
    regionIdx++;
  }
  
  return pins;
}

// Find MST connections
function findMSTConnections(
  pins: (Pin & { gridX: number; gridY: number })[]
): [number, number][] {
  if (pins.length < 2) return [];
  
  const connections: [number, number][] = [];
  const connected = new Set<number>([0]);
  const remaining = new Set<number>(pins.map((_, i) => i).filter(i => i !== 0));
  
  while (remaining.size > 0) {
    let bestDist = Infinity;
    let bestFrom = -1;
    let bestTo = -1;
    
    for (const from of connected) {
      for (const to of remaining) {
        const dist = manhattanDistance(
          pins[from].gridX, pins[from].gridY,
          pins[to].gridX, pins[to].gridY
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestFrom = from;
          bestTo = to;
        }
      }
    }
    
    if (bestTo !== -1) {
      connections.push([bestFrom, bestTo]);
      connected.add(bestTo);
      remaining.delete(bestTo);
    } else {
      break;
    }
  }
  
  return connections;
}

// Verify connectivity
function verifyConnectivity(
  pins: (Pin & { gridX: number; gridY: number })[],
  successfulConnections: [number, number][]
): boolean {
  if (pins.length <= 1) return true;
  
  const parent: number[] = pins.map((_, i) => i);
  
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  
  function union(x: number, y: number): void {
    const px = find(x);
    const py = find(y);
    if (px !== py) parent[px] = py;
  }
  
  for (const [from, to] of successfulConnections) {
    union(from, to);
  }
  
  const root = find(0);
  for (let i = 1; i < pins.length; i++) {
    if (find(i) !== root) return false;
  }
  
  return true;
}

// Generate connected traces - ensure traces connect directly to pin centers
function generateConnectedTraces(
  grid: Cell[][],
  pins: (Pin & { gridX: number; gridY: number })[],
  config: GridConfig,
  genConfig: GeneratorConfig,
  rng: SeededRandom,
  borderOffset: number
): { traces: Trace[]; allConnected: boolean } {
  const traces: Trace[] = [];
  const successfulConnections: [number, number][] = [];
  
  const connections = findMSTConnections(pins);
  
  // Add one extra connection for visual interest
  const extraConnections: [number, number][] = [];
  if (pins.length > 3) {
    const from = Math.floor(rng() * pins.length);
    let to = Math.floor(rng() * pins.length);
    if (to === from) to = (to + 1) % pins.length;
    
    const exists = connections.some(
      ([a, b]) => (a === from && b === to) || (a === to && b === from)
    );
    
    if (!exists) {
      extraConnections.push([from, to]);
    }
  }
  
  const allConnections = [...connections, ...extraConnections];
  
  for (const [fromIdx, toIdx] of allConnections) {
    const fromPin = pins[fromIdx];
    const toPin = pins[toIdx];
    
    const gridPath = findPath(
      grid,
      fromPin.gridX,
      fromPin.gridY,
      toPin.gridX,
      toPin.gridY,
      config,
      rng
    );
    
    if (gridPath && gridPath.length >= 2) {
      const smoothedPath = smoothPath(gridPath);
      
      // Convert to pixel coordinates - ensure path starts and ends at pin centers
      const pixelPath = smoothedPath.map(p => 
        gridToPixel(p.x - borderOffset, p.y - borderOffset, genConfig.cellSize)
      );
      
      // Ensure first point is exactly at fromPin and last point is exactly at toPin
      pixelPath[0] = { x: fromPin.x, y: fromPin.y };
      pixelPath[pixelPath.length - 1] = { x: toPin.x, y: toPin.y };
      
      markPathOccupied(grid, gridPath, config);
      
      const trace: Trace = {
        id: generateId("trace", traces.length),
        points: pixelPath,
        width: genConfig.traceWidth,
      };
      
      traces.push(trace);
      fromPin.connectedTraces.push(trace.id);
      toPin.connectedTraces.push(trace.id);
      
      if (connections.some(([a, b]) => (a === fromIdx && b === toIdx) || (a === toIdx && b === fromIdx))) {
        successfulConnections.push([fromIdx, toIdx]);
      }
    }
  }
  
  const allConnected = verifyConnectivity(pins, successfulConnections);
  
  return { traces, allConnected };
}

// Generate edge traces
function generateEdgeTraces(
  grid: Cell[][],
  existingTraces: Trace[],
  config: GridConfig,
  genConfig: GeneratorConfig,
  rng: SeededRandom,
  borderOffset: number,
  visibleCols: number,
  visibleRows: number
): Trace[] {
  const edgeTraces: Trace[] = [];
  const numEdgeTraces = 3 + Math.floor(rng() * 3);
  
  for (let i = 0; i < numEdgeTraces; i++) {
    if (existingTraces.length === 0) break;
    
    const sourceTrace = existingTraces[Math.floor(rng() * existingTraces.length)];
    if (sourceTrace.points.length < 2) continue;
    
    const pointIdx = Math.floor(rng() * sourceTrace.points.length);
    const sourcePoint = sourceTrace.points[pointIdx];
    
    const startX = Math.round(sourcePoint.x / genConfig.cellSize + borderOffset - 0.5);
    const startY = Math.round(sourcePoint.y / genConfig.cellSize + borderOffset - 0.5);
    
    if (!isInBounds(startX, startY, config)) continue;
    
    const edge = Math.floor(rng() * 4);
    let targetX: number, targetY: number;
    
    switch (edge) {
      case 0: targetX = startX + Math.floor(rng() * 6 - 3); targetY = 0; break;
      case 1: targetX = config.cols - 1; targetY = startY + Math.floor(rng() * 6 - 3); break;
      case 2: targetX = startX + Math.floor(rng() * 6 - 3); targetY = config.rows - 1; break;
      case 3: targetX = 0; targetY = startY + Math.floor(rng() * 6 - 3); break;
      default: targetX = 0; targetY = 0;
    }
    
    targetX = Math.max(0, Math.min(config.cols - 1, targetX));
    targetY = Math.max(0, Math.min(config.rows - 1, targetY));
    
    const gridPath = findPath(grid, startX, startY, targetX, targetY, config, rng);
    
    if (gridPath && gridPath.length >= 3) {
      const smoothedPath = smoothPath(gridPath);
      const pixelPath = smoothedPath.map(p => 
        gridToPixel(p.x - borderOffset, p.y - borderOffset, genConfig.cellSize)
      );
      
      // Connect to source point
      pixelPath[0] = { x: sourcePoint.x, y: sourcePoint.y };
      
      markPathOccupied(grid, gridPath, config);
      
      edgeTraces.push({
        id: generateId("edge-trace", edgeTraces.length),
        points: pixelPath,
        width: genConfig.traceWidth,
      });
    }
  }
  
  return edgeTraces;
}

// Place vias
function placeVias(
  grid: Cell[][],
  traces: Trace[],
  config: GridConfig,
  genConfig: GeneratorConfig,
  rng: SeededRandom,
  borderOffset: number
): Via[] {
  const vias: Via[] = [];
  const viaRadius = genConfig.cellSize * 0.15;
  const usedPositions = new Set<string>();
  
  for (const trace of traces) {
    for (let i = 1; i < trace.points.length - 1; i++) {
      if (rng() < genConfig.viaChance) {
        const point = trace.points[i];
        const key = `${Math.round(point.x)},${Math.round(point.y)}`;
        
        if (!usedPositions.has(key)) {
          usedPositions.add(key);
          vias.push({
            id: generateId("via", vias.length),
            x: point.x,
            y: point.y,
            outerRadius: viaRadius,
            innerRadius: viaRadius * 0.4,
          });
          
          const gridX = Math.floor(point.x / genConfig.cellSize) + borderOffset;
          const gridY = Math.floor(point.y / genConfig.cellSize) + borderOffset;
          if (isInBounds(gridX, gridY, config)) {
            markCellAsVia(grid, gridX, gridY);
          }
        }
      }
    }
  }
  
  return vias;
}

// Main generation function
export function generateCircuitBoard(
  width: number,
  height: number,
  options: Partial<GeneratorConfig> = {},
  seed?: number
): CircuitData {
  const genConfig: GeneratorConfig = { ...DEFAULT_CONFIG, ...options };
  const borderOffset = genConfig.borderExtension;
  
  const visibleCols = Math.ceil(width / genConfig.cellSize) + 1;
  const visibleRows = Math.ceil(height / genConfig.cellSize) + 1;
  
  const extendedCols = visibleCols + borderOffset * 2;
  const extendedRows = visibleRows + borderOffset * 2;
  const config = createGridConfig(
    extendedCols * genConfig.cellSize,
    extendedRows * genConfig.cellSize,
    genConfig.cellSize
  );
  config.cols = extendedCols;
  config.rows = extendedRows;
  
  const maxRetries = 15;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const currentSeed = seed !== undefined ? seed + attempt : undefined;
    const rng = (currentSeed !== undefined ? seedrandom(currentSeed.toString()) : seedrandom()) as SeededRandom;
    
    const grid = createGrid(config);
    
    const pinsWithGrid = placePins(grid, config, genConfig, rng, visibleCols, visibleRows, borderOffset);
    
    const { traces, allConnected } = generateConnectedTraces(grid, pinsWithGrid, config, genConfig, rng, borderOffset);
    
    if (!allConnected && attempt < maxRetries - 1) {
      attempt++;
      continue;
    }
    
    const edgeTraces = generateEdgeTraces(grid, traces, config, genConfig, rng, borderOffset, visibleCols, visibleRows);
    
    const allTraces = [...traces, ...edgeTraces];
    const vias = placeVias(grid, allTraces, config, genConfig, rng, borderOffset);
    
    const pins: Pin[] = pinsWithGrid.map(({ gridX, gridY, ...pin }) => pin);
    
    return {
      pins,
      traces,
      vias,
      decorativeTraces: edgeTraces,
    };
  }
  
  // Fallback
  const rng = (seed !== undefined ? seedrandom(seed.toString()) : seedrandom()) as SeededRandom;
  const grid = createGrid(config);
  const pinsWithGrid = placePins(grid, config, genConfig, rng, visibleCols, visibleRows, borderOffset);
  const { traces } = generateConnectedTraces(grid, pinsWithGrid, config, genConfig, rng, borderOffset);
  const edgeTraces = generateEdgeTraces(grid, traces, config, genConfig, rng, borderOffset, visibleCols, visibleRows);
  const allTraces = [...traces, ...edgeTraces];
  const vias = placeVias(grid, allTraces, config, genConfig, rng, borderOffset);
  const pins: Pin[] = pinsWithGrid.map(({ gridX, gridY, ...pin }) => pin);
  
  return {
    pins,
    traces,
    vias,
    decorativeTraces: edgeTraces,
  };
}

// Convert trace to SVG path
export function traceToSvgPath(trace: Trace): string {
  if (trace.points.length < 2) return "";
  
  const [first, ...rest] = trace.points;
  let path = `M ${first.x} ${first.y}`;
  
  for (const point of rest) {
    path += ` L ${point.x} ${point.y}`;
  }
  
  return path;
}
