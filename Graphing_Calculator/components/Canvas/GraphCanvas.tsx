"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Viewport, Equation, DetectedPoint, EQUATION_COLORS } from "@/types/graph";
import {
  mathToCanvas,
  canvasToMath,
  calculateGridSpacing,
  formatNumber,
} from "@/lib/transforms";
import { parseEquation, evaluate, MATH_CONSTANTS } from "@/lib/mathParser";

interface GraphCanvasProps {
  equations: Equation[];
  viewport: Viewport;
  variableScope: Record<string, number>;
  detectedPoints: DetectedPoint[];
  highlightedPointId: string | null;
  isDragging: boolean;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoom: (factor: number, centerX: number, centerY: number) => void;
  onSetDragging: (isDragging: boolean) => void;
  onSetCanvasSize: (width: number, height: number) => void;
  onHighlightPoint: (id: string | null) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  equations,
  viewport,
  variableScope,
  detectedPoints,
  highlightedPointId,
  isDragging,
  onPan,
  onZoom,
  onSetDragging,
  onSetCanvasSize,
  onHighlightPoint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const [dpr, setDpr] = useState(1);

  // Get device pixel ratio on client side only
  useEffect(() => {
    setDpr(window.devicePixelRatio || 1);
  }, []);

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width: width * dpr, height: height * dpr });
        onSetCanvasSize(width, height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [onSetCanvasSize, dpr]);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvasSize;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with grey background
    ctx.fillStyle = "#3a3a44";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, viewport, width, height);

    // Draw axes
    drawAxes(ctx, viewport, width, height);

    // Draw equations
    for (const equation of equations) {
      if (equation.visible && equation.expression) {
        drawEquation(ctx, equation, viewport, width, height, variableScope);
      }
    }

    // Draw detected points
    for (const point of detectedPoints) {
      const isHighlighted = point.id === highlightedPointId;
      drawPoint(ctx, point, viewport, width, height, isHighlighted);
    }

    // Draw hovered point tooltip handled separately
  }, [canvasSize, equations, viewport, variableScope, detectedPoints, highlightedPointId]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    onSetDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [onSetDragging]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for point hover
    const displayWidth = canvasSize.width / dpr;
    const displayHeight = canvasSize.height / dpr;

    let foundPoint = false;
    for (const point of detectedPoints) {
      const canvasPos = mathToCanvas(
        point.x,
        point.y,
        viewport,
        displayWidth,
        displayHeight
      );
      const dist = Math.hypot(canvasPos.x - x, canvasPos.y - y);
      if (dist < 10) {
        setHoveredPoint({
          x: canvasPos.x,
          y: canvasPos.y,
          label: `(${formatNumber(point.x)}, ${formatNumber(point.y)})`,
        });
        onHighlightPoint(point.id);
        foundPoint = true;
        break;
      }
    }

    if (!foundPoint) {
      setHoveredPoint(null);
      onHighlightPoint(null);
    }

    // Handle dragging
    if (isDragging) {
      const deltaX = e.clientX - lastPosRef.current.x;
      const deltaY = e.clientY - lastPosRef.current.y;
      onPan(deltaX, deltaY);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [isDragging, onPan, detectedPoints, viewport, canvasSize, onHighlightPoint]);

  const handleMouseUp = useCallback(() => {
    onSetDragging(false);
  }, [onSetDragging]);

  const handleMouseLeave = useCallback(() => {
    onSetDragging(false);
    setHoveredPoint(null);
    onHighlightPoint(null);
  }, [onSetDragging, onHighlightPoint]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const displayWidth = canvasSize.width / dpr;
    const displayHeight = canvasSize.height / dpr;

    // Convert to math coordinates
    const mathPos = canvasToMath(x, y, viewport, displayWidth, displayHeight);

    // Zoom factor
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    onZoom(factor, mathPos.x, mathPos.y);
  }, [viewport, canvasSize, onZoom, dpr]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      onSetDragging(true);
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist: Math.hypot(dx, dy),
      };
    }
  }, [onSetDragging]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      onPan(deltaX, deltaY);
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      const displayWidth = canvasSize.width / dpr;
      const displayHeight = canvasSize.height / dpr;

      const mathPos = canvasToMath(centerX, centerY, viewport, displayWidth, displayHeight);
      const factor = newDist / touchStartRef.current.dist;
      onZoom(factor, mathPos.x, mathPos.y);

      touchStartRef.current = {
        ...touchStartRef.current,
        dist: newDist,
      };
    }
  }, [isDragging, onPan, onZoom, viewport, canvasSize, dpr]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    onSetDragging(false);
  }, [onSetDragging]);

  const displayWidth = canvasSize.width / dpr;
  const displayHeight = canvasSize.height / dpr;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: displayWidth,
          height: displayHeight,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="tooltip"
          style={{
            left: hoveredPoint.x + 10,
            top: hoveredPoint.y - 30,
          }}
        >
          {hoveredPoint.label}
        </div>
      )}
    </div>
  );
};

// Draw grid lines
function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  width: number,
  height: number
) {
  const { major, minor } = calculateGridSpacing(viewport);
  const { xMin, xMax, yMin, yMax } = viewport;

  ctx.strokeStyle = "#4a4a58";
  ctx.lineWidth = 1;

  // Minor grid lines
  ctx.globalAlpha = 0.3;
  
  // Vertical minor lines
  let x = Math.ceil(xMin / minor) * minor;
  while (x <= xMax) {
    const canvasX = mathToCanvas(x, 0, viewport, width, height).x;
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, height);
    ctx.stroke();
    x += minor;
  }

  // Horizontal minor lines
  let y = Math.ceil(yMin / minor) * minor;
  while (y <= yMax) {
    const canvasY = mathToCanvas(0, y, viewport, width, height).y;
    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(width, canvasY);
    ctx.stroke();
    y += minor;
  }

  // Major grid lines
  ctx.globalAlpha = 0.5;
  
  // Vertical major lines
  x = Math.ceil(xMin / major) * major;
  while (x <= xMax) {
    const canvasX = mathToCanvas(x, 0, viewport, width, height).x;
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, height);
    ctx.stroke();
    x += major;
  }

  // Horizontal major lines
  y = Math.ceil(yMin / major) * major;
  while (y <= yMax) {
    const canvasY = mathToCanvas(0, y, viewport, width, height).y;
    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(width, canvasY);
    ctx.stroke();
    y += major;
  }

  ctx.globalAlpha = 1;
}

// Draw axes with labels
function drawAxes(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  width: number,
  height: number
) {
  const { major } = calculateGridSpacing(viewport);
  const { xMin, xMax, yMin, yMax } = viewport;

  // Draw axes
  ctx.strokeStyle = "#6a6a7a";
  ctx.lineWidth = 2;

  // Y-axis (if visible)
  if (xMin <= 0 && xMax >= 0) {
    const axisX = mathToCanvas(0, 0, viewport, width, height).x;
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, height);
    ctx.stroke();
  }

  // X-axis (if visible)
  if (yMin <= 0 && yMax >= 0) {
    const axisY = mathToCanvas(0, 0, viewport, width, height).y;
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();
  }

  // Draw tick labels
  ctx.fillStyle = "#9898a8";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // X-axis labels
  if (yMin <= 0 && yMax >= 0) {
    const axisY = mathToCanvas(0, 0, viewport, width, height).y;
    let x = Math.ceil(xMin / major) * major;
    while (x <= xMax) {
      if (Math.abs(x) > major * 0.01) { // Skip zero
        const canvasX = mathToCanvas(x, 0, viewport, width, height).x;
        ctx.fillText(formatNumber(x), canvasX, axisY + 5);
      }
      x += major;
    }
  }

  // Y-axis labels
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  if (xMin <= 0 && xMax >= 0) {
    const axisX = mathToCanvas(0, 0, viewport, width, height).x;
    let y = Math.ceil(yMin / major) * major;
    while (y <= yMax) {
      if (Math.abs(y) > major * 0.01) { // Skip zero
        const canvasY = mathToCanvas(0, y, viewport, width, height).y;
        ctx.fillText(formatNumber(y), axisX - 5, canvasY);
      }
      y += major;
    }
  }

  // Origin label
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    const origin = mathToCanvas(0, 0, viewport, width, height);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", origin.x - 5, origin.y + 5);
  }
}

// Draw a single equation
function drawEquation(
  ctx: CanvasRenderingContext2D,
  equation: Equation,
  viewport: Viewport,
  width: number,
  height: number,
  variableScope: Record<string, number>
) {
  const parsed = parseEquation(equation.expression);
  if (parsed.error) return;

  ctx.strokeStyle = equation.color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const scope = { ...MATH_CONSTANTS, ...variableScope };

  switch (parsed.type) {
    case "explicit":
      if (parsed.compiledExpr) {
        drawExplicitCurve(ctx, parsed.compiledExpr, viewport, width, height, scope);
      }
      break;

    case "implicit":
      if (parsed.compiledLeft && parsed.compiledRight) {
        drawImplicitCurve(
          ctx,
          parsed.compiledLeft,
          parsed.compiledRight,
          viewport,
          width,
          height,
          scope
        );
      }
      break;

    case "parametric":
      if (parsed.compiledExprX && parsed.compiledExprY) {
        drawParametricCurve(
          ctx,
          parsed.compiledExprX,
          parsed.compiledExprY,
          viewport,
          width,
          height,
          scope
        );
      }
      break;

    case "polar":
      if (parsed.compiledExpr) {
        drawPolarCurve(ctx, parsed.compiledExpr, viewport, width, height, scope);
      }
      break;

    case "inequality":
      if (parsed.compiledExpr && parsed.inequalityType) {
        drawInequality(
          ctx,
          parsed.compiledExpr,
          parsed.inequalityType,
          viewport,
          width,
          height,
          scope,
          equation.color
        );
      }
      break;
  }
}

// Draw explicit y = f(x) curve
function drawExplicitCurve(
  ctx: CanvasRenderingContext2D,
  compiled: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  width: number,
  height: number,
  scope: Record<string, number>
) {
  const { xMin, xMax } = viewport;
  const step = (xMax - xMin) / width * 2; // 2 pixels per step for smoothness
  
  ctx.beginPath();
  let isDrawing = false;
  let prevY: number | null = null;

  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluate(compiled as any, { ...scope, x });
    
    if (!isFinite(y)) {
      isDrawing = false;
      prevY = null;
      continue;
    }

    // Check for discontinuity
    if (prevY !== null && Math.abs(y - prevY) > (viewport.yMax - viewport.yMin) * 0.5) {
      isDrawing = false;
    }

    const canvasPos = mathToCanvas(x, y, viewport, width, height);

    if (!isDrawing) {
      ctx.moveTo(canvasPos.x, canvasPos.y);
      isDrawing = true;
    } else {
      ctx.lineTo(canvasPos.x, canvasPos.y);
    }
    
    prevY = y;
  }

  ctx.stroke();
}

// Draw implicit F(x,y) = G(x,y) curve using marching squares
function drawImplicitCurve(
  ctx: CanvasRenderingContext2D,
  compiledLeft: { evaluate: (scope: Record<string, number>) => number },
  compiledRight: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  width: number,
  height: number,
  scope: Record<string, number>
) {
  const resolution = 200; // Grid resolution
  const { xMin, xMax, yMin, yMax } = viewport;
  const stepX = (xMax - xMin) / resolution;
  const stepY = (yMax - yMin) / resolution;

  // Evaluate F(x,y) - G(x,y) at grid points
  const grid: number[][] = [];
  for (let i = 0; i <= resolution; i++) {
    grid[i] = [];
    const y = yMax - i * stepY;
    for (let j = 0; j <= resolution; j++) {
      const x = xMin + j * stepX;
      const left = evaluate(compiledLeft as any, { ...scope, x, y });
      const right = evaluate(compiledRight as any, { ...scope, x, y });
      grid[i][j] = left - right;
    }
  }

  // Marching squares
  ctx.beginPath();

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const v00 = grid[i][j];
      const v10 = grid[i][j + 1];
      const v01 = grid[i + 1][j];
      const v11 = grid[i + 1][j + 1];

      // Skip if all same sign or any NaN
      if (!isFinite(v00) || !isFinite(v10) || !isFinite(v01) || !isFinite(v11)) continue;
      
      const index =
        (v00 > 0 ? 1 : 0) |
        (v10 > 0 ? 2 : 0) |
        (v01 > 0 ? 4 : 0) |
        (v11 > 0 ? 8 : 0);

      if (index === 0 || index === 15) continue;

      const x0 = xMin + j * stepX;
      const x1 = x0 + stepX;
      const y0 = yMax - i * stepY;
      const y1 = y0 - stepY;

      // Interpolate edge crossings
      const edges: { x: number; y: number }[] = [];

      // Top edge
      if ((index & 1) !== (index & 2) >> 1) {
        const t = v00 / (v00 - v10);
        edges.push({ x: x0 + t * stepX, y: y0 });
      }
      // Right edge
      if ((index & 2) >> 1 !== (index & 8) >> 3) {
        const t = v10 / (v10 - v11);
        edges.push({ x: x1, y: y0 - t * stepY });
      }
      // Bottom edge
      if ((index & 4) >> 2 !== (index & 8) >> 3) {
        const t = v01 / (v01 - v11);
        edges.push({ x: x0 + t * stepX, y: y1 });
      }
      // Left edge
      if ((index & 1) !== (index & 4) >> 2) {
        const t = v00 / (v00 - v01);
        edges.push({ x: x0, y: y0 - t * stepY });
      }

      // Draw line segments
      if (edges.length >= 2) {
        const p0 = mathToCanvas(edges[0].x, edges[0].y, viewport, width, height);
        const p1 = mathToCanvas(edges[1].x, edges[1].y, viewport, width, height);
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);

        if (edges.length === 4) {
          const p2 = mathToCanvas(edges[2].x, edges[2].y, viewport, width, height);
          const p3 = mathToCanvas(edges[3].x, edges[3].y, viewport, width, height);
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
        }
      }
    }
  }

  ctx.stroke();
}

// Draw parametric curve
function drawParametricCurve(
  ctx: CanvasRenderingContext2D,
  compiledX: { evaluate: (scope: Record<string, number>) => number },
  compiledY: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  width: number,
  height: number,
  scope: Record<string, number>
) {
  const steps = 1000;
  const tMin = -10;
  const tMax = 10;
  const dt = (tMax - tMin) / steps;

  ctx.beginPath();
  let isDrawing = false;

  for (let t = tMin; t <= tMax; t += dt) {
    const x = evaluate(compiledX as any, { ...scope, t });
    const y = evaluate(compiledY as any, { ...scope, t });

    if (!isFinite(x) || !isFinite(y)) {
      isDrawing = false;
      continue;
    }

    const canvasPos = mathToCanvas(x, y, viewport, width, height);

    if (!isDrawing) {
      ctx.moveTo(canvasPos.x, canvasPos.y);
      isDrawing = true;
    } else {
      ctx.lineTo(canvasPos.x, canvasPos.y);
    }
  }

  ctx.stroke();
}

// Draw polar curve
function drawPolarCurve(
  ctx: CanvasRenderingContext2D,
  compiled: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  width: number,
  height: number,
  scope: Record<string, number>
) {
  const steps = 1000;
  const thetaMin = 0;
  const thetaMax = 4 * Math.PI;
  const dTheta = (thetaMax - thetaMin) / steps;

  ctx.beginPath();
  let isDrawing = false;

  for (let theta = thetaMin; theta <= thetaMax; theta += dTheta) {
    const r = evaluate(compiled as any, { ...scope, theta });

    if (!isFinite(r)) {
      isDrawing = false;
      continue;
    }

    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);

    const canvasPos = mathToCanvas(x, y, viewport, width, height);

    if (!isDrawing) {
      ctx.moveTo(canvasPos.x, canvasPos.y);
      isDrawing = true;
    } else {
      ctx.lineTo(canvasPos.x, canvasPos.y);
    }
  }

  ctx.stroke();
}

// Draw inequality region
function drawInequality(
  ctx: CanvasRenderingContext2D,
  compiled: { evaluate: (scope: Record<string, number>) => number },
  inequalityType: string,
  viewport: Viewport,
  width: number,
  height: number,
  scope: Record<string, number>,
  color: string
) {
  const resolution = 4; // Pixel resolution for shading
  const { xMin, xMax, yMin, yMax } = viewport;

  // Parse color and add alpha
  const rgbaColor = hexToRgba(color, 0.3);
  ctx.fillStyle = rgbaColor;

  for (let canvasY = 0; canvasY < height; canvasY += resolution) {
    for (let canvasX = 0; canvasX < width; canvasX += resolution) {
      const { x, y } = canvasToMath(canvasX, canvasY, viewport, width, height);
      const fValue = evaluate(compiled as any, { ...scope, x });

      if (!isFinite(fValue)) continue;

      let inRegion = false;
      switch (inequalityType) {
        case ">":
          inRegion = y > fValue;
          break;
        case ">=":
          inRegion = y >= fValue;
          break;
        case "<":
          inRegion = y < fValue;
          break;
        case "<=":
          inRegion = y <= fValue;
          break;
      }

      if (inRegion) {
        ctx.fillRect(canvasX, canvasY, resolution, resolution);
      }
    }
  }

  // Also draw the boundary curve
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  drawExplicitCurve(ctx, compiled, viewport, width, height, scope);
}

// Draw detected point
function drawPoint(
  ctx: CanvasRenderingContext2D,
  point: DetectedPoint,
  viewport: Viewport,
  width: number,
  height: number,
  isHighlighted: boolean
) {
  const canvasPos = mathToCanvas(point.x, point.y, viewport, width, height);
  
  const radius = isHighlighted ? 8 : 6;
  
  ctx.beginPath();
  ctx.arc(canvasPos.x, canvasPos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = isHighlighted ? "#ffffff" : "#e8e8f0";
  ctx.fill();
  ctx.strokeStyle = "#2d70f0";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Helper to convert hex color to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
