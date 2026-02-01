import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cipher Tool | Encode & Decode",
  description: "A powerful cipher encoder and decoder with 12 different cipher algorithms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
