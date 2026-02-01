import { create, all, EvalFunction } from "mathjs";
import { EquationType, InequalityType } from "@/types/graph";

// Create mathjs instance with all functions
const math = create(all);

// Cache for compiled expressions
const compiledCache = new Map<string, EvalFunction>();

// Reserved variable names that shouldn't be used for sliders
export const RESERVED_VARS = new Set(["x", "y", "r", "t", "theta", "pi", "e", "i"]);

// Parse result interface
export interface ParseResult {
  type: EquationType;
  compiledExpr?: EvalFunction;
  compiledExprX?: EvalFunction; // For parametric x(t)
  compiledExprY?: EvalFunction; // For parametric y(t)
  compiledLeft?: EvalFunction;  // For implicit left side
  compiledRight?: EvalFunction; // For implicit right side
  inequalityType?: InequalityType;
  error?: string;
  variables: string[]; // Detected variable names (excluding x, y, t, theta)
}

// Detect equation type and parse expression
export function parseEquation(input: string): ParseResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { type: "explicit", variables: [] };
  }

  try {
    // Check for parametric: (expr, expr) or [expr, expr]
    const parametricMatch = trimmed.match(/^\((.+),\s*(.+)\)$|^\[(.+),\s*(.+)\]$/);
    if (parametricMatch) {
      const xExpr = parametricMatch[1] || parametricMatch[3];
      const yExpr = parametricMatch[2] || parametricMatch[4];
      return parseParametric(xExpr, yExpr);
    }

    // Check for polar: r = expr or r=expr
    const polarMatch = trimmed.match(/^r\s*=\s*(.+)$/i);
    if (polarMatch) {
      return parsePolar(polarMatch[1]);
    }

    // Check for inequality: y > expr, y < expr, y >= expr, y <= expr
    const inequalityMatch = trimmed.match(/^y\s*(>=|<=|>|<)\s*(.+)$/i);
    if (inequalityMatch) {
      return parseInequality(inequalityMatch[2], inequalityMatch[1] as InequalityType);
    }

    // Check for explicit: y = expr or f(x) = expr
    const explicitMatch = trimmed.match(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*(.+)$/i);
    if (explicitMatch) {
      return parseExplicit(explicitMatch[1]);
    }

    // Check for implicit equation with = sign (not assignment)
    if (trimmed.includes("=") && !trimmed.match(/^[a-z]\s*=\s*[-\d.]+$/i)) {
      const parts = trimmed.split("=");
      if (parts.length === 2) {
        // Check if it looks like an implicit equation (contains both x and y)
        const hasX = /\bx\b/i.test(trimmed);
        const hasY = /\by\b/i.test(trimmed);
        if (hasX && hasY) {
          return parseImplicit(parts[0], parts[1]);
        }
        // If only has x, treat as explicit
        if (hasX && !hasY) {
          return parseExplicit(parts[1]);
        }
      }
    }

    // Default: try to parse as explicit expression (no y = prefix)
    return parseExplicit(trimmed);

  } catch (error) {
    return {
      type: "explicit",
      error: error instanceof Error ? error.message : "Parse error",
      variables: [],
    };
  }
}

// Parse explicit y = f(x) expression
function parseExplicit(expr: string): ParseResult {
  try {
    const compiled = compileExpression(expr);
    const variables = extractVariables(expr);
    return {
      type: "explicit",
      compiledExpr: compiled,
      variables,
    };
  } catch (error) {
    return {
      type: "explicit",
      error: error instanceof Error ? error.message : "Parse error",
      variables: [],
    };
  }
}

// Parse parametric equations
function parseParametric(xExpr: string, yExpr: string): ParseResult {
  try {
    const compiledX = compileExpression(xExpr);
    const compiledY = compileExpression(yExpr);
    const variables = [
      ...extractVariables(xExpr),
      ...extractVariables(yExpr),
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    
    return {
      type: "parametric",
      compiledExprX: compiledX,
      compiledExprY: compiledY,
      variables,
    };
  } catch (error) {
    return {
      type: "parametric",
      error: error instanceof Error ? error.message : "Parse error",
      variables: [],
    };
  }
}

// Parse polar r = f(theta) expression
function parsePolar(expr: string): ParseResult {
  try {
    const compiled = compileExpression(expr);
    const variables = extractVariables(expr);
    return {
      type: "polar",
      compiledExpr: compiled,
      variables,
    };
  } catch (error) {
    return {
      type: "polar",
      error: error instanceof Error ? error.message : "Parse error",
      variables: [],
    };
  }
}

// Parse inequality y > f(x)
function parseInequality(expr: string, inequalityType: InequalityType): ParseResult {
  try {
    const compiled = compileExpression(expr);
    const variables = extractVariables(expr);
    return {
      type: "inequality",
      compiledExpr: compiled,
      inequalityType,
      variables,
    };
  } catch (error) {
    return {
      type: "inequality",
      error: error instanceof Error ? error.message : "Parse error",
      variables: [],
    };
  }
}

// Parse implicit F(x,y) = G(x,y) equation
function parseImplicit(leftExpr: string, rightExpr: string): ParseResult {
  try {
    const compiledLeft = compileExpression(leftExpr);
    const compiledRight = compileExpression(rightExpr);
    const variables = [
      ...extractVariables(leftExpr),
      ...extractVariables(rightExpr),
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    
    return {
      type: "implicit",
      compiledLeft,
      compiledRight,
      variables,
    };
  } catch (error) {
    return {
      type: "implicit",
      error: error instanceof Error ? error.message : "Parse error",
      variables: [],
    };
  }
}

// Compile and cache expression
function compileExpression(expr: string): EvalFunction {
  const cacheKey = expr;
  if (compiledCache.has(cacheKey)) {
    return compiledCache.get(cacheKey)!;
  }
  
  const compiled = math.compile(expr);
  compiledCache.set(cacheKey, compiled);
  return compiled;
}

// Extract variable names from expression (excluding reserved names)
function extractVariables(expr: string): string[] {
  const variables: string[] = [];
  // Match single letter identifiers that aren't reserved
  const matches = expr.match(/\b([a-z])\b/gi) || [];
  
  for (const match of matches) {
    const lower = match.toLowerCase();
    if (!RESERVED_VARS.has(lower) && !variables.includes(lower)) {
      variables.push(lower);
    }
  }
  
  return variables;
}

// Evaluate compiled expression with given scope
export function evaluate(
  compiled: EvalFunction,
  scope: Record<string, number>
): number {
  try {
    const result = compiled.evaluate(scope);
    if (typeof result === "number" && isFinite(result)) {
      return result;
    }
    return NaN;
  } catch {
    return NaN;
  }
}

// Check if input looks like a variable definition (e.g., "a = 5")
export function isVariableDefinition(input: string): { name: string; value: number } | null {
  const match = input.trim().match(/^([a-z])\s*=\s*([-+]?\d*\.?\d+)$/i);
  if (match) {
    const name = match[1].toLowerCase();
    if (!RESERVED_VARS.has(name)) {
      return { name, value: parseFloat(match[2]) };
    }
  }
  return null;
}

// Math constants for scope
export const MATH_CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

// Clear the compilation cache (useful for memory management)
export function clearCache(): void {
  compiledCache.clear();
}
