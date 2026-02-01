import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Everything Terminal - Free Online Developer Tools",
    template: "%s | Everything Terminal",
  },
  description: "Free online developer tools: calculator, cipher encoder/decoder, color picker, graphing calculator, and YouTube converter. Fast, modern, and easy to use.",
  keywords: ["developer tools", "online calculator", "cipher encoder", "color picker", "graphing calculator", "youtube converter", "free tools", "web tools"],
  authors: [{ name: "Everything Terminal" }],
  creator: "Everything Terminal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Everything Terminal",
    title: "Everything Terminal - Free Online Developer Tools",
    description: "Free online developer tools: calculator, cipher encoder/decoder, color picker, graphing calculator, and YouTube converter.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything Terminal - Free Online Developer Tools",
    description: "Free online developer tools: calculator, cipher encoder/decoder, color picker, graphing calculator, and YouTube converter.",
  },
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
