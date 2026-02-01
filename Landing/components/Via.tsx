"use client";

import { ViaProps } from "@/types/circuit";

export default function Via({ via }: ViaProps) {
  return (
    <g className="via-group">
      {/* Outer copper ring */}
      <circle
        className="via-outer"
        cx={via.x}
        cy={via.y}
        r={via.outerRadius}
      />
      
      {/* Inner hole */}
      <circle
        className="via-inner"
        cx={via.x}
        cy={via.y}
        r={via.innerRadius}
      />
    </g>
  );
}
