import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scientific Calculator',
  description: 'A professional scientific calculator with full arithmetic and scientific functions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
