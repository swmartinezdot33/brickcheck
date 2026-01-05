import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

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
    default: "BrickCheck - Track Your LEGO Collection Like Stocks | The Best LEGO Collection App",
    template: "%s | BrickCheck"
  },
  description: "BrickCheck is the premier LEGO collection app for tracking your LEGO collection value like stocks. Download BrickCheck on iOS and Android to monitor prices, scan barcodes, and get alerts. The best LEGO collection app for collectors and investors. Available on the App Store and Google Play.",
  keywords: [
    "BrickCheck",
    "Lego Collection App",
    "LEGO collection app",
    "BrickCheck app",
    "BrickCheck LEGO tracker",
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
    description: "BrickCheck is the premier LEGO collection app for tracking your LEGO collection value like stocks. Download BrickCheck on iOS and Android to monitor prices, scan barcodes, and get alerts. The best LEGO collection app for collectors and investors.",
    images: [
      {
        url: '/BrickCheckLogo.png',
        width: 1200,
        height: 630,
        alt: 'BrickCheck - LEGO Collection Value Tracker App',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrickCheck - Track Your LEGO Collection Like Stocks | The Best LEGO Collection App",
    description: "BrickCheck is the premier LEGO collection app for tracking your LEGO collection value like stocks. Download BrickCheck on iOS and Android to monitor prices, scan barcodes, and get alerts.",
    images: ['/BrickCheckLogo.png'],
    creator: "@brickcheckapp",
    site: "@brickcheckapp",
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CQSY8FB6NG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CQSY8FB6NG');
          `}
        </Script>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
