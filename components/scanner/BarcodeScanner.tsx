'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
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

      // Check if we're on HTTPS (required for camera access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS. Please use the production URL.')
      }

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found. Please check your camera permissions.')
      }

      // Use the first available camera (usually the default)
      const selectedDeviceId = videoInputDevices[0].deviceId

      if (!videoRef.current) {
        throw new Error('Video element not found')
      }

      // Request camera permissions explicitly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        
        // Set the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (permError) {
        throw new Error('Camera permission denied. Please allow camera access and try again.')
      }

      // Configure hints for QR code detection only (not barcodes)
      const hints = new Map()
      // Only enable QR code format - disable all barcode formats
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      codeReader.hints = hints

      let lastDetectedCode = ''
      let detectionCount = 0
      const REQUIRED_DETECTIONS = 2 // Require 2 detections of same code to confirm

      // Start continuous decoding
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText().trim()
            // Clean up the code (remove spaces, validate)
            const cleanCode = code.replace(/\s+/g, '')
            
            // QR codes can contain any text, so we accept any non-empty code
            if (cleanCode && cleanCode.length > 0) {
              if (cleanCode === lastDetectedCode) {
                detectionCount++
                // Only process after multiple confirmations to avoid false positives
                if (detectionCount >= REQUIRED_DETECTIONS) {
                  console.log('Barcode confirmed:', cleanCode)
                  stopScanning()
                  onScan(cleanCode)
                }
              } else {
                // New code detected, reset counter
                lastDetectedCode = cleanCode
                detectionCount = 1
              }
            }
          }
          if (err) {
            // Silently ignore NotFoundException - it's normal when scanning
            if (
              err.name !== 'NotFoundException' &&
              err.name !== 'NoBarcodeDetectedException' &&
              !err.message?.includes('No MultiFormat Readers') &&
              !err.message?.includes('No barcode detected')
            ) {
              // Only log occasionally to avoid console spam
              if (Math.random() < 0.01) {
                console.debug('Scanning...', err.name)
              }
            }
          }
        }
      )
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
    // Clear any scanning intervals
    if (codeReaderRef.current && (codeReaderRef.current as any).scanInterval) {
      clearInterval((codeReaderRef.current as any).scanInterval)
    }

    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    
    setIsScanning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barcode Scanner</CardTitle>
        <CardDescription>Point your camera at a QR code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isScanning ? '' : 'hidden'}`}
            playsInline
            autoPlay
            muted
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
          QR codes.
        </p>
      </CardContent>
    </Card>
  )
}

