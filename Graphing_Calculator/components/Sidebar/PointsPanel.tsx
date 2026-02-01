"use client";

import React from "react";
import { DetectedPoint, Equation, PointType } from "@/types/graph";
import { formatNumber } from "@/lib/transforms";

interface PointsPanelProps {
  points: DetectedPoint[];
  equations: Equation[];
  onHighlightPoint: (id: string | null) => void;
}

const pointTypeInfo: Record<PointType, { label: string; icon: React.ReactNode; color: string }> = {
  root: {
    label: "Root",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      </svg>
    ),
    color: "#388c46",
  },
  intersection: {
    label: "Intersection",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: "#6042a6",
  },
  maximum: {
    label: "Maximum",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    color: "#fa7e19",
  },
  minimum: {
    label: "Minimum",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    color: "#2d70b3",
  },
};

export const PointsPanel: React.FC<PointsPanelProps> = ({
  points,
  equations,
  onHighlightPoint,
}) => {
  // Group points by type
  const groupedPoints = points.reduce((acc, point) => {
    if (!acc[point.type]) {
      acc[point.type] = [];
    }
    acc[point.type].push(point);
    return acc;
  }, {} as Record<PointType, DetectedPoint[]>);

  // Get equation color for point
  const getPointColor = (point: DetectedPoint) => {
    if (point.equationIds.length > 0) {
      const eq = equations.find((e) => e.id === point.equationIds[0]);
      return eq?.color || pointTypeInfo[point.type].color;
    }
    return pointTypeInfo[point.type].color;
  };

  return (
    <div>
      <h2 className="text-sm font-medium text-graph-muted uppercase tracking-wider mb-3">
        Points of Interest
      </h2>

      <div className="space-y-3">
        {(Object.keys(groupedPoints) as PointType[]).map((type) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: pointTypeInfo[type].color }}>
                {pointTypeInfo[type].icon}
              </span>
              <span className="text-xs text-graph-muted">
                {pointTypeInfo[type].label}s ({groupedPoints[type].length})
              </span>
            </div>

            <div className="space-y-1 pl-5">
              {groupedPoints[type].slice(0, 5).map((point) => (
                <div
                  key={point.id}
                  className="point-item"
                  onMouseEnter={() => onHighlightPoint(point.id)}
                  onMouseLeave={() => onHighlightPoint(null)}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPointColor(point) }}
                  />
                  <span className="text-graph-text">
                    ({formatNumber(point.x)}, {formatNumber(point.y)})
                  </span>
                </div>
              ))}
              {groupedPoints[type].length > 5 && (
                <div className="text-xs text-graph-muted pl-4">
                  +{groupedPoints[type].length - 5} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
