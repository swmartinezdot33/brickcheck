import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, HelpCircle, FileText, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Support & Help",
  description: "Get help with BrickCheck - FAQs, contact support, and resources.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Support & Help
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12">
          Need help with BrickCheck? We're here to assist you.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="border-2 border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <Mail className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">Email Support</h2>
            <p className="text-muted-foreground mb-4">
              Send us an email and we'll get back to you as soon as possible.
            </p>
            <a 
              href="mailto:support@brickcheck.app" 
              className="text-primary hover:underline font-medium"
            >
              support@brickcheck.app →
            </a>
          </div>

          <div className="border-2 border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <HelpCircle className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">FAQs</h2>
            <p className="text-muted-foreground mb-4">
              Check out our frequently asked questions for quick answers.
            </p>
            <Link href="/#faq" className="text-primary hover:underline font-medium">
              View FAQs →
            </Link>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">How does BrickCheck track LEGO set prices?</h3>
              <p className="text-muted-foreground">
                BrickCheck aggregates price data from multiple sources including BrickLink, Brickset, and other LEGO marketplaces. We update prices regularly and provide historical charts so you can track price trends over time.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">Can I track both sealed and used LEGO sets?</h3>
              <p className="text-muted-foreground">
                Yes! BrickCheck supports tracking both sealed (new in box) and used sets. You can specify the condition when adding sets to your collection, and our app tracks separate price data for each condition.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">How does barcode scanning work?</h3>
              <p className="text-muted-foreground">
                Simply point your camera at the barcode on a LEGO set box. BrickCheck automatically identifies the set number and retrieves all set details including name, theme, year, piece count, and current market value.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">What types of price alerts can I set?</h3>
              <p className="text-muted-foreground">
                You can set custom price alerts for any set in your collection. Set threshold alerts to be notified when a set reaches a specific price, or percentage change alerts to know when values increase or decrease by a certain percentage.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">Is my collection data secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. Your collection data is encrypted and stored securely. We use industry-standard security practices and never share your personal collection information with third parties.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold mb-2">Does BrickCheck work offline?</h3>
              <p className="text-muted-foreground">
                While BrickCheck requires an internet connection to fetch the latest price data and scan barcodes, you can view your collection and previously loaded data offline.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href="/privacy" 
              className="border-2 border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors flex items-center gap-4"
            >
              <Shield className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Learn how we protect your data</p>
              </div>
            </Link>

            <Link 
              href="/terms" 
              className="border-2 border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors flex items-center gap-4"
            >
              <FileText className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">Read our terms and conditions</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you can't find what you're looking for, please don't hesitate to reach out to our support team.
          </p>
          <a 
            href="mailto:support@brickcheck.app" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Mail className="h-5 w-5" />
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}

