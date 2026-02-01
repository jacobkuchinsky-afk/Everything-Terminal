"use client";

import { useState } from "react";
import { PinButtonProps } from "@/types/circuit";

export default function PinButton({ pin, onClick, onNavigate }: PinButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Make buttons bigger - 80% of cell size instead of 60%
  const buttonSize = pin.size * 1.4;
  const halfSize = buttonSize / 2;
  const cornerRadius = buttonSize * 0.15;
  
  const handleClick = () => {
    if (pin.route && onNavigate) {
      onNavigate(pin.route);
    } else if (onClick) {
      onClick();
    }
  };
  
  return (
    <g
      className="pin-button-group"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Outer copper pad (larger base) */}
      <rect
        x={pin.x - halfSize - 4}
        y={pin.y - halfSize - 4}
        width={buttonSize + 8}
        height={buttonSize + 8}
        rx={cornerRadius + 2}
        ry={cornerRadius + 2}
        fill="var(--pcb-copper)"
        opacity={0.7}
      />
      
      {/* Main interactive pad */}
      <rect
        className="pin-button"
        x={pin.x - halfSize}
        y={pin.y - halfSize}
        width={buttonSize}
        height={buttonSize}
        rx={cornerRadius}
        ry={cornerRadius}
      />
      
      {/* Center hole indicator */}
      <circle
        cx={pin.x}
        cy={pin.y}
        r={buttonSize * 0.15}
        fill="var(--pcb-substrate)"
        pointerEvents="none"
      />
      
      {/* Hover tooltip */}
      {isHovered && pin.label && (
        <g className="tooltip-group" pointerEvents="none">
          {/* Tooltip background */}
          <rect
            x={pin.x - 50}
            y={pin.y - halfSize - 40}
            width={100}
            height={28}
            rx={6}
            ry={6}
            fill="rgba(0, 0, 0, 0.9)"
            stroke="var(--pcb-pad-hover)"
            strokeWidth={1.5}
          />
          {/* Tooltip arrow */}
          <polygon
            points={`${pin.x - 6},${pin.y - halfSize - 12} ${pin.x + 6},${pin.y - halfSize - 12} ${pin.x},${pin.y - halfSize - 4}`}
            fill="rgba(0, 0, 0, 0.9)"
            stroke="var(--pcb-pad-hover)"
            strokeWidth={1.5}
          />
          {/* Cover the arrow stroke inside the box */}
          <rect
            x={pin.x - 8}
            y={pin.y - halfSize - 14}
            width={16}
            height={4}
            fill="rgba(0, 0, 0, 0.9)"
          />
          {/* Tooltip text */}
          <text
            x={pin.x}
            y={pin.y - halfSize - 21}
            textAnchor="middle"
            fill="var(--pcb-pad-hover)"
            fontSize={14}
            fontWeight={600}
            fontFamily="system-ui, sans-serif"
          >
            {pin.label}
          </text>
        </g>
      )}
    </g>
  );
}
