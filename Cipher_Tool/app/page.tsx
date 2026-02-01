import { CipherInterface } from '@/components/CipherInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-cipher-dark grid-pattern relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cipher-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 py-12 md:py-16 lg:py-20">
        <CipherInterface />
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 pb-8 text-center">
        <div className="inline-flex items-center gap-3 text-xs text-cipher-text-muted">
          <span className="w-8 h-px bg-cipher-border" />
          <span>12 Cipher Algorithms</span>
          <span className="w-1 h-1 rounded-full bg-cipher-border" />
          <span>Encode & Decode</span>
          <span className="w-8 h-px bg-cipher-border" />
        </div>
      </footer>
    </main>
  );
}
