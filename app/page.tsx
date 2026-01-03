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
  CheckCircle2,
  DollarSign,
  Clock,
  Shield,
  Zap,
  Users
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
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Monitor your LEGO sets like investments. Scan barcodes, track market prices, 
            and get alerts when values change. Built for serious collectors.
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            BrickCheck is the premier LEGO collection tracking app for iOS. Whether you collect Star Wars sets, 
            Modular Buildings, or rare retired sets, our app helps you monitor market values, track price trends, 
            and make informed buying and selling decisions for your LEGO investment portfolio.
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
          <p className="text-xl text-muted-foreground text-center mb-4 max-w-3xl mx-auto">
            Powerful features designed for LEGO collectors who want to monitor their investments
          </p>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            From barcode scanning to real-time price alerts, BrickCheck provides all the tools you need 
            to manage your LEGO collection like a professional investor. Track sealed and used sets, 
            monitor market trends, and never miss an opportunity to buy or sell.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-red flex items-center justify-center mb-4">
                  <Scan className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Barcode Scanning</CardTitle>
                <CardDescription>
                  Scan LEGO box barcodes to instantly identify sets and add them to your collection. 
                  Save time by automatically detecting set numbers, names, and details from the box barcode.
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
                  Real-time market value tracking with historical price charts for sealed and used sets. 
                  Monitor price trends over days, weeks, and months to make informed investment decisions.
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
                  Organize your collection with detailed tracking of sealed and used sets. 
                  Track acquisition costs, dates, condition grades, and personal notes for each set in your collection.
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
                  Get notified when set values cross thresholds or change significantly. 
                  Set custom price alerts for your collection and never miss a buying or selling opportunity.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How BrickCheck Works
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Start tracking your LEGO collection value in minutes with our simple, intuitive process
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-lego-red flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Download & Sign Up</h3>
              <p className="text-muted-foreground">
                Download BrickCheck from the App Store and create your free account. 
                Get started in seconds with our quick setup process.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-lego-blue flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Add Your Sets</h3>
              <p className="text-muted-foreground">
                Scan barcodes or search for LEGO sets to add them to your collection. 
                Track sealed and used conditions, acquisition costs, and dates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-lego-green flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Track & Monitor</h3>
              <p className="text-muted-foreground">
                Watch your collection value grow with real-time price updates. 
                Set alerts and track trends to maximize your LEGO investment returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-background/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Built for <span className="text-gradient-lego">Collectors</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Track your LEGO collection like a portfolio. Know when to buy, sell, or hold.
              </p>
              <p className="text-lg text-muted-foreground">
                Whether you're collecting Star Wars sets, Modular Buildings, Technic sets, or rare retired LEGO sets, 
                BrickCheck helps you make data-driven decisions about your collection. Monitor market trends, 
                track price changes, and optimize your LEGO investment strategy.
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

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Perfect for Every LEGO Collector
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Whether you're a casual collector or building a LEGO investment portfolio, BrickCheck helps you track and manage your sets
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Investment Collectors</CardTitle>
                <CardDescription>
                  Track your LEGO sets as investments. Monitor price trends, track ROI, 
                  and identify the best time to buy or sell rare and retired sets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Serious Collectors</CardTitle>
                <CardDescription>
                  Organize large collections with detailed tracking. Monitor sealed and used conditions, 
                  track acquisition history, and manage your entire LEGO portfolio in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Casual Collectors</CardTitle>
                <CardDescription>
                  Keep track of your LEGO sets and their current values. 
                  Simple barcode scanning makes it easy to catalog your collection quickly.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose BrickCheck Section */}
      <section className="container mx-auto px-4 py-20 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Why Choose BrickCheck?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            The most comprehensive LEGO collection tracking app available for iOS
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-lego-blue flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Real-Time Data</h3>
                <p className="text-muted-foreground">
                  Get instant price updates from multiple LEGO marketplaces. Our app aggregates data 
                  from BrickLink, Brickset, and other sources to give you the most accurate market values.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-lego-green flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your collection data is secure and private. We use industry-standard encryption 
                  to protect your information and never share your data with third parties.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-lego-red flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Save Time</h3>
                <p className="text-muted-foreground">
                  Barcode scanning and automatic set detection save hours of manual data entry. 
                  Add sets to your collection in seconds, not minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-lego-yellow flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Comprehensive Analytics</h3>
                <p className="text-muted-foreground">
                  View detailed price charts, track collection value over time, and analyze 
                  which sets are performing best in your portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Everything you need to know about BrickCheck
          </p>

          <div className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>How does BrickCheck track LEGO set prices?</CardTitle>
                <CardDescription className="pt-2">
                  BrickCheck aggregates price data from multiple sources including BrickLink, Brickset, 
                  and other LEGO marketplaces. We update prices regularly and provide historical charts 
                  so you can track price trends over time. Our pricing engine analyzes multiple data points 
                  to give you accurate market values for both sealed and used sets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Can I track both sealed and used LEGO sets?</CardTitle>
                <CardDescription className="pt-2">
                  Yes! BrickCheck supports tracking both sealed (new in box) and used sets. You can specify 
                  the condition when adding sets to your collection, and our app tracks separate price data 
                  for each condition. For used sets, you can also track condition grades like Mint, Complete, 
                  or Incomplete.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>How does barcode scanning work?</CardTitle>
                <CardDescription className="pt-2">
                  Simply point your iPhone camera at the barcode on a LEGO set box. BrickCheck automatically 
                  identifies the set number and retrieves all set details including name, theme, year, piece count, 
                  and current market value. This makes adding sets to your collection quick and effortless.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>What types of price alerts can I set?</CardTitle>
                <CardDescription className="pt-2">
                  You can set custom price alerts for any set in your collection. Set threshold alerts to be 
                  notified when a set reaches a specific price, or percentage change alerts to know when values 
                  increase or decrease by a certain percentage. Perfect for timing your buying and selling decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Is my collection data secure?</CardTitle>
                <CardDescription className="pt-2">
                  Absolutely. Your collection data is encrypted and stored securely. We use industry-standard 
                  security practices and never share your personal collection information with third parties. 
                  Your data is private and only accessible by you.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Does BrickCheck work offline?</CardTitle>
                <CardDescription className="pt-2">
                  While BrickCheck requires an internet connection to fetch the latest price data and scan barcodes, 
                  you can view your collection and previously loaded data offline. All price updates and barcode 
                  scans require an active internet connection to ensure you're getting the most current information.
                </CardDescription>
              </CardHeader>
            </Card>
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
              <CardDescription className="text-white/90 text-lg mb-2">
                Download BrickCheck on the App Store and start monitoring your LEGO investments today.
              </CardDescription>
              <CardDescription className="text-white/80 text-base">
                Join thousands of LEGO collectors who use BrickCheck to track, monitor, and optimize their collections.
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
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient-lego mb-4">BrickCheck</h3>
              <p className="text-muted-foreground mb-4">
                Track your LEGO collection like stocks. Monitor prices, scan barcodes, and get alerts when values change.
              </p>
              <p className="text-sm text-muted-foreground">
                The premier LEGO collection tracking app for iOS. Perfect for collectors, investors, and LEGO enthusiasts.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>LEGO Collection Tracking</li>
                <li>Price Monitoring</li>
                <li>Barcode Scanning</li>
                <li>Price Alerts</li>
                <li>Market Value Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Download</h4>
              <p className="text-muted-foreground mb-4">
                Available now on the App Store for iPhone and iPad.
              </p>
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
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BrickCheck. All rights reserved.</p>
            <p className="mt-2">LEGO is a trademark of the LEGO Group, which does not sponsor, authorize, or endorse this app.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
