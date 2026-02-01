import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Color Picker",
  description: "Pick any color and get the color code in all formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
