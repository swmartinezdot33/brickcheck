'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

export function BarcodeScanner({
  onScan,
  onError,
}: {
  onScan: (code: string) => void
  onError?: (error: Error) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found')
      }

      // Use the first available camera (usually the default)
      const selectedDeviceId = videoInputDevices[0].deviceId

      if (!videoRef.current) {
        throw new Error('Video element not found')
      }

      // Start decoding from video device
      codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          const code = result.getText()
          onScan(code)
          stopScanning()
        }
        if (err && !(err instanceof Error && err.message.includes('No MultiFormat Readers'))) {
          // Ignore "No MultiFormat Readers" error as it's just scanning
          console.debug('Scanning...', err)
        }
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start camera')
      setError(error.message)
      setIsScanning(false)
      if (onError) {
        onError(error)
      }
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setIsScanning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barcode Scanner</CardTitle>
        <CardDescription>Point your camera at a LEGO box barcode</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isScanning ? '' : 'hidden'}`}
            playsInline
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <CameraOff className="h-12 w-12" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Make sure to allow camera access when prompted. The scanner will automatically detect
          barcodes.
        </p>
      </CardContent>
    </Card>
  )
}

