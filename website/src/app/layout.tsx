import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import "./clerk-overrides.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SenScript - Turn Conversations Into Study Materials",
  description: "AI-powered CheatCard generator that transforms any conversation into instant study materials. Works with Teams, Zoom, Meet, and all web conferencing platforms.",
  keywords: "AI flashcards, interview prep, study materials, cheat cards, speech to text, meeting notes",
  authors: [{ name: "Studio Sen" }],
  robots: "index, follow",
  openGraph: {
    title: "SenScript - Turn Conversations Into Study Materials",
    description: "AI-powered CheatCard generator for interview prep and study materials",
    type: "website",
    url: "https://senscript.com",
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#f97316" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100" rel="stylesheet" />
        </head>
        <body className="antialiased">
          <Header />
          <main className="flex flex-col min-h-screen">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
