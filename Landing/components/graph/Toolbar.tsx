"use client";

import React from "react";

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-10 h-10 flex items-center justify-center bg-graph-sidebar border border-graph-border rounded-lg text-graph-muted hover:bg-graph-input hover:text-graph-text hover:border-graph-muted transition-all"
        title="Zoom In"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-10 h-10 flex items-center justify-center bg-graph-sidebar border border-graph-border rounded-lg text-graph-muted hover:bg-graph-input hover:text-graph-text hover:border-graph-muted transition-all"
        title="Zoom Out"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 12H6"
          />
        </svg>
      </button>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className="w-10 h-10 flex items-center justify-center bg-graph-sidebar border border-graph-border rounded-lg text-graph-muted hover:bg-graph-input hover:text-graph-text hover:border-graph-muted transition-all"
        title="Reset View"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  );
};
