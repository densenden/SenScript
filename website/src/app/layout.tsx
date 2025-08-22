import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SenScript - Turn Any Interview Into Your Advantage",
  description: "AI-powered CheatCard generation from live conversations. Turn meetings, lectures, and interviews into strategic study materials in real-time.",
  keywords: [
    "AI interview prep",
    "cheat cards",
    "interview flashcards",
    "real-time learning",
    "speech to flashcards",
    "interview preparation",
    "study materials",
    "AI-powered learning"
  ],
  authors: [{ name: "Studio Sen", url: "https://sen.studio" }],
  creator: "Studio Sen",
  publisher: "Studio Sen",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://senscript.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SenScript - Turn Any Interview Into Your Advantage',
    description: 'AI-powered CheatCard generation from live conversations. Never be caught off-guard in interviews again.',
    siteName: 'SenScript',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SenScript - AI-powered CheatCard generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SenScript - Turn Any Interview Into Your Advantage',
    description: 'AI-powered CheatCard generation from live conversations.',
    images: ['/images/twitter-image.png'],
    creator: '@studio_sen',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}