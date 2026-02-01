"use client";

interface DecorativeElementsProps {
  width: number;
  height: number;
  cellSize: number;
  seed: number;
}

export default function DecorativeElements({
  width,
  height,
}: DecorativeElementsProps) {
  // Single header text - "everything-terminal"
  const fontSize = Math.max(24, Math.min(48, width / 30));
  
  return (
    <g className="decorative-elements">
      {/* Company name as header - centered at top */}
      <text
        x={width / 2}
        y={60}
        textAnchor="middle"
        style={{
          fill: "var(--pcb-silkscreen)",
          fontFamily: "'Courier New', 'Monaco', monospace",
          fontSize: `${fontSize}px`,
          fontWeight: "bold",
          letterSpacing: "2px",
          opacity: 0.6,
        }}
      >
        everything-terminal
      </text>
    </g>
  );
}
