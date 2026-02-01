import Link from 'next/link'
import { Calculator } from '@/components/calc/Calculator';
import AdPlaceholder from '@/components/AdPlaceholder';

export default function CalcPage() {
  return (
    <main className="min-h-screen bg-calc-black dot-pattern relative overflow-hidden flex flex-col">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-calc-dark/80 backdrop-blur border border-calc-border rounded-lg text-calc-text-muted hover:text-calc-text hover:border-calc-primary/50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm text-calc-textMuted">Home</span>
      </Link>
      
      {/* Top Ad Banner */}
      <AdPlaceholder variant="banner" position="top" />
      
      {/* Decorative corner accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top left */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-calc-primary/50 to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-calc-primary/50 to-transparent" />
        </div>
        
        {/* Top right */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-calc-primary/50 to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-calc-primary/50 to-transparent" />
        </div>
        
        {/* Bottom left */}
        <div className="absolute bottom-0 left-0 w-32 h-32">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-calc-primary/50 to-transparent" />
          <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-calc-primary/50 to-transparent" />
        </div>
        
        {/* Bottom right */}
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-calc-primary/50 to-transparent" />
          <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-calc-primary/50 to-transparent" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <Calculator />
      </div>
      
      {/* Bottom Ad Banner */}
      <AdPlaceholder variant="banner" position="bottom" />
    </main>
  );
}
