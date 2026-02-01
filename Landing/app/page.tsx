"use client";

import CircuitBoard from "@/components/CircuitBoard";

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <CircuitBoard pinCount={5} cellSize={70} traceWidth={8} seed={55} />
    </main>
  );
}
