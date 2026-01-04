import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BrickCheck - Track Your LEGO Collection Value Like Stocks",
    template: "%s | BrickCheck"
  },
  description: "Download BrickCheck on iOS and Android to track your LEGO collection value like stocks. Monitor prices, scan barcodes, and get alerts when values change. The premier LEGO collection tracking app for collectors and investors. Available on the App Store and Google Play.",
  keywords: [
    "LEGO collection tracker",
    "LEGO value tracker",
    "LEGO price monitoring",
    "LEGO investment app",
    "LEGO barcode scanner",
    "LEGO set tracker",
    "LEGO collection management",
    "LEGO price alerts",
    "LEGO market value",
    "LEGO portfolio tracker",
    "BrickLink tracker",
    "LEGO collector app",
    "retired LEGO sets",
    "LEGO sealed sets",
    "LEGO used sets",
    "LEGO price history",
    "LEGO collection value",
    "LEGO investment tracking",
    "iOS LEGO app",
    "Android LEGO app"
  ],
  authors: [{ name: "BrickCheck" }],
  creator: "BrickCheck",
  publisher: "BrickCheck",
  metadataBase: new URL('https://www.brickcheck.app'),
  alternates: {
    canonical: '/',
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
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.brickcheck.app",
    siteName: "BrickCheck",
    title: "BrickCheck - Track Your LEGO Collection Value Like Stocks",
    description: "Download BrickCheck on iOS and Android to track your LEGO collection value like stocks. Monitor prices, scan barcodes, and get alerts when values change. The premier LEGO collection tracking app for collectors and investors.",
    images: [
      {
        url: '/BrickCheck Logo.png',
        width: 1200,
        height: 630,
        alt: 'BrickCheck - LEGO Collection Value Tracker App',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrickCheck - Track Your LEGO Collection Value Like Stocks",
    description: "Download BrickCheck on iOS and Android to track your LEGO collection value like stocks. Monitor prices, scan barcodes, and get alerts when values change.",
    images: ['/BrickCheck Logo.png'],
    creator: "@brickcheck",
    site: "@brickcheck",
  },
  verification: {
    // Add these when you have them:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: 'mobile app',
  classification: 'LEGO Collection Management App',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BrickCheck',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
