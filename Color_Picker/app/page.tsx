import { ColorPicker } from '@/components/ColorPicker';

export default function Home() {
  return (
    <main className="min-h-screen bg-picker-dark grid-pattern relative overflow-hidden">
      {/* Decorative corner accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top left */}
        <div className="absolute top-0 left-0 w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-picker-primary to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-picker-primary to-transparent" />
        </div>
        
        {/* Top right */}
        <div className="absolute top-0 right-0 w-24 h-24">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-picker-primary to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-picker-primary to-transparent" />
        </div>
        
        {/* Bottom left */}
        <div className="absolute bottom-0 left-0 w-24 h-24">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-picker-primary to-transparent" />
          <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-picker-primary to-transparent" />
        </div>
        
        {/* Bottom right */}
        <div className="absolute bottom-0 right-0 w-24 h-24">
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-picker-primary to-transparent" />
          <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-picker-primary to-transparent" />
        </div>

        {/* Subtle accent lines */}
        <div className="absolute top-1/3 left-0 w-12 h-[1px] bg-gradient-to-r from-picker-border to-transparent" />
        <div className="absolute top-1/3 right-0 w-12 h-[1px] bg-gradient-to-l from-picker-border to-transparent" />
        <div className="absolute top-2/3 left-0 w-8 h-[1px] bg-gradient-to-r from-picker-muted/30 to-transparent" />
        <div className="absolute top-2/3 right-0 w-8 h-[1px] bg-gradient-to-l from-picker-muted/30 to-transparent" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 py-8 md:py-12">
        <ColorPicker />
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center text-xs text-picker-muted tracking-wider">
        <span className="border-t border-picker-border pt-4 px-8 inline-block uppercase">
          8 Color Formats • One-Click Copy
        </span>
      </footer>
    </main>
  );
}
