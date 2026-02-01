"use client";

import { useReducer, useCallback, useMemo } from "react";
import {
  GraphState,
  GraphAction,
  Equation,
  Variable,
  Viewport,
  DetectedPoint,
  DEFAULT_VIEWPORT,
  DEFAULT_VARIABLE,
  EQUATION_COLORS,
  generateId,
  getNextColor,
} from "@/types/graph";
import { parseEquation, isVariableDefinition } from "@/lib/mathParser";
import { panViewport, zoomViewport } from "@/lib/transforms";

// Initial state
const initialState: GraphState = {
  equations: [
    {
      id: generateId(),
      expression: "",
      type: "explicit",
      color: EQUATION_COLORS[0],
      visible: true,
    },
  ],
  variables: [],
  viewport: DEFAULT_VIEWPORT,
  detectedPoints: [],
  selectedEquationId: null,
  highlightedPointId: null,
  isDragging: false,
  canvasSize: { width: 800, height: 600 },
};

// Reducer function
function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case "ADD_EQUATION": {
      const usedColors = state.equations.map((eq) => eq.color);
      const newEquation: Equation = {
        id: generateId(),
        expression: "",
        type: "explicit",
        color: getNextColor(usedColors),
        visible: true,
      };
      return {
        ...state,
        equations: [...state.equations, newEquation],
      };
    }

    case "UPDATE_EQUATION": {
      return {
        ...state,
        equations: state.equations.map((eq) =>
          eq.id === action.id ? { ...eq, ...action.updates } : eq
        ),
      };
    }

    case "DELETE_EQUATION": {
      const newEquations = state.equations.filter((eq) => eq.id !== action.id);
      // Ensure at least one equation exists
      if (newEquations.length === 0) {
        newEquations.push({
          id: generateId(),
          expression: "",
          type: "explicit",
          color: EQUATION_COLORS[0],
          visible: true,
        });
      }
      return {
        ...state,
        equations: newEquations,
        selectedEquationId:
          state.selectedEquationId === action.id ? null : state.selectedEquationId,
      };
    }

    case "REORDER_EQUATIONS": {
      const newEquations = [...state.equations];
      const [removed] = newEquations.splice(action.fromIndex, 1);
      newEquations.splice(action.toIndex, 0, removed);
      return {
        ...state,
        equations: newEquations,
      };
    }

    case "ADD_VARIABLE": {
      // Check if variable already exists
      if (state.variables.some((v) => v.name === action.name)) {
        return state;
      }
      const newVariable: Variable = {
        id: generateId(),
        name: action.name,
        value: action.value,
        ...DEFAULT_VARIABLE,
      };
      return {
        ...state,
        variables: [...state.variables, newVariable],
      };
    }

    case "UPDATE_VARIABLE": {
      return {
        ...state,
        variables: state.variables.map((v) =>
          v.id === action.id ? { ...v, ...action.updates } : v
        ),
      };
    }

    case "DELETE_VARIABLE": {
      return {
        ...state,
        variables: state.variables.filter((v) => v.id !== action.id),
      };
    }

    case "SET_VIEWPORT": {
      return {
        ...state,
        viewport: action.viewport,
      };
    }

    case "PAN": {
      const newViewport = panViewport(
        state.viewport,
        action.deltaX,
        action.deltaY,
        state.canvasSize.width,
        state.canvasSize.height
      );
      return {
        ...state,
        viewport: newViewport,
      };
    }

    case "ZOOM": {
      const newViewport = zoomViewport(
        state.viewport,
        action.factor,
        action.centerX,
        action.centerY
      );
      return {
        ...state,
        viewport: newViewport,
      };
    }

    case "RESET_VIEWPORT": {
      return {
        ...state,
        viewport: DEFAULT_VIEWPORT,
      };
    }

    case "SET_DETECTED_POINTS": {
      return {
        ...state,
        detectedPoints: action.points,
      };
    }

    case "SELECT_EQUATION": {
      return {
        ...state,
        selectedEquationId: action.id,
      };
    }

    case "HIGHLIGHT_POINT": {
      return {
        ...state,
        highlightedPointId: action.id,
      };
    }

    case "SET_DRAGGING": {
      return {
        ...state,
        isDragging: action.isDragging,
      };
    }

    case "SET_CANVAS_SIZE": {
      return {
        ...state,
        canvasSize: { width: action.width, height: action.height },
      };
    }

    default:
      return state;
  }
}

// Main hook
export function useGraphState() {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  // Equation actions
  const addEquation = useCallback(() => {
    dispatch({ type: "ADD_EQUATION" });
  }, []);

  const updateEquation = useCallback(
    (id: string, expression: string) => {
      // Check if this is a variable definition
      const varDef = isVariableDefinition(expression);
      if (varDef) {
        dispatch({ type: "ADD_VARIABLE", name: varDef.name, value: varDef.value });
        dispatch({ type: "DELETE_EQUATION", id });
        return;
      }

      // Parse the equation
      const parsed = parseEquation(expression);
      
      // Auto-add detected variables as sliders
      for (const varName of parsed.variables) {
        if (!state.variables.some((v) => v.name === varName)) {
          dispatch({ type: "ADD_VARIABLE", name: varName, value: 1 });
        }
      }

      dispatch({
        type: "UPDATE_EQUATION",
        id,
        updates: {
          expression,
          type: parsed.type,
          error: parsed.error,
          inequalityType: parsed.inequalityType,
        },
      });
    },
    [state.variables]
  );

  const deleteEquation = useCallback((id: string) => {
    dispatch({ type: "DELETE_EQUATION", id });
  }, []);

  const toggleEquationVisibility = useCallback((id: string) => {
    const equation = state.equations.find((eq) => eq.id === id);
    if (equation) {
      dispatch({
        type: "UPDATE_EQUATION",
        id,
        updates: { visible: !equation.visible },
      });
    }
  }, [state.equations]);

  const setEquationColor = useCallback((id: string, color: typeof EQUATION_COLORS[number]) => {
    dispatch({
      type: "UPDATE_EQUATION",
      id,
      updates: { color },
    });
  }, []);

  const reorderEquations = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_EQUATIONS", fromIndex, toIndex });
  }, []);

  // Variable actions
  const updateVariable = useCallback((id: string, updates: Partial<Variable>) => {
    dispatch({ type: "UPDATE_VARIABLE", id, updates });
  }, []);

  const deleteVariable = useCallback((id: string) => {
    dispatch({ type: "DELETE_VARIABLE", id });
  }, []);

  const setVariableValue = useCallback((id: string, value: number) => {
    dispatch({ type: "UPDATE_VARIABLE", id, updates: { value } });
  }, []);

  const toggleVariableAnimation = useCallback((id: string) => {
    const variable = state.variables.find((v) => v.id === id);
    if (variable) {
      dispatch({
        type: "UPDATE_VARIABLE",
        id,
        updates: { isAnimating: !variable.isAnimating },
      });
    }
  }, [state.variables]);

  // Viewport actions
  const setViewport = useCallback((viewport: Viewport) => {
    dispatch({ type: "SET_VIEWPORT", viewport });
  }, []);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    dispatch({ type: "PAN", deltaX, deltaY });
  }, []);

  const zoom = useCallback((factor: number, centerX: number, centerY: number) => {
    dispatch({ type: "ZOOM", factor, centerX, centerY });
  }, []);

  const resetViewport = useCallback(() => {
    dispatch({ type: "RESET_VIEWPORT" });
  }, []);

  // Point detection
  const setDetectedPoints = useCallback((points: DetectedPoint[]) => {
    dispatch({ type: "SET_DETECTED_POINTS", points });
  }, []);

  const highlightPoint = useCallback((id: string | null) => {
    dispatch({ type: "HIGHLIGHT_POINT", id });
  }, []);

  // Selection
  const selectEquation = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_EQUATION", id });
  }, []);

  // Dragging
  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: "SET_DRAGGING", isDragging });
  }, []);

  // Canvas size
  const setCanvasSize = useCallback((width: number, height: number) => {
    dispatch({ type: "SET_CANVAS_SIZE", width, height });
  }, []);

  // Computed values
  const variableScope = useMemo(() => {
    const scope: Record<string, number> = {
      pi: Math.PI,
      e: Math.E,
    };
    for (const variable of state.variables) {
      scope[variable.name] = variable.value;
    }
    return scope;
  }, [state.variables]);

  return {
    state,
    // Equation actions
    addEquation,
    updateEquation,
    deleteEquation,
    toggleEquationVisibility,
    setEquationColor,
    reorderEquations,
    // Variable actions
    updateVariable,
    deleteVariable,
    setVariableValue,
    toggleVariableAnimation,
    // Viewport actions
    setViewport,
    pan,
    zoom,
    resetViewport,
    // Point detection
    setDetectedPoints,
    highlightPoint,
    // Selection
    selectEquation,
    // Dragging
    setDragging,
    // Canvas
    setCanvasSize,
    // Computed
    variableScope,
  };
}

export type UseGraphStateReturn = ReturnType<typeof useGraphState>;
