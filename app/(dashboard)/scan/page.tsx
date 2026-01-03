'use client'

import { useState } from 'react'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { ScanResult } from '@/components/scanner/ScanResult'

export default function ScanPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Scan Barcode</h1>
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
  )
}

