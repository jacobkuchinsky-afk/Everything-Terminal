import { Viewport } from "@/types/graph";

// Convert math coordinates to canvas pixel coordinates
export function mathToCanvas(
  mathX: number,
  mathY: number,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const { xMin, xMax, yMin, yMax } = viewport;
  
  const x = ((mathX - xMin) / (xMax - xMin)) * canvasWidth;
  const y = ((yMax - mathY) / (yMax - yMin)) * canvasHeight; // Flip y-axis
  
  return { x, y };
}

// Convert canvas pixel coordinates to math coordinates
export function canvasToMath(
  canvasX: number,
  canvasY: number,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const { xMin, xMax, yMin, yMax } = viewport;
  
  const x = xMin + (canvasX / canvasWidth) * (xMax - xMin);
  const y = yMax - (canvasY / canvasHeight) * (yMax - yMin); // Flip y-axis
  
  return { x, y };
}

// Calculate appropriate grid spacing based on zoom level
export function calculateGridSpacing(viewport: Viewport): { major: number; minor: number } {
  const range = Math.max(viewport.xMax - viewport.xMin, viewport.yMax - viewport.yMin);
  
  // Find a nice grid spacing (1, 2, 5 multiples of powers of 10)
  const targetDivisions = 10;
  const rawSpacing = range / targetDivisions;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawSpacing)));
  
  const normalized = rawSpacing / magnitude;
  let major: number;
  
  if (normalized < 1.5) {
    major = magnitude;
  } else if (normalized < 3.5) {
    major = 2 * magnitude;
  } else if (normalized < 7.5) {
    major = 5 * magnitude;
  } else {
    major = 10 * magnitude;
  }
  
  return {
    major,
    minor: major / 5,
  };
}

// Apply zoom to viewport centered at a point
export function zoomViewport(
  viewport: Viewport,
  factor: number,
  centerX: number,
  centerY: number
): Viewport {
  const { xMin, xMax, yMin, yMax } = viewport;
  
  // Calculate distances from center to edges
  const leftDist = centerX - xMin;
  const rightDist = xMax - centerX;
  const topDist = yMax - centerY;
  const bottomDist = centerY - yMin;
  
  // Apply zoom factor (factor > 1 zooms in, < 1 zooms out)
  return {
    xMin: centerX - leftDist / factor,
    xMax: centerX + rightDist / factor,
    yMin: centerY - bottomDist / factor,
    yMax: centerY + topDist / factor,
  };
}

// Pan viewport by pixel delta
export function panViewport(
  viewport: Viewport,
  deltaX: number,
  deltaY: number,
  canvasWidth: number,
  canvasHeight: number
): Viewport {
  const { xMin, xMax, yMin, yMax } = viewport;
  
  // Convert pixel delta to math units
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  
  const mathDeltaX = (deltaX / canvasWidth) * xRange;
  const mathDeltaY = (deltaY / canvasHeight) * yRange;
  
  return {
    xMin: xMin - mathDeltaX,
    xMax: xMax - mathDeltaX,
    yMin: yMin + mathDeltaY, // Flip because canvas y is inverted
    yMax: yMax + mathDeltaY,
  };
}

// Get pixel-to-math ratio (for determining curve resolution)
export function getPixelRatio(
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: (viewport.xMax - viewport.xMin) / canvasWidth,
    y: (viewport.yMax - viewport.yMin) / canvasHeight,
  };
}

// Check if a point is within viewport bounds (with some padding)
export function isInViewport(
  x: number,
  y: number,
  viewport: Viewport,
  padding: number = 0
): boolean {
  const { xMin, xMax, yMin, yMax } = viewport;
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  
  return (
    x >= xMin - padding * xRange &&
    x <= xMax + padding * xRange &&
    y >= yMin - padding * yRange &&
    y <= yMax + padding * yRange
  );
}

// Format number for display (with appropriate precision)
export function formatNumber(num: number): string {
  if (num === 0) return "0";
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000 || absNum < 0.001) {
    return num.toExponential(2);
  }
  
  if (absNum >= 100) {
    return num.toFixed(0);
  }
  
  if (absNum >= 10) {
    return num.toFixed(1);
  }
  
  if (absNum >= 1) {
    return num.toFixed(2);
  }
  
  return num.toFixed(3);
}

// Calculate viewport that fits equation bounds with padding
export function fitViewport(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  padding: number = 0.1
): Viewport {
  const xRange = bounds.maxX - bounds.minX;
  const yRange = bounds.maxY - bounds.minY;
  
  return {
    xMin: bounds.minX - xRange * padding,
    xMax: bounds.maxX + xRange * padding,
    yMin: bounds.minY - yRange * padding,
    yMax: bounds.maxY + yRange * padding,
  };
}
