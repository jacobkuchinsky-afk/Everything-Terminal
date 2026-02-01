"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CircuitBoardProps, CircuitData } from "@/types/circuit";
import { generateCircuitBoard } from "@/utils/traceGenerator";
import PinButton from "./PinButton";
import Trace from "./Trace";
import Via from "./Via";
import DecorativeElements from "./DecorativeElements";

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function CircuitBoard({
  pinCount = 4,
  cellSize = 40,
  traceWidth = 3,
  seed = 42,
}: CircuitBoardProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  
  // Handle window resize with debounce
  useEffect(() => {
    if (!isClient) return;
    
    const handleResize = debounce(() => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 150);
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);
  
  // Generate circuit data (memoized based on dimensions and seed)
  const circuitData: CircuitData = useMemo(() => {
    return generateCircuitBoard(
      dimensions.width,
      dimensions.height,
      {
        pinCount,
        cellSize,
        traceWidth,
      },
      seed
    );
  }, [dimensions.width, dimensions.height, pinCount, cellSize, traceWidth, seed]);
  
  // Handle pin click (currently no-op as specified)
  const handlePinClick = useCallback(() => {
    // No-op for now
  }, []);
  
  // Handle navigation to utility routes
  const handleNavigate = useCallback((route: string) => {
    router.push(route);
  }, [router]);
  
  if (!isClient) {
    // Return placeholder during SSR
    return (
      <div
        className="w-full h-full"
        style={{ backgroundColor: "var(--pcb-substrate)" }}
      />
    );
  }
  
  // Calculate viewBox for responsive scaling
  // Extended viewBox to allow traces to render off-screen
  const borderExtension = cellSize * 3; // Match the borderExtension in generator
  const viewBox = `${-borderExtension} ${-borderExtension} ${dimensions.width + borderExtension * 2} ${dimensions.height + borderExtension * 2}`;
  
  return (
    <svg
      className="circuit-board"
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      style={{
        backgroundColor: "var(--pcb-substrate)",
        display: "block",
        overflow: "visible",
      }}
    >
      {/* Background gradient for depth */}
      <defs>
        <radialGradient id="boardGradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--pcb-mask)" />
          <stop offset="100%" stopColor="var(--pcb-substrate)" />
        </radialGradient>
        
        {/* Subtle texture pattern */}
        <pattern
          id="boardTexture"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
        >
          <rect width="4" height="4" fill="var(--pcb-mask)" />
          <rect width="1" height="1" fill="var(--pcb-substrate)" opacity="0.1" />
        </pattern>
      </defs>
      
      {/* Board background - extended to cover off-screen areas */}
      <rect
        x={-borderExtension}
        y={-borderExtension}
        width={dimensions.width + borderExtension * 2}
        height={dimensions.height + borderExtension * 2}
        fill="url(#boardGradient)"
      />
      <rect
        x={-borderExtension}
        y={-borderExtension}
        width={dimensions.width + borderExtension * 2}
        height={dimensions.height + borderExtension * 2}
        fill="url(#boardTexture)"
        opacity="0.3"
      />
      
      {/* Decorative traces (render first, below main traces) */}
      <g className="decorative-traces-layer">
        {circuitData.decorativeTraces.map((trace) => (
          <Trace key={trace.id} trace={trace} />
        ))}
      </g>
      
      {/* Main traces */}
      <g className="traces-layer">
        {circuitData.traces.map((trace) => (
          <Trace key={trace.id} trace={trace} />
        ))}
      </g>
      
      {/* Vias */}
      <g className="vias-layer">
        {circuitData.vias.map((via) => (
          <Via key={via.id} via={via} />
        ))}
      </g>
      
      {/* Interactive pins (render on top) */}
      <g className="pins-layer">
        {circuitData.pins.map((pin) => (
          <PinButton key={pin.id} pin={pin} onClick={handlePinClick} onNavigate={handleNavigate} />
        ))}
      </g>
      
      {/* Decorative silkscreen elements */}
      <DecorativeElements
        width={dimensions.width}
        height={dimensions.height}
        cellSize={cellSize}
        seed={seed}
      />
    </svg>
  );
}
