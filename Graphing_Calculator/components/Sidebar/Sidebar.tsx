"use client";

import React from "react";
import { Equation, Variable, EquationColor, DetectedPoint } from "@/types/graph";
import { EquationInput } from "./EquationInput";
import { VariableSlider } from "./VariableSlider";
import { PointsPanel } from "./PointsPanel";

interface SidebarProps {
  equations: Equation[];
  variables: Variable[];
  detectedPoints: DetectedPoint[];
  selectedEquationId: string | null;
  onAddEquation: () => void;
  onUpdateEquation: (id: string, expression: string) => void;
  onDeleteEquation: (id: string) => void;
  onToggleEquationVisibility: (id: string) => void;
  onSetEquationColor: (id: string, color: EquationColor) => void;
  onSelectEquation: (id: string | null) => void;
  onUpdateVariable: (id: string, updates: Partial<Variable>) => void;
  onDeleteVariable: (id: string) => void;
  onSetVariableValue: (id: string, value: number) => void;
  onToggleVariableAnimation: (id: string) => void;
  onHighlightPoint: (id: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  equations,
  variables,
  detectedPoints,
  selectedEquationId,
  onAddEquation,
  onUpdateEquation,
  onDeleteEquation,
  onToggleEquationVisibility,
  onSetEquationColor,
  onSelectEquation,
  onUpdateVariable,
  onDeleteVariable,
  onSetVariableValue,
  onToggleVariableAnimation,
  onHighlightPoint,
}) => {
  return (
    <div className="sidebar w-80 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-graph-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-graph-primary to-graph-blue flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-graph-text">Graphing Calculator</h1>
            <p className="text-xs text-graph-muted">Enter equations below</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Equations section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-graph-muted uppercase tracking-wider">
              Equations
            </h2>
            <button
              onClick={onAddEquation}
              className="btn-icon w-7 h-7 bg-graph-primary/10 text-graph-primary hover:bg-graph-primary/20"
              title="Add equation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {equations.map((equation, index) => (
              <EquationInput
                key={equation.id}
                equation={equation}
                index={index}
                isSelected={equation.id === selectedEquationId}
                onUpdate={(expression) => onUpdateEquation(equation.id, expression)}
                onDelete={() => onDeleteEquation(equation.id)}
                onToggleVisibility={() => onToggleEquationVisibility(equation.id)}
                onColorChange={(color) => onSetEquationColor(equation.id, color)}
                onSelect={() => onSelectEquation(equation.id)}
              />
            ))}
          </div>
        </div>

        {/* Variables section */}
        {variables.length > 0 && (
          <div className="p-4 border-t border-graph-border">
            <h2 className="text-sm font-medium text-graph-muted uppercase tracking-wider mb-3">
              Variables
            </h2>
            <div className="space-y-3">
              {variables.map((variable) => (
                <VariableSlider
                  key={variable.id}
                  variable={variable}
                  onUpdate={(updates) => onUpdateVariable(variable.id, updates)}
                  onDelete={() => onDeleteVariable(variable.id)}
                  onValueChange={(value) => onSetVariableValue(variable.id, value)}
                  onToggleAnimation={() => onToggleVariableAnimation(variable.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Points section */}
        {detectedPoints.length > 0 && (
          <div className="p-4 border-t border-graph-border">
            <PointsPanel
              points={detectedPoints}
              equations={equations}
              onHighlightPoint={onHighlightPoint}
            />
          </div>
        )}
      </div>

      {/* Help section */}
      <div className="p-4 border-t border-graph-border">
        <details className="group">
          <summary className="text-xs text-graph-muted cursor-pointer hover:text-graph-text transition-colors flex items-center gap-2">
            <svg
              className="w-3 h-3 transition-transform group-open:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Equation formats
          </summary>
          <div className="mt-2 space-y-1.5 text-[11px] text-graph-muted pl-5">
            <p><span className="text-graph-text font-mono">y = x^2</span> — explicit</p>
            <p><span className="text-graph-text font-mono">x^2 + y^2 = 1</span> — implicit</p>
            <p><span className="text-graph-text font-mono">(cos(t), sin(t))</span> — parametric</p>
            <p><span className="text-graph-text font-mono">r = 2*sin(theta)</span> — polar</p>
            <p><span className="text-graph-text font-mono">y &gt; x</span> — inequality</p>
            <p><span className="text-graph-text font-mono">a = 5</span> — create slider</p>
          </div>
        </details>
      </div>
    </div>
  );
};
