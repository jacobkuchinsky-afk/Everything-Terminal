import type { Metadata } from "next";
import CircuitBoard from "@/components/CircuitBoard";

export const metadata: Metadata = {
  title: "Everything Terminal - Free Online Developer Tools",
  description: "Access free online developer tools including a scientific calculator, cipher encoder/decoder with 12+ algorithms, color picker with 8 formats, interactive graphing calculator, and YouTube converter. Fast, modern, and easy to use.",
  keywords: ["developer tools", "online tools", "free calculator", "cipher encoder", "cipher decoder", "color picker", "graphing calculator", "youtube downloader", "web utilities"],
  openGraph: {
    title: "Everything Terminal - Free Online Developer Tools",
    description: "Access free online developer tools including calculator, cipher encoder, color picker, graphing calculator, and YouTube converter.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <CircuitBoard pinCount={5} cellSize={70} traceWidth={8} seed={55} />
    </main>
  );
}
