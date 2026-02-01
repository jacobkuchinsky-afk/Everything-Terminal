"use client";

import { GraphingCalculator } from "@/components/GraphingCalculator";

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-graph-bg">
      <GraphingCalculator />
    </main>
  );
}
