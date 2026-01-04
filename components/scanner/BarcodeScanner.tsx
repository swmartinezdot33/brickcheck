'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserQRCodeReader, BarcodeFormat } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CameraOff, ScanLine } from 'lucide-react'
import { QRPopup } from './QRPopup'
import { useRouter } from 'next/navigation'

interface DetectedCode {
  id: string // Unique ID for this code (code + format)
  code: string
  format: BarcodeFormat
  x: number // Center X coordinate (0-1 normalized)
  y: number // Center Y coordinate (0-1 normalized)
  width: number // Width (0-1 normalized)
  height: number // Height (0-1 normalized)
  timestamp: number
  setInfo?: {
    name: string
    imageUrl: string | null
    setNumber: string
    theme?: string
    year?: number
  } | null
}

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
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)
  const [detectedCodes, setDetectedCodes] = useState<Map<string, DetectedCode>>(new Map())
  const pruningIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Format display names
  const getFormatName = (format: BarcodeFormat): string => {
    return format === BarcodeFormat.QR_CODE ? 'QR Code' : format.toString()
  }

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

  // Prune stale codes (not seen for > 500ms for faster updates)
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
      }, 200) // Check every 200ms
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

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
      if (pruningIntervalRef.current) {
        clearInterval(pruningIntervalRef.current)
      }
    }
  }, [])

  // Note: Coordinates are already normalized to 0-1 range based on video source dimensions
  // The video element uses object-cover which maintains aspect ratio, so normalized
  // coordinates should map correctly to the display

  // Lookup set information for a detected QR code
  const lookupSetInfo = async (code: string, format: BarcodeFormat): Promise<DetectedCode['setInfo'] | null> => {
    try {
      // BrowserQRCodeReader only returns QR codes
      // QR codes from LEGO typically contain URLs with set numbers
      
      // For QR codes (which should be URLs or set numbers), try scanLookup
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

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)
      setDetectedCodes(new Map())

      // Check if we're on HTTPS (required for camera access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS. Please use the production URL.')
      }

      // Use BrowserQRCodeReader for better QR code detection
      // This is more reliable than BrowserMultiFormatReader with restricted formats
      const codeReader = new BrowserQRCodeReader()
      codeReaderRef.current = codeReader
      
      console.log('[Scanner] ✅ Using QR code reader (QR codes only)')

      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found. Please check your camera permissions.')
      }

      // Prefer back camera on mobile, but use any available camera on desktop
      let selectedDeviceId = videoInputDevices[0].deviceId
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      if (isMobile) {
        // On mobile, prefer back camera (environment)
        const backCamera = videoInputDevices.find(
          (device) => device.label.toLowerCase().includes('back') || 
                      device.label.toLowerCase().includes('rear') ||
                      device.label.toLowerCase().includes('environment')
        )
        if (backCamera) {
          selectedDeviceId = backCamera.deviceId
        }
      } else {
        // On desktop, prefer the first non-virtual camera (webcams usually come first)
        const webcam = videoInputDevices.find(
          (device) => !device.label.toLowerCase().includes('virtual') &&
                      !device.label.toLowerCase().includes('screen')
        )
        if (webcam) {
          selectedDeviceId = webcam.deviceId
        }
      }

      if (!videoRef.current) {
        throw new Error('Video element not found')
      }

      // Request camera permissions explicitly
      try {
        let constraints: MediaStreamConstraints
        
        if (isMobile) {
          // On mobile, use facingMode
          constraints = {
            video: {
              facingMode: 'environment', // Back camera on mobile
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          }
        } else {
          // On desktop, use deviceId (prefer specific device, fallback to default)
          constraints = {
            video: {
              deviceId: { ideal: selectedDeviceId }, // Prefer specific device
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          }
        }
        
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (deviceError) {
          // If deviceId fails on desktop, try without it (fallback to default camera)
          if (!isMobile) {
            console.warn('Failed with specific device, trying default camera:', deviceError)
            constraints = {
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            }
            stream = await navigator.mediaDevices.getUserMedia(constraints)
          } else {
            throw deviceError
          }
        }
        
        // Set the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Wait for video to be ready before starting decode
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = () => {
                resolve(undefined)
              }
            }
          })
        }
      } catch (permError) {
        console.error('Camera access error:', permError)
        if (permError instanceof Error) {
          if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
            throw new Error('Camera permission denied. Please allow camera access in your browser settings and try again.')
          } else if (permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError') {
            throw new Error('No camera found. Please connect a camera and try again.')
          } else if (permError.name === 'NotReadableError' || permError.name === 'TrackStartError') {
            throw new Error('Camera is already in use by another application. Please close other apps using the camera.')
          }
        }
        throw new Error(`Camera access failed: ${permError instanceof Error ? permError.message : 'Unknown error'}`)
      }

      // Ensure video is playing before starting decode
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.warn('Video play failed:', err)
        })
      }

      // Start continuous decoding - don't auto-confirm
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const format = result.getBarcodeFormat()
            const code = result.getText().trim()
            
            // BrowserQRCodeReader only returns QR codes, but verify anyway
            if (format !== BarcodeFormat.QR_CODE) {
              console.warn(`[Scanner] ⚠️  Unexpected format from QR reader: ${format}`)
              return
            }
            
            // Log QR code detection
            // console.log(`[Scanner] ✅ QR Code detected: ${code.substring(0, 100)}`)
            
            // Preserve the full text (may contain URLs)
            const cleanCode = code

            if (cleanCode && cleanCode.length > 0) {
              // Get result points (corners of the barcode)
              const resultPoints = result.getResultPoints()
              
              if (resultPoints && resultPoints.length >= 2) {
                // Calculate bounding box from result points
                let minX = Infinity
                let maxX = -Infinity
                let minY = Infinity
                let maxY = -Infinity

                for (const point of resultPoints) {
                  const x = point.getX()
                  const y = point.getY()
                  minX = Math.min(minX, x)
                  maxX = Math.max(maxX, x)
                  minY = Math.min(minY, y)
                  maxY = Math.max(maxY, y)
                }

                // Get video dimensions for normalization
                const video = videoRef.current
                if (video) {
                  const videoWidth = video.videoWidth || 1280
                  const videoHeight = video.videoHeight || 720

                  // Normalize coordinates to 0-1 range
                  const centerX = ((minX + maxX) / 2) / videoWidth
                  const centerY = ((minY + maxY) / 2) / videoHeight
                  const width = (maxX - minX) / videoWidth
                  const height = (maxY - minY) / videoHeight

                  // Create unique ID for this code
                  const codeId = `${cleanCode}_${format}`

                  // Update detected codes
                  setDetectedCodes((prev) => {
                    const updated = new Map(prev)
                    const existingCode = prev.get(codeId)
                    
                    // Only lookup set info if this is a new detection or we don't have info yet
                    if (!existingCode || !existingCode.setInfo) {
                      // Async lookup set information
                      lookupSetInfo(cleanCode, format).then((setInfo) => {
                        if (setInfo) { // Only update if we found info
                          setDetectedCodes((prev) => {
                            const updated = new Map(prev)
                            const code = updated.get(codeId)
                            if (code) {
                              updated.set(codeId, { ...code, setInfo })
                            }
                            return updated
                          })
                        }
                      }).catch((err) => {
                        // Silently fail - set info is optional
                        console.debug('Set lookup failed for code:', cleanCode, err)
                      })
                    }
                    
                    updated.set(codeId, {
                      id: codeId,
                      code: cleanCode,
                      format: format, // Store as BarcodeFormat enum
                      x: centerX,
                      y: centerY,
                      width: Math.max(width, 0.1), // Minimum width for visibility
                      height: Math.max(height, 0.05), // Minimum height for visibility
                      timestamp: Date.now(),
                      setInfo: existingCode?.setInfo, // Preserve existing setInfo if any
                    })
                    return updated
                  })
                }
              }
            }
          }
          if (err) {
            // Log errors for debugging (but not too frequently)
            if (err.name === 'NotFoundException' || err.name === 'NoBarcodeDetectedException') {
              // This is normal - log occasionally to see detection attempts
              if (Math.random() < 0.01) {
                console.debug('[Scanner] 🔍 Scanning for QR codes...')
              }
            } else {
              // Log other errors for debugging
              console.warn('[Scanner] ⚠️  Detection error:', err.name, err.message?.substring(0, 100))
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
    setDetectedCodes(new Map())
  }

  const handleCodeClick = (code: DetectedCode) => {
    console.log('Code selected:', code.code, code.format)
    stopScanning()
    onScan(code.code)
  }

  const codesArray = Array.from(detectedCodes.values())

  // Check if we're in full screen mode (mobile) - use state to avoid hydration issues
  const [isFullScreen, setIsFullScreen] = useState(false)
  
  useEffect(() => {
    const checkFullScreen = () => {
      setIsFullScreen(window.innerWidth < 768)
    }
    checkFullScreen()
    window.addEventListener('resize', checkFullScreen)
    return () => window.removeEventListener('resize', checkFullScreen)
  }, [])

  return (
    <Card className={isFullScreen ? 'border-0 shadow-none h-full flex flex-col' : ''}>
      {!isFullScreen && (
        <CardHeader>
          <CardTitle>Scanner</CardTitle>
        <CardDescription>
          Point your camera at QR codes on LEGO boxes to instantly see set details.
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

          {/* Overlay layer for detected codes */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning visual aid */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <ScanLine className="w-64 h-64 text-white animate-pulse" />
              </div>
              
              {codesArray.map((code) => {
                // Calculate display coordinates
                const displayX = code.x * containerSize.width
                const displayY = code.y * containerSize.height

                if (!code.setInfo) return null

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
                      // Handled by parent if needed, but for now just pass the code scan
                      // Or we can add direct add functionality here
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
                  Start Scanning
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
