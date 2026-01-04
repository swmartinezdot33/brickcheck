'use client'

import { useRouter } from 'next/navigation'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ScanPage() {
  const router = useRouter()

  return (
    <>
      {/* Mobile: Full screen scanner - no navbar, no bottom nav */}
      <div className="md:hidden fixed inset-0 bg-black z-50 flex flex-col">
        {/* Minimal header with close button */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10 safe-area-inset-top">
          <div className="w-10" /> {/* Spacer */}
          <h1 className="text-white font-bold text-lg">Scan</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Scanner - full screen */}
        <div className="flex-1 pt-14">
          <BarcodeScanner
            onScan={(code) => {
              console.log('Scanned code:', code)
            }}
            onError={(error) => {
              console.error('Scanner error:', error)
            }}
          />
        </div>
      </div>

      {/* Desktop: Normal layout with header */}
      <div className="hidden md:block space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Scanner
          </h1>
          <p className="text-muted-foreground">
            Point your camera at QR codes on LEGO boxes to instantly see set details
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <BarcodeScanner
            onScan={(code) => {
              console.log('Scanned code:', code)
            }}
            onError={(error) => {
              console.error('Scanner error:', error)
            }}
          />
        </div>
      </div>
    </>
  )
}
