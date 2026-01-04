'use client'

import { useRouter } from 'next/navigation'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ScanPage() {
  const router = useRouter()

  return (
    <>
      {/* Mobile: Full screen scanner */}
      <div className="md:hidden fixed inset-0 bg-black z-50">
        {/* Close button - overlay in top right */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="absolute top-4 right-2 z-20 h-10 w-10 p-0 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Full screen camera */}
        <div className="w-full h-full">
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
