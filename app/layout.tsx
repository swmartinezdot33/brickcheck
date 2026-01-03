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
  title: "BrickCheck - LEGO Collection Value Tracker App",
  description: "Download BrickCheck on iOS and Android to track your LEGO collection value like stocks. Monitor prices, scan barcodes, and get alerts. Available on the App Store and Google Play.",
  metadataBase: new URL('https://www.brickcheck.app'),
  openGraph: {
    title: "BrickCheck - LEGO Collection Value Tracker App",
    description: "Download BrickCheck on iOS and Android to track your LEGO collection value like stocks. Monitor prices, scan barcodes, and get alerts. Available on the App Store and Google Play.",
    url: "https://www.brickcheck.app",
    siteName: "BrickCheck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrickCheck - LEGO Collection Value Tracker App",
    description: "Download BrickCheck on iOS and Android to track your LEGO collection value like stocks. Monitor prices, scan barcodes, and get alerts. Available on the App Store and Google Play.",
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
