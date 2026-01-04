'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DownloadModal } from '@/components/download-modal'
import { isCapacitorNative } from '@/lib/utils/capacitor'
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
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const router = useRouter()
  const [isNativeApp, setIsNativeApp] = useState<boolean | null>(null)

  // Check immediately on mount (before any rendering)
  useEffect(() => {
    // Check if running in Capacitor
    try {
      const Capacitor = (window as any).Capacitor
      if (Capacitor) {
        const platform = Capacitor.getPlatform()
        if (platform === 'android' || platform === 'ios') {
          setIsNativeApp(true)
          router.replace('/login')
          return
        }
      }
    } catch (e) {
      // Ignore errors
    }
    setIsNativeApp(false)
  }, [router])

  // Don't render anything until we've checked (prevents flash)
  if (isNativeApp === null || isNativeApp) {
    return null
  }

  return (
    <>
      {/* Script to redirect immediately before React hydrates (prevents flash) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                if (window.Capacitor) {
                  const platform = window.Capacitor.getPlatform();
                  if (platform === 'android' || platform === 'ios') {
                    window.location.replace('/login');
                  }
                }
              } catch(e) {}
            })();
          `,
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/BrickCheck Logo.png"
                alt="BrickCheck"
                width={40}
                height={40}
                className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 object-contain"
                priority
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                BrickCheck
              </h1>
            </Link>
            <Button 
              onClick={() => setDownloadModalOpen(true)}
              size="sm"
              className="bg-gradient-lego-blue hover:opacity-90 text-white text-xs sm:text-sm whitespace-nowrap button-lift transition-all duration-300"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:animate-bounce-gentle" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Get App</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-red-100/50 via-blue-100/50 to-green-100/50 backdrop-blur-sm border border-primary/20 mb-6 sm:mb-8 text-xs sm:text-sm animate-fade-in-down">
            <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-bounce-gentle" />
            <span className="font-medium">Available on iOS & Android</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in-up">
            <span className="text-gradient-lego bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-blue-600 to-green-600">
              Track Your LEGO Collection
            </span>
            <br />
            <span className="text-foreground">Like Stocks</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Monitor your LEGO sets like investments. Scan barcodes, track market prices, 
            and get alerts when values change. Available on iOS and Android.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={() => setDownloadModalOpen(true)}
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto bg-gradient-lego-red hover:opacity-90 text-white border-0 shadow-lg w-full sm:w-auto button-lift transition-all duration-300"
            >
              <Download className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:animate-bounce-gentle" />
              Download App
            </Button>
          </div>

          {/* App Mockup Placeholder */}
          <div className="relative max-w-sm mx-auto mb-12 sm:mb-20">
            <div className="bg-gradient-lego-vibrant p-1 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl">
              <div className="bg-background rounded-xl sm:rounded-[1.4rem] p-3 sm:p-4 aspect-[9/19.5] flex items-center justify-center">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-lego-vibrant rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">App Preview</p>
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
            <Card className="border-2 hover:border-primary/50 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20 card-hover transition-all duration-300 animate-stagger-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-red flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                  <Scan className="h-6 w-6 text-white animate-bounce-gentle" />
                </div>
                <CardTitle>Barcode Scanning</CardTitle>
                <CardDescription>
                  Scan LEGO box barcodes to instantly identify sets and add them to your collection. 
                  Save time by automatically detecting set numbers, names, and details from the box barcode.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 card-hover transition-all duration-300 animate-stagger-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-blue flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                  <TrendingUp className="h-6 w-6 text-white animate-bounce-gentle" />
                </div>
                <CardTitle>Price Tracking</CardTitle>
                <CardDescription>
                  Real-time market value tracking with historical price charts for sealed and used sets. 
                  Monitor price trends over days, weeks, and months to make informed investment decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 card-hover transition-all duration-300 animate-stagger-3">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-green flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                  <Package className="h-6 w-6 text-white animate-bounce-gentle" />
                </div>
                <CardTitle>Collection Management</CardTitle>
                <CardDescription>
                  Organize your collection with detailed tracking of sealed and used sets. 
                  Track acquisition costs, dates, condition grades, and personal notes for each set in your collection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/20 card-hover transition-all duration-300 animate-stagger-4">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-lego-yellow flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110">
                  <Bell className="h-6 w-6 text-white animate-bounce-gentle" />
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
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 leading-tight">
            How BrickCheck Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
            Start tracking your LEGO collection value in minutes with our simple, intuitive process
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center px-2 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-lego-red flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Download & Sign Up</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Download BrickCheck from the App Store and create your free account. 
                Get started in seconds with our quick setup process.
              </p>
            </div>

            <div className="text-center px-2 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-lego-blue flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Add Your Sets</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Scan barcodes or search for LEGO sets to add them to your collection. 
                Track sealed and used conditions, acquisition costs, and dates.
              </p>
            </div>

            <div className="text-center px-2 sm:px-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-lego-green flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Track & Monitor</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Watch your collection value grow with real-time price updates. 
                Set alerts and track trends to maximize your LEGO investment returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 bg-background/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 sm:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Built for <span className="text-gradient-lego">Collectors</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Track your LEGO collection like a portfolio. Know when to buy, sell, or hold.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Whether you're collecting Star Wars sets, Modular Buildings, Technic sets, or rare retired LEGO sets, 
                BrickCheck helps you make data-driven decisions about your collection. Monitor market trends, 
                track price changes, and optimize your LEGO investment strategy.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Real-time price updates from multiple sources',
                  'Historical price charts and trends',
                  'Collection value tracking',
                  'Barcode scanning for quick entry',
                  'Price alerts and notifications',
                  'Sealed and used condition tracking'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base md:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => setDownloadModalOpen(true)}
                size="lg" 
                className="mt-4 sm:mt-6 bg-gradient-lego-blue hover:opacity-90 text-white w-full sm:w-auto button-lift transition-all duration-300"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 animate-bounce-gentle" />
                Download Now
              </Button>
            </div>
            <div className="hidden sm:block order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-lego-vibrant rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-primary/20">
                  <BarChart3 className="h-20 w-20 sm:h-32 sm:w-32 mx-auto text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 leading-tight">
            Perfect for Every LEGO Collector
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
            Whether you're a casual collector or building a LEGO investment portfolio, BrickCheck helps you track and manage your sets
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 sm:mb-4">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Investment Collectors</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Track your LEGO sets as investments. Monitor price trends, track ROI, 
                  and identify the best time to buy or sell rare and retired sets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Serious Collectors</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Organize large collections with detailed tracking. Monitor sealed and used conditions, 
                  track acquisition history, and manage your entire LEGO portfolio in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Casual Collectors</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">
                  Keep track of your LEGO sets and their current values. 
                  Simple barcode scanning makes it easy to catalog your collection quickly.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose BrickCheck Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 leading-tight">
            Why Choose BrickCheck?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
            The most comprehensive LEGO collection tracking app available for iOS
          </p>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-lego-blue flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Real-Time Data</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  Get instant price updates from multiple LEGO marketplaces. Our app aggregates data 
                  from BrickLink, Brickset, and other sources to give you the most accurate market values.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-lego-green flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Secure & Private</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  Your collection data is secure and private. We use industry-standard encryption 
                  to protect your information and never share your data with third parties.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-lego-red flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Save Time</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  Barcode scanning and automatic set detection save hours of manual data entry. 
                  Add sets to your collection in seconds, not minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-lego-yellow flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Comprehensive Analytics</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  View detailed price charts, track collection value over time, and analyze 
                  which sets are performing best in your portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center mb-10 sm:mb-16">
            Everything you need to know about BrickCheck
          </p>

          <div className="space-y-4 sm:space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">How does BrickCheck track LEGO set prices?</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base pt-2">
                  BrickCheck aggregates price data from multiple sources including BrickLink, Brickset, 
                  and other LEGO marketplaces. We update prices regularly and provide historical charts 
                  so you can track price trends over time. Our pricing engine analyzes multiple data points 
                  to give you accurate market values for both sealed and used sets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Can I track both sealed and used LEGO sets?</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base pt-2">
                  Yes! BrickCheck supports tracking both sealed (new in box) and used sets. You can specify 
                  the condition when adding sets to your collection, and our app tracks separate price data 
                  for each condition. For used sets, you can also track condition grades like Mint, Complete, 
                  or Incomplete.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">How does barcode scanning work?</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base pt-2">
                  Simply point your iPhone camera at the barcode on a LEGO set box. BrickCheck automatically 
                  identifies the set number and retrieves all set details including name, theme, year, piece count, 
                  and current market value. This makes adding sets to your collection quick and effortless.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">What types of price alerts can I set?</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base pt-2">
                  You can set custom price alerts for any set in your collection. Set threshold alerts to be 
                  notified when a set reaches a specific price, or percentage change alerts to know when values 
                  increase or decrease by a certain percentage. Perfect for timing your buying and selling decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Is my collection data secure?</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base pt-2">
                  Absolutely. Your collection data is encrypted and stored securely. We use industry-standard 
                  security practices and never share your personal collection information with third parties. 
                  Your data is private and only accessible by you.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Does BrickCheck work offline?</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base pt-2">
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
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-lego-vibrant border-0 shadow-xl sm:shadow-2xl card-hover transition-all duration-300">
            <CardHeader className="p-6 sm:p-8 md:pb-8 md:pt-12 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Ready to Track Your Collection?
              </h2>
              <CardDescription className="text-white/90 text-base sm:text-lg md:text-lg mb-2">
                Download BrickCheck on the App Store or Google Play and start monitoring your LEGO investments today.
              </CardDescription>
              <CardDescription className="text-white/80 text-sm sm:text-base">
                Join thousands of LEGO collectors who use BrickCheck to track, monitor, and optimize their collections.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 md:pb-12">
              <Button 
                onClick={() => setDownloadModalOpen(true)}
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto shadow-lg w-full sm:w-auto button-lift transition-all duration-300"
              >
                <Download className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 animate-bounce-gentle" />
                Download Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gradient-lego">BrickCheck</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Track your LEGO collection like stocks. Monitor prices, scan barcodes, and get alerts when values change.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                The premier LEGO collection tracking app for iOS. Perfect for collectors, investors, and LEGO enthusiasts.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Features</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>LEGO Collection Tracking</li>
                <li>Price Monitoring</li>
                <li>Barcode Scanning</li>
                <li>Price Alerts</li>
                <li>Market Value Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Download</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Available now on the App Store for iPhone and iPad, and Google Play for Android devices.
              </p>
              <Button 
                onClick={() => setDownloadModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-primary/50 hover:bg-primary/10 text-xs sm:text-sm w-full sm:w-auto button-lift transition-all duration-300"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 animate-bounce-gentle" />
                Download
              </Button>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground space-y-2">
            <p>&copy; {new Date().getFullYear()} BrickCheck. All rights reserved.</p>
            <p>LEGO is a trademark of the LEGO Group, which does not sponsor, authorize, or endorse this app.</p>
          </div>
        </div>
      </footer>

      {/* Download Modal */}
      <DownloadModal open={downloadModalOpen} onOpenChange={setDownloadModalOpen} />
      </div>
    </>
  )
}
