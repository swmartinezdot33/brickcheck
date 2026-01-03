import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Scan, 
  TrendingUp, 
  Package, 
  Bell, 
  Smartphone, 
  BarChart3, 
  Camera,
  Download,
  Star,
  CheckCircle2
} from 'lucide-react'

export default function LandingPage() {
  const APP_STORE_URL = 'https://apps.apple.com/app/brickcheck'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100/50 via-blue-100/50 to-green-100/50 backdrop-blur-sm border border-primary/20 mb-8">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Available on iOS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient-lego bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-blue-600 to-green-600">
              Track Your LEGO Collection
            </span>
            <br />
            <span className="text-foreground">Like Stocks</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Monitor your LEGO sets like investments. Scan barcodes, track market prices, 
            and get alerts when values change. Built for serious collectors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 py-6 h-auto bg-gradient-lego-red hover:opacity-90 text-white border-0 shadow-lg"
            >
              <a 
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <Download className="h-6 w-6" />
                Download on App Store
              </a>
            </Button>
          </div>

          {/* App Mockup Placeholder */}
          <div className="relative max-w-md mx-auto mb-20">
            <div className="bg-gradient-lego-vibrant p-1 rounded-3xl shadow-2xl">
              <div className="bg-background rounded-[1.4rem] p-4 aspect-[9/19.5] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-lego-vibrant rounded-2xl flex items-center justify-center">
                    <Package className="h-16 w-16 text-white" />
                  </div>
                  <p className="text-muted-foreground">App Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Everything You Need to Track Your Collection
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Powerful features designed for LEGO collectors who want to monitor their investments
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-red flex items-center justify-center mb-4">
                  <Scan className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Barcode Scanning</CardTitle>
                <CardDescription>
                  Scan LEGO box barcodes to instantly identify sets and add them to your collection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-blue flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Price Tracking</CardTitle>
                <CardDescription>
                  Real-time market value tracking with historical price charts for sealed and used sets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-green flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Collection Management</CardTitle>
                <CardDescription>
                  Organize your collection with detailed tracking of sealed and used sets
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-yellow flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Alerts</CardTitle>
                <CardDescription>
                  Get notified when set values cross thresholds or change significantly
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Built for <span className="text-gradient-lego">Collectors</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Track your LEGO collection like a portfolio. Know when to buy, sell, or hold.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time price updates from multiple sources',
                  'Historical price charts and trends',
                  'Collection value tracking',
                  'Barcode scanning for quick entry',
                  'Price alerts and notifications',
                  'Sealed and used condition tracking'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                asChild 
                size="lg" 
                className="mt-6 bg-gradient-lego-blue hover:opacity-90 text-white"
              >
                <a 
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Now
                </a>
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-lego-vibrant rounded-3xl blur-3xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-12 border-2 border-primary/20">
                  <BarChart3 className="h-32 w-32 mx-auto text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-lego-vibrant border-0 shadow-2xl">
            <CardHeader className="pb-8 pt-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Track Your Collection?
              </h2>
              <CardDescription className="text-white/90 text-lg">
                Download BrickCheck on the App Store and start monitoring your LEGO investments today.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-lg"
              >
                <a 
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <Download className="h-6 w-6" />
                  Download on App Store
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gradient-lego">BrickCheck</h3>
              <p className="text-muted-foreground">Track your LEGO collection like stocks</p>
            </div>
            <div className="flex gap-4">
              <Button 
                asChild 
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
              >
                <a 
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  App Store
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BrickCheck. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
