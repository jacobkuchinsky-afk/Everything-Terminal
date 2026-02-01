"use client";

import { useMemo } from "react";
import { Equation, Viewport, DetectedPoint, generateId } from "@/types/graph";
import { parseEquation, evaluate, MATH_CONSTANTS } from "@/lib/mathParser";

// Find roots using bisection method
function findRoots(
  compiled: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  scope: Record<string, number>
): { x: number; y: number }[] {
  const roots: { x: number; y: number }[] = [];
  const { xMin, xMax } = viewport;
  const steps = 200;
  const dx = (xMax - xMin) / steps;
  const tolerance = dx * 0.001;

  let prevX = xMin;
  let prevY = evaluate(compiled as any, { ...scope, x: prevX });

  for (let i = 1; i <= steps; i++) {
    const x = xMin + i * dx;
    const y = evaluate(compiled as any, { ...scope, x });

    // Check for sign change (root crossing)
    if (isFinite(prevY) && isFinite(y) && prevY * y < 0) {
      // Bisection to find more precise root
      let lo = prevX;
      let hi = x;
      let mid = (lo + hi) / 2;

      for (let j = 0; j < 20; j++) {
        mid = (lo + hi) / 2;
        const midY = evaluate(compiled as any, { ...scope, x: mid });

        if (Math.abs(midY) < tolerance) break;

        if (prevY * midY < 0) {
          hi = mid;
        } else {
          lo = mid;
          prevY = midY;
        }
      }

      // Check if we already have a root nearby
      const isDuplicate = roots.some((r) => Math.abs(r.x - mid) < dx);
      if (!isDuplicate) {
        roots.push({ x: mid, y: 0 });
      }
    }

    prevX = x;
    prevY = y;
  }

  return roots;
}

// Find local extrema using derivative sign change
function findExtrema(
  compiled: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  scope: Record<string, number>
): { x: number; y: number; type: "maximum" | "minimum" }[] {
  const extrema: { x: number; y: number; type: "maximum" | "minimum" }[] = [];
  const { xMin, xMax, yMin, yMax } = viewport;
  const steps = 200;
  const dx = (xMax - xMin) / steps;
  const h = dx * 0.01; // Small h for derivative approximation

  for (let i = 1; i < steps - 1; i++) {
    const x = xMin + i * dx;
    const y = evaluate(compiled as any, { ...scope, x });

    if (!isFinite(y) || y < yMin || y > yMax) continue;

    // Approximate derivative
    const yLeft = evaluate(compiled as any, { ...scope, x: x - h });
    const yRight = evaluate(compiled as any, { ...scope, x: x + h });

    if (!isFinite(yLeft) || !isFinite(yRight)) continue;

    const derivLeft = (y - yLeft) / h;
    const derivRight = (yRight - y) / h;

    // Check for sign change in derivative
    if (derivLeft > 0 && derivRight < 0) {
      // Maximum - refine with golden section search
      const refined = refineExtremum(compiled, x - dx, x + dx, scope, "max");
      if (refined && refined.y >= yMin && refined.y <= yMax) {
        extrema.push({ ...refined, type: "maximum" });
      }
    } else if (derivLeft < 0 && derivRight > 0) {
      // Minimum
      const refined = refineExtremum(compiled, x - dx, x + dx, scope, "min");
      if (refined && refined.y >= yMin && refined.y <= yMax) {
        extrema.push({ ...refined, type: "minimum" });
      }
    }
  }

  return extrema;
}

// Refine extremum location using golden section search
function refineExtremum(
  compiled: { evaluate: (scope: Record<string, number>) => number },
  a: number,
  b: number,
  scope: Record<string, number>,
  type: "max" | "min"
): { x: number; y: number } | null {
  const phi = (1 + Math.sqrt(5)) / 2;
  const tolerance = (b - a) * 0.0001;

  let x1 = b - (b - a) / phi;
  let x2 = a + (b - a) / phi;
  let f1 = evaluate(compiled as any, { ...scope, x: x1 });
  let f2 = evaluate(compiled as any, { ...scope, x: x2 });

  if (!isFinite(f1) || !isFinite(f2)) return null;

  for (let i = 0; i < 30 && (b - a) > tolerance; i++) {
    if ((type === "max" && f1 > f2) || (type === "min" && f1 < f2)) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = b - (b - a) / phi;
      f1 = evaluate(compiled as any, { ...scope, x: x1 });
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = a + (b - a) / phi;
      f2 = evaluate(compiled as any, { ...scope, x: x2 });
    }

    if (!isFinite(f1) || !isFinite(f2)) return null;
  }

  const x = (a + b) / 2;
  const y = evaluate(compiled as any, { ...scope, x });

  return isFinite(y) ? { x, y } : null;
}

// Find intersections between two explicit curves
function findIntersections(
  compiled1: { evaluate: (scope: Record<string, number>) => number },
  compiled2: { evaluate: (scope: Record<string, number>) => number },
  viewport: Viewport,
  scope: Record<string, number>
): { x: number; y: number }[] {
  const intersections: { x: number; y: number }[] = [];
  const { xMin, xMax } = viewport;
  const steps = 200;
  const dx = (xMax - xMin) / steps;
  const tolerance = dx * 0.001;

  let prevX = xMin;
  let prevDiff = evaluate(compiled1 as any, { ...scope, x: prevX }) -
                 evaluate(compiled2 as any, { ...scope, x: prevX });

  for (let i = 1; i <= steps; i++) {
    const x = xMin + i * dx;
    const y1 = evaluate(compiled1 as any, { ...scope, x });
    const y2 = evaluate(compiled2 as any, { ...scope, x });
    const diff = y1 - y2;

    // Check for sign change
    if (isFinite(prevDiff) && isFinite(diff) && prevDiff * diff < 0) {
      // Bisection
      let lo = prevX;
      let hi = x;
      let mid = (lo + hi) / 2;

      for (let j = 0; j < 20; j++) {
        mid = (lo + hi) / 2;
        const midY1 = evaluate(compiled1 as any, { ...scope, x: mid });
        const midY2 = evaluate(compiled2 as any, { ...scope, x: mid });
        const midDiff = midY1 - midY2;

        if (Math.abs(midDiff) < tolerance) break;

        if (prevDiff * midDiff < 0) {
          hi = mid;
        } else {
          lo = mid;
          prevDiff = midDiff;
        }
      }

      const y = evaluate(compiled1 as any, { ...scope, x: mid });
      
      // Check if we already have an intersection nearby
      const isDuplicate = intersections.some((p) => Math.abs(p.x - mid) < dx);
      if (!isDuplicate && isFinite(y)) {
        intersections.push({ x: mid, y });
      }
    }

    prevX = x;
    prevDiff = diff;
  }

  return intersections;
}

// Main hook
export function usePointDetection(
  equations: Equation[],
  viewport: Viewport,
  variableScope: Record<string, number>
): DetectedPoint[] {
  return useMemo(() => {
    const points: DetectedPoint[] = [];
    const scope = { ...MATH_CONSTANTS, ...variableScope };

    // Get visible explicit equations
    const visibleExplicit = equations.filter(
      (eq) => eq.visible && eq.expression && eq.type === "explicit"
    );

    // Parse equations
    const parsedEquations = visibleExplicit.map((eq) => ({
      equation: eq,
      parsed: parseEquation(eq.expression),
    })).filter((item) => item.parsed.compiledExpr && !item.parsed.error);

    // Find roots for each equation
    for (const { equation, parsed } of parsedEquations) {
      if (!parsed.compiledExpr) continue;

      const roots = findRoots(parsed.compiledExpr, viewport, scope);
      for (const root of roots) {
        points.push({
          id: generateId(),
          type: "root",
          x: root.x,
          y: root.y,
          equationIds: [equation.id],
        });
      }

      // Find extrema
      const extrema = findExtrema(parsed.compiledExpr, viewport, scope);
      for (const ext of extrema) {
        points.push({
          id: generateId(),
          type: ext.type,
          x: ext.x,
          y: ext.y,
          equationIds: [equation.id],
        });
      }
    }

    // Find intersections between pairs of equations
    for (let i = 0; i < parsedEquations.length; i++) {
      for (let j = i + 1; j < parsedEquations.length; j++) {
        const { equation: eq1, parsed: parsed1 } = parsedEquations[i];
        const { equation: eq2, parsed: parsed2 } = parsedEquations[j];

        if (!parsed1.compiledExpr || !parsed2.compiledExpr) continue;

        const intersections = findIntersections(
          parsed1.compiledExpr,
          parsed2.compiledExpr,
          viewport,
          scope
        );

        for (const intersection of intersections) {
          // Check if in viewport
          if (
            intersection.x >= viewport.xMin &&
            intersection.x <= viewport.xMax &&
            intersection.y >= viewport.yMin &&
            intersection.y <= viewport.yMax
          ) {
            points.push({
              id: generateId(),
              type: "intersection",
              x: intersection.x,
              y: intersection.y,
              equationIds: [eq1.id, eq2.id],
            });
          }
        }
      }
    }

    // Limit total points to prevent performance issues
    return points.slice(0, 50);
  }, [equations, viewport, variableScope]);
}
