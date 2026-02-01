"use client";

import React, { useCallback, useEffect } from "react";
import { useGraphState } from "@/hooks/useGraphState";
import { usePointDetection } from "@/hooks/usePointDetection";
import { Sidebar } from "@/components/graph/Sidebar";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Toolbar } from "@/components/graph/Toolbar";

export const GraphingCalculator: React.FC = () => {
  const {
    state,
    addEquation,
    updateEquation,
    deleteEquation,
    toggleEquationVisibility,
    setEquationColor,
    selectEquation,
    updateVariable,
    deleteVariable,
    setVariableValue,
    toggleVariableAnimation,
    pan,
    zoom,
    resetViewport,
    setDragging,
    setCanvasSize,
    highlightPoint,
    setDetectedPoints,
    variableScope,
  } = useGraphState();

  // Point detection
  const detectedPoints = usePointDetection(
    state.equations,
    state.viewport,
    variableScope
  );

  // Update detected points when they change
  useEffect(() => {
    setDetectedPoints(detectedPoints);
  }, [detectedPoints, setDetectedPoints]);

  // Zoom handlers for toolbar
  const handleZoomIn = useCallback(() => {
    const { xMin, xMax, yMin, yMax } = state.viewport;
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    zoom(1.5, centerX, centerY);
  }, [state.viewport, zoom]);

  const handleZoomOut = useCallback(() => {
    const { xMin, xMax, yMin, yMax } = state.viewport;
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    zoom(0.67, centerX, centerY);
  }, [state.viewport, zoom]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar
        equations={state.equations}
        variables={state.variables}
        detectedPoints={state.detectedPoints}
        selectedEquationId={state.selectedEquationId}
        onAddEquation={addEquation}
        onUpdateEquation={updateEquation}
        onDeleteEquation={deleteEquation}
        onToggleEquationVisibility={toggleEquationVisibility}
        onSetEquationColor={setEquationColor}
        onSelectEquation={selectEquation}
        onUpdateVariable={updateVariable}
        onDeleteVariable={deleteVariable}
        onSetVariableValue={setVariableValue}
        onToggleVariableAnimation={toggleVariableAnimation}
        onHighlightPoint={highlightPoint}
      />

      {/* Graph area */}
      <div className="flex-1 relative">
        <GraphCanvas
          equations={state.equations}
          viewport={state.viewport}
          variableScope={variableScope}
          detectedPoints={state.detectedPoints}
          highlightedPointId={state.highlightedPointId}
          isDragging={state.isDragging}
          onPan={pan}
          onZoom={zoom}
          onSetDragging={setDragging}
          onSetCanvasSize={setCanvasSize}
          onHighlightPoint={highlightPoint}
        />

        {/* Toolbar */}
        <Toolbar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={resetViewport}
        />

        {/* Coordinates display */}
        <CoordinatesDisplay viewport={state.viewport} />
      </div>
    </div>
  );
};

// Coordinates display component
const CoordinatesDisplay: React.FC<{ viewport: { xMin: number; xMax: number; yMin: number; yMax: number } }> = ({ viewport }) => {
  const formatRange = (min: number, max: number) => {
    const format = (n: number) => {
      if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(1);
      if (Math.abs(n) >= 1000) return n.toExponential(1);
      return n.toFixed(2);
    };
    return `[${format(min)}, ${format(max)}]`;
  };

  return (
    <div className="absolute bottom-4 left-4 px-3 py-2 bg-graph-sidebar/90 backdrop-blur border border-graph-border rounded-lg text-xs font-mono text-graph-muted">
      <div>x: {formatRange(viewport.xMin, viewport.xMax)}</div>
      <div>y: {formatRange(viewport.yMin, viewport.yMax)}</div>
    </div>
  );
};
