"use client";

import { TraceProps } from "@/types/circuit";
import { traceToSvgPath } from "@/utils/traceGenerator";

export default function Trace({ trace }: TraceProps) {
  const pathData = traceToSvgPath(trace);
  
  if (!pathData) return null;
  
  return (
    <path
      className={trace.isDecorative ? "decorative-trace" : "trace"}
      d={pathData}
      strokeWidth={trace.width}
    />
  );
}
