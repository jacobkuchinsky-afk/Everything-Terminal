import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circuit Board Landing",
  description: "Interactive circuit board visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4605302973659792"
          crossOrigin="anonymous"
        />
      </head>
      <body className="text-white antialiased">{children}</body>
    </html>
  );
}
