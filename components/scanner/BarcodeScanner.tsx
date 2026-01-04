'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserQRCodeReader, BarcodeFormat } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CameraOff, ScanLine } from 'lucide-react'
import { QRPopup } from './QRPopup'
import { useRouter } from 'next/navigation'

interface DetectedCode {
  id: string
  code: string
  format: BarcodeFormat
  x: number
  y: number
  width: number
  height: number
  timestamp: number
  setInfo?: {
    name: string
    imageUrl: string | null
    setNumber: string
    theme?: string
    year?: number
  } | null
}

// Type definition for native BarcodeDetector API
interface BarcodeDetector {
  detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>
}

interface DetectedBarcode {
  format: string
  rawValue: string
  boundingBox: DOMRectReadOnly
  cornerPoints: ReadonlyArray<{ x: number; y: number }>
}

// Check if native BarcodeDetector API is available
const isBarcodeDetectorSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window

export function BarcodeScanner({
  onScan,
  onError,
}: {
  onScan: (code: string) => void
  onError?: (error: Error) => void
}) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [detectedCodes, setDetectedCodes] = useState<Map<string, DetectedCode>>(new Map())
  const pruningIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [detectionMethod, setDetectionMethod] = useState<string>('initializing')

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Prune stale codes
  useEffect(() => {
    if (isScanning) {
      pruningIntervalRef.current = setInterval(() => {
        setDetectedCodes((prev) => {
          const now = Date.now()
          const updated = new Map(prev)
          let changed = false
          for (const [id, code] of updated.entries()) {
            if (now - code.timestamp > 500) {
              updated.delete(id)
              changed = true
            }
          }
          return changed ? updated : prev
        })
      }, 200)
    } else {
      if (pruningIntervalRef.current) {
        clearInterval(pruningIntervalRef.current)
        pruningIntervalRef.current = null
      }
    }

    return () => {
      if (pruningIntervalRef.current) {
        clearInterval(pruningIntervalRef.current)
      }
    }
  }, [isScanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  // Lookup set information
  const lookupSetInfo = async (code: string, format: BarcodeFormat): Promise<DetectedCode['setInfo'] | null> => {
    try {
      const res = await fetch(`/api/scanLookup?code=${encodeURIComponent(code)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.set) {
          return {
            name: data.set.name,
            imageUrl: data.set.image_url,
            setNumber: data.set.set_number,
            theme: data.set.theme,
            year: data.set.year,
          }
        }
      }
      return null
    } catch (error) {
      console.debug('Set lookup error:', error)
      return null
    }
  }

  // Process detected code
  const processDetectedCode = useCallback((code: string, boundingBox?: DOMRectReadOnly, format: BarcodeFormat = BarcodeFormat.QR_CODE) => {
    if (!code || code.trim().length === 0) return

    const cleanCode = code.trim()
    const codeId = `${cleanCode}_${format}`
    const now = Date.now()

    // Check if we already have this code
    setDetectedCodes((prev) => {
      const existing = prev.get(codeId)
      if (existing && now - existing.timestamp < 100) {
        // Already processed recently, skip
        return prev
      }

      const video = videoRef.current
      if (!video) return prev

      const videoWidth = video.videoWidth || 1280
      const videoHeight = video.videoHeight || 720

      // Calculate normalized coordinates
      let centerX = 0.5
      let centerY = 0.5
      let width = 0.1
      let height = 0.1

      if (boundingBox) {
        centerX = (boundingBox.x + boundingBox.width / 2) / videoWidth
        centerY = (boundingBox.y + boundingBox.height / 2) / videoHeight
        width = boundingBox.width / videoWidth
        height = boundingBox.height / videoHeight
      }

      const updated = new Map(prev)
      const existingCode = updated.get(codeId)

      // Only lookup if we don't have info yet
      if (!existingCode || !existingCode.setInfo) {
        lookupSetInfo(cleanCode, format).then((setInfo) => {
          setDetectedCodes((prev) => {
            const updated = new Map(prev)
            const code = updated.get(codeId)
            if (code) {
              updated.set(codeId, { ...code, setInfo: setInfo || null })
            }
            return updated
          })
          if (setInfo) {
            console.log(`[Scanner] ✅ Set found: ${setInfo.name} (#${setInfo.setNumber})`)
          }
        }).catch((err) => {
          console.error('Set lookup failed:', err)
          setDetectedCodes((prev) => {
            const updated = new Map(prev)
            const code = updated.get(codeId)
            if (code) {
              updated.set(codeId, { ...code, setInfo: null })
            }
            return updated
          })
        })
      }

      updated.set(codeId, {
        id: codeId,
        code: cleanCode,
        format,
        x: centerX,
        y: centerY,
        width: Math.max(width, 0.1),
        height: Math.max(height, 0.05),
        timestamp: now,
        setInfo: existingCode?.setInfo,
      })

      // Call onScan callback immediately
      if (onScan) {
        console.log(`[Scanner] 📞 Calling onScan callback with: ${cleanCode.substring(0, 50)}`)
        try {
          onScan(cleanCode)
        } catch (err) {
          console.error('[Scanner] ❌ Error in onScan callback:', err)
        }
      }

      console.log(`[Scanner] ✅ Code added to detected codes: ${codeId}`)
      return updated
    })
  }, [onScan])

  // Native BarcodeDetector scanning (most modern and fastest)
  const scanWithBarcodeDetector = useCallback(() => {
    if (!videoRef.current || !barcodeDetectorRef.current || !isScanning) return

    const video = videoRef.current
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    barcodeDetectorRef.current
      .detect(canvas)
      .then((barcodes) => {
        for (const barcode of barcodes) {
          if (barcode.format === 'qr_code' && barcode.rawValue) {
            console.log(`[Scanner] ✅ Native API detected QR: ${barcode.rawValue.substring(0, 50)}`)
            processDetectedCode(barcode.rawValue, barcode.boundingBox, BarcodeFormat.QR_CODE)
          }
        }
      })
      .catch((err) => {
        // Silently handle detection errors (normal when no code present)
        if (err.name !== 'NotFoundError') {
          console.debug('[Scanner] BarcodeDetector error:', err)
        }
      })

    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanWithBarcodeDetector)
    }
  }, [isScanning, processDetectedCode])

  // Start scanning with native BarcodeDetector
  const startBarcodeDetector = useCallback(async (stream: MediaStream) => {
    try {
      // Check if BarcodeDetector is supported
      if (!isBarcodeDetectorSupported) {
        throw new Error('BarcodeDetector not supported')
      }

      // Create BarcodeDetector instance
      const BarcodeDetectorConstructor = (window as any).BarcodeDetector as new (options?: { formats: string[] }) => BarcodeDetector
      const detector = new BarcodeDetectorConstructor({
        formats: ['qr_code']
      })
      barcodeDetectorRef.current = detector

      setDetectionMethod('Native BarcodeDetector API')
      console.log('[Scanner] 🚀 Using Native BarcodeDetector API (fastest)')

      // Start scanning loop
      scanWithBarcodeDetector()
    } catch (err) {
      console.warn('[Scanner] BarcodeDetector failed, falling back:', err)
      throw err
    }
  }, [scanWithBarcodeDetector])


  // Start scanning with ZXing (most reliable)
  const startZXing = useCallback(async (stream: MediaStream, deviceId: string) => {
    try {
      const codeReader = new BrowserQRCodeReader()
      codeReaderRef.current = codeReader

      setDetectionMethod('ZXing Library (QR Code Optimized)')
      console.log('[Scanner] 📚 Using ZXing library optimized for QR codes')

      const video = videoRef.current
      if (!video) throw new Error('Video element not found')

      console.log('[Scanner] Starting ZXing decodeFromVideoDevice...')

      codeReader.decodeFromVideoDevice(
        deviceId,
        video,
        (result, err) => {
          if (err) {
            const errName = err && typeof err === 'object' && 'name' in err ? (err as { name: string }).name : ''
            if (errName !== 'NotFoundException' && errName !== 'NoBarcodeDetectedException') {
              console.debug('[Scanner] ZXing error:', errName)
            }
            return
          }

          if (result) {
            const format = result.getBarcodeFormat()
            const code = result.getText().trim()

            console.log(`[Scanner] 🎯 ZXing raw result - format: ${format}, code: ${code.substring(0, 100)}`)

            if (format === BarcodeFormat.QR_CODE && code) {
              console.log(`[Scanner] ✅ ZXing detected QR code: ${code.substring(0, 50)}`)
              
              // Get bounding box from result points
              const resultPoints = result.getResultPoints()
              let boundingBox: DOMRectReadOnly | undefined

              if (resultPoints && resultPoints.length >= 2) {
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
                for (const point of resultPoints) {
                  minX = Math.min(minX, point.getX())
                  maxX = Math.max(maxX, point.getX())
                  minY = Math.min(minY, point.getY())
                  maxY = Math.max(maxY, point.getY())
                }
                boundingBox = new DOMRectReadOnly(minX, minY, maxX - minX, maxY - minY)
                console.log(`[Scanner] 📦 Bounding box: x=${minX}, y=${minY}, w=${maxX - minX}, h=${maxY - minY}`)
              }

              // Process immediately
              processDetectedCode(code, boundingBox, format)
            } else {
              console.warn(`[Scanner] ⚠️ Unexpected format or empty code: format=${format}, code=${code}`)
            }
          } else {
            console.warn('[Scanner] ⚠️ ZXing returned result but it was null/undefined')
          }
        }
      )
      
      console.log('[Scanner] ✅ ZXing decodeFromVideoDevice started')
    } catch (err) {
      console.error('[Scanner] ❌ ZXing failed:', err)
      throw err
    }
  }, [processDetectedCode])

  const startScanning = async () => {
    try {
      console.log('[Scanner] 🚀 Starting sophisticated QR scanner...')
      setError(null)
      setIsScanning(true)
      setDetectedCodes(new Map())

      // Check HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS. Please use the production URL.')
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      console.log(`[Scanner] Device type: ${isMobile ? 'MOBILE' : 'DESKTOP'}`)

      // Get camera stream with optimal settings
      // MOBILE: Use environment (rear) camera
      // DESKTOP: Use user (front) camera
      const facingMode = isMobile ? 'environment' : 'user'
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 },
        },
      }

      console.log(`[Scanner] Requesting camera with facingMode: ${facingMode}`)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Log actual camera info
      const videoTracks = stream.getVideoTracks()
      if (videoTracks.length > 0) {
        const settings = videoTracks[0].getSettings()
        console.log(`[Scanner] Camera settings:`, settings)
        console.log(`[Scanner] Actual camera resolution: ${settings.width}x${settings.height}`)
      }

      if (!videoRef.current) {
        throw new Error('Video element not found')
      }

      videoRef.current.srcObject = stream
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(undefined)
        }
      })

      await videoRef.current.play()

      // Try detection methods in order of preference
      try {
        // Method 1: Native BarcodeDetector (fastest, most modern)
        await startBarcodeDetector(stream)
      } catch (err1) {
        console.log('[Scanner] BarcodeDetector failed, trying ZXing...', err1)
        try {
          // Method 2: ZXing (most reliable, works with our video element)
          const codeReader = new BrowserQRCodeReader()
          const devices = await codeReader.listVideoInputDevices()
          console.log('[Scanner] Available devices:', devices)
          const deviceId = devices[0]?.deviceId || 'default'
          console.log(`[Scanner] Using device: ${deviceId}`)
          await startZXing(stream, deviceId)
        } catch (err2) {
          console.error('[Scanner] All detection methods failed:', err2)
          throw err2
        }
      }

      console.log(`[Scanner] ✅ Scanner active using: ${detectionMethod}`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start camera')
      console.error('[Scanner] ❌ Failed to start:', error)
      setError(error.message)
      setIsScanning(false)
      if (onError) {
        onError(error)
      }
    }
  }

  const stopScanning = () => {
    console.log('[Scanner] 🛑 Stopping scanner...')

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop ZXing
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (e) {
        // Ignore reset errors
      }
      codeReaderRef.current = null
    }


    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    setDetectedCodes(new Map())
    setDetectionMethod('stopped')
  }

  const codesArray = Array.from(detectedCodes.values())
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    const checkFullScreen = () => {
      setIsFullScreen(window.innerWidth < 768)
    }
    checkFullScreen()
    window.addEventListener('resize', checkFullScreen)
    return () => window.removeEventListener('resize', checkFullScreen)
  }, [])

  // Auto-start on mobile
  useEffect(() => {
    if (isFullScreen && !isScanning && !error) {
      const timer = setTimeout(() => {
        startScanning().catch((err) => {
          console.error('[Scanner] Auto-start failed:', err)
          if (onError) {
            onError(err instanceof Error ? err : new Error(String(err)))
          }
        })
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen])

  return (
    <Card className={isFullScreen ? 'border-0 shadow-none h-full flex flex-col' : ''}>
      {!isFullScreen && (
        <CardHeader>
          <CardTitle>AR Set Scanner</CardTitle>
          <CardDescription>
            Point your camera at QR codes on LEGO boxes to instantly see set details.
            {detectionMethod !== 'stopped' && detectionMethod !== 'initializing' && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Using: {detectionMethod}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={`space-y-4 ${isFullScreen ? 'flex-1 flex flex-col p-0' : ''}`}>
        <div 
          ref={containerRef}
          className={`relative bg-black overflow-hidden ${
            isFullScreen ? 'flex-1 w-full h-full' : 'aspect-video rounded-lg'
          }`}
        >
          {/* Hidden canvas for BarcodeDetector */}
          <canvas ref={canvasRef} className="hidden" />

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

          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-primary/50 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine className="w-32 h-32 text-primary/30 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Detected codes */}
              {codesArray.length > 0 && (
                <div className="absolute top-4 left-4 z-50 bg-black/80 text-white px-3 py-2 rounded text-xs">
                  Detected: {codesArray.length} code(s)
                </div>
              )}
              {codesArray.map((code) => {
                const displayX = code.x * containerSize.width
                const displayY = code.y * containerSize.height

                console.log(`[Scanner] Rendering code ${code.id} at (${displayX}, ${displayY})`)

                if (!code.setInfo) {
                  return (
                    <div
                      key={code.id}
                      className="absolute z-40 pointer-events-auto"
                      style={{
                        left: Math.max(10, Math.min(displayX - 60, containerSize.width - 130)),
                        top: Math.max(10, Math.min(displayY - 40, containerSize.height - 100)),
                        width: 120,
                      }}
                    >
                      <div className="bg-yellow-500/95 backdrop-blur-sm rounded-lg px-3 py-2 border-2 border-yellow-400 shadow-xl">
                        <p className="text-xs font-semibold text-white text-center">
                          QR Code Detected
                        </p>
                        <p className="text-[10px] text-yellow-100 text-center mt-1 truncate">
                          {code.code.substring(0, 30)}...
                        </p>
                        <p className="text-[10px] text-yellow-200 text-center mt-1">
                          Set not found
                        </p>
                      </div>
                    </div>
                  )
                }

                return (
                  <QRPopup
                    key={code.id}
                    setInfo={code.setInfo}
                    position={{ x: displayX, y: displayY }}
                    containerWidth={containerSize.width}
                    containerHeight={containerSize.height}
                    onOpen={() => {
                      if (code.setInfo) {
                        router.push(`/browse/${code.setInfo.setNumber}`)
                      }
                    }}
                    onAdd={() => {
                      onScan(code.code)
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
            {error}
          </div>
        )}

        {!isFullScreen && (
          <>
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Start AR Scanner
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="flex-1">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Scanner
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Point at a LEGO box QR code to see set details.
            </p>
          </>
        )}

        {isFullScreen && (
          <div className="absolute bottom-8 left-0 right-0 px-4 z-20 flex justify-center">
            {!isScanning ? (
              <Button onClick={startScanning} className="rounded-full h-16 w-16 bg-primary shadow-lg border-4 border-white/20">
                <Camera className="h-8 w-8" />
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="rounded-full h-16 w-16 shadow-lg border-4 border-white/20">
                <CameraOff className="h-8 w-8" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
