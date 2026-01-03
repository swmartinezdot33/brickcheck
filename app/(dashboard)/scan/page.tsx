'use client'

import { useState } from 'react'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { ScanResult } from '@/components/scanner/ScanResult'

export default function ScanPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  return (
    <>
      {/* Mobile: Full screen scanner with minimal header */}
      <div className="md:hidden fixed inset-0 bg-black z-40 flex flex-col">
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b px-4 py-3 z-10">
          <h1 className="text-lg font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Scan Barcode
          </h1>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {!scannedCode ? (
            <div className="absolute inset-0">
              <BarcodeScanner
                onScan={(code) => {
                  setScannedCode(code)
                }}
                onError={(error) => {
                  console.error('Scanner error:', error)
                }}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <ScanResult
                gtin={scannedCode}
                onReset={() => {
                  setScannedCode(null)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Normal layout */}
      <div className="hidden md:block space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Scan Barcode
          </h1>
          <p className="text-muted-foreground">
            Scan a LEGO box barcode to identify and add sets to your collection
          </p>
        </div>

        {!scannedCode ? (
          <BarcodeScanner
            onScan={(code) => {
              setScannedCode(code)
            }}
            onError={(error) => {
              console.error('Scanner error:', error)
            }}
          />
        ) : (
          <div className="space-y-4">
            <ScanResult
              gtin={scannedCode}
              onReset={() => {
                setScannedCode(null)
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}

