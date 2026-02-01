import Link from 'next/link';
import { GraphingCalculator } from '@/components/graph/GraphingCalculator';

export default function GraphPage() {
  return (
    <main className="h-screen bg-graph-bg flex flex-col overflow-hidden">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-graph-sidebar/80 backdrop-blur border border-graph-border rounded-lg text-graph-muted hover:text-graph-text hover:border-graph-primary/50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm text-white">Home</span>
      </Link>

      {/* Graphing Calculator */}
      <div className="flex-1 pt-16">
        <GraphingCalculator />
      </div>
    </main>
  );
}
