import Link from 'next/link'
import { CipherInterface } from '@/components/cipher/CipherInterface';
import AdPlaceholder from '@/components/AdPlaceholder';

export default function CipherPage() {
  return (
    <main className="min-h-screen bg-cipher-dark grid-pattern relative flex flex-col">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-cipher-card/80 backdrop-blur border border-cipher-border rounded-lg text-cipher-text-muted hover:text-cipher-text hover:border-cipher-primary/50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm text-cipher-text-muted">Home</span>
      </Link>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cipher-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Top Ad Banner */}
      <AdPlaceholder variant="banner" position="top" />
      
      {/* Main content */}
      <div className="relative z-10 flex-1 py-12 md:py-16 lg:py-20">
        <CipherInterface />
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 pb-4 text-center">
        <div className="inline-flex items-center gap-3 text-xs text-cipher-text-muted">
          <span className="w-8 h-px bg-cipher-border" />
          <span>12 Cipher Algorithms</span>
          <span className="w-1 h-1 rounded-full bg-cipher-border" />
          <span>Encode & Decode</span>
          <span className="w-8 h-px bg-cipher-border" />
        </div>
      </footer>
      
      {/* Bottom Ad Banner */}
      <AdPlaceholder variant="banner" position="bottom" />
    </main>
  );
}
