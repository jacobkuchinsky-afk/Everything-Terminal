"use client";

import React from "react";
import { DetectedPoint, Equation, PointType } from "@/types/graph";

interface PointsPanelProps {
  points: DetectedPoint[];
  equations: Equation[];
  onHighlightPoint: (id: string | null) => void;
}

const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum >= 1000000 || absNum < 0.001) return num.toExponential(2);
  if (absNum >= 100) return num.toFixed(0);
  if (absNum >= 10) return num.toFixed(1);
  if (absNum >= 1) return num.toFixed(2);
  return num.toFixed(3);
};

const pointTypeInfo: Record<PointType, { label: string; color: string }> = {
  root: { label: "Root", color: "#388c46" },
  intersection: { label: "Intersection", color: "#6042a6" },
  maximum: { label: "Maximum", color: "#fa7e19" },
  minimum: { label: "Minimum", color: "#2d70b3" },
};

export const PointsPanel: React.FC<PointsPanelProps> = ({ points, equations, onHighlightPoint }) => {
  const groupedPoints = points.reduce((acc, point) => {
    if (!acc[point.type]) acc[point.type] = [];
    acc[point.type].push(point);
    return acc;
  }, {} as Record<PointType, DetectedPoint[]>);

  const getPointColor = (point: DetectedPoint) => {
    if (point.equationIds.length > 0) {
      const eq = equations.find((e) => e.id === point.equationIds[0]);
      return eq?.color || pointTypeInfo[point.type].color;
    }
    return pointTypeInfo[point.type].color;
  };

  return (
    <div>
      <h2 className="text-sm font-medium text-graph-muted uppercase tracking-wider mb-3">Points of Interest</h2>
      <div className="space-y-3">
        {(Object.keys(groupedPoints) as PointType[]).map((type) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pointTypeInfo[type].color }} />
              <span className="text-xs text-graph-muted">{pointTypeInfo[type].label}s ({groupedPoints[type].length})</span>
            </div>
            <div className="space-y-1 pl-4">
              {groupedPoints[type].slice(0, 5).map((point) => (
                <div key={point.id} className="flex items-center gap-2 px-2 py-1.5 bg-graph-input rounded text-xs font-mono text-graph-text cursor-pointer hover:bg-graph-inputHover transition-colors" onMouseEnter={() => onHighlightPoint(point.id)} onMouseLeave={() => onHighlightPoint(null)}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getPointColor(point) }} />
                  <span>({formatNumber(point.x)}, {formatNumber(point.y)})</span>
                </div>
              ))}
              {groupedPoints[type].length > 5 && <div className="text-xs text-graph-muted pl-4">+{groupedPoints[type].length - 5} more</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
