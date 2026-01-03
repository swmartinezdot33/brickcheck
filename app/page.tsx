import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, TrendingUp, Scan, Bell } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Track Your LEGO Collection Value
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Monitor your LEGO sets like stocks. Scan barcodes, track market prices, and get alerts
            when values change. Built for serious collectors.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Scan className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Barcode Scanning</h3>
              <p className="text-sm text-muted-foreground">
                Scan LEGO box barcodes to instantly identify sets and add them to your collection
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <TrendingUp className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Price Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Real-time market value tracking with historical price charts for sealed and used
                sets
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Package className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Collection Management</h3>
              <p className="text-sm text-muted-foreground">
                Organize your collection with detailed tracking of sealed and used sets
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Bell className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when set values cross thresholds or change significantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
