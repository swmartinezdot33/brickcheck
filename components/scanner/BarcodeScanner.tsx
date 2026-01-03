'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, CameraOff } from 'lucide-react'

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
  } | null
}

export function BarcodeScanner({
  onScan,
  onError,
}: {
  onScan: (code: string) => void
  onError?: (error: Error) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const [detectedCodes, setDetectedCodes] = useState<Map<string, DetectedCode>>(new Map())
  const pruningIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Format display names
  const getFormatName = (format: BarcodeFormat): string => {
    const formatMap: Record<string, string> = {
      [BarcodeFormat.QR_CODE]: 'QR',
      [BarcodeFormat.DATA_MATRIX]: 'Data Matrix',
      [BarcodeFormat.EAN_13]: 'EAN-13',
      [BarcodeFormat.EAN_8]: 'EAN-8',
      [BarcodeFormat.UPC_A]: 'UPC-A',
      [BarcodeFormat.UPC_E]: 'UPC-E',
      [BarcodeFormat.CODE_128]: 'Code 128',
      [BarcodeFormat.CODE_39]: 'Code 39',
    }
    return formatMap[format] || format.toString()
  }

  // Prune stale codes (not seen for > 1 second)
  useEffect(() => {
    if (isScanning) {
      pruningIntervalRef.current = setInterval(() => {
        setDetectedCodes((prev) => {
          const now = Date.now()
          const updated = new Map(prev)
          for (const [id, code] of updated.entries()) {
            if (now - code.timestamp > 1000) {
              updated.delete(id)
            }
          }
          return updated
        })
      }, 500) // Check every 500ms
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

  // Lookup set information for a detected code
  const lookupSetInfo = async (code: string, format: BarcodeFormat): Promise<DetectedCode['setInfo'] | null> => {
    try {
      // Only lookup for QR codes, Data Matrix, or if it looks like a set number
      const isQR = format === BarcodeFormat.QR_CODE || format === BarcodeFormat.DATA_MATRIX
      const isSetNumber = /^\d{4,7}$/.test(code) || code.includes('lego.com') || code.includes('set=')
      
      if (!isQR && !isSetNumber) {
        // For barcodes, try GTIN lookup
        const res = await fetch(`/api/scanLookup?gtin=${encodeURIComponent(code)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.set) {
            return {
              name: data.set.name,
              imageUrl: data.set.image_url,
              setNumber: data.set.set_number,
            }
          }
        }
        return null
      }

      // For QR codes or set numbers, try scanLookup
      const res = await fetch(`/api/scanLookup?code=${encodeURIComponent(code)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.set) {
          return {
            name: data.set.name,
            imageUrl: data.set.image_url,
            setNumber: data.set.set_number,
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

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Configure hints - ONLY QR codes and Data Matrix (LEGO uses these)
      // Ignore all linear barcodes (UPC, EAN, etc.)
      const hints = new Map()
      // ONLY QR_CODE and DATA_MATRIX - LEGO uses these for digital instructions, minifigures, etc.
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,        // LEGO uses QR codes for instructions, minifigures, set registration
        BarcodeFormat.DATA_MATRIX,    // LEGO also uses Data Matrix codes
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)
      hints.set(DecodeHintType.ASSUME_GS1, false) // Don't assume GS1 format
      // Additional hints for better QR code detection
      hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8')
      // More aggressive QR code detection
      hints.set(DecodeHintType.PURE_BARCODE, false) // Allow QR codes with surrounding text/noise
      codeReader.hints = hints
      
      // Log configured formats for debugging
      console.log('[Scanner] Configured formats (QR/Data Matrix only):', hints.get(DecodeHintType.POSSIBLE_FORMATS))

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
            
            // ONLY process QR codes and Data Matrix - ignore everything else
            if (format !== BarcodeFormat.QR_CODE && format !== BarcodeFormat.DATA_MATRIX) {
              // Silently ignore non-QR/Data Matrix codes
              return
            }
            
            const code = result.getText().trim()
            
            // Preserve the full text for QR/Data Matrix (may contain URLs)
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

                  // Log detection for debugging
                  console.log(`[Scanner] ✅ Detected ${format === BarcodeFormat.QR_CODE ? 'QR_CODE' : 'DATA_MATRIX'}:`, cleanCode.substring(0, 100))

                  // Update detected codes
                  setDetectedCodes((prev) => {
                    const updated = new Map(prev)
                    const existingCode = prev.get(codeId)
                    
                    // Only lookup set info if this is a new detection or we don't have info yet
                    if (!existingCode || !existingCode.setInfo) {
                      // Async lookup set information
                      lookupSetInfo(cleanCode, format).then((setInfo) => {
                        setDetectedCodes((prev) => {
                          const updated = new Map(prev)
                          const code = updated.get(codeId)
                          if (code) {
                            updated.set(codeId, { ...code, setInfo })
                          }
                          return updated
                        })
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
            // Log QR code detection attempts for debugging
            if (err.name === 'NotFoundException' || err.name === 'NoBarcodeDetectedException') {
              // This is normal - log occasionally to see detection attempts
              if (Math.random() < 0.05) {
                console.debug('[Scanner] Scanning for codes...')
              }
            } else if (
              err.name !== 'NotFoundException' &&
              err.name !== 'NoBarcodeDetectedException' &&
              !err.message?.includes('No barcode detected')
            ) {
              // Log other errors more frequently for debugging
              if (Math.random() < 0.1) {
                console.debug('[Scanner] Error:', err.name, err.message)
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
          <CardTitle>Barcode Scanner</CardTitle>
        <CardDescription>
          Point your camera at QR codes on LEGO boxes. Tap a detected code to select it.
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
              {codesArray.map((code) => {
                // Calculate display coordinates
                const displayX = code.x * 100 // Convert to percentage
                const displayY = code.y * 100
                const displayWidth = code.width * 100
                const displayHeight = code.height * 100

                return (
                  <button
                    key={code.id}
                    onClick={() => handleCodeClick(code)}
                    className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-105 z-10"
                    style={{
                      left: `${displayX}%`,
                      top: `${displayY}%`,
                      minWidth: code.setInfo ? '140px' : '80px',
                    }}
                  >
                    <Badge 
                      variant="default" 
                      className={`bg-primary/90 hover:bg-primary text-white shadow-lg border-2 border-white/50 px-2 py-1.5 text-xs font-semibold cursor-pointer ${
                        code.setInfo ? 'flex items-center gap-2' : ''
                      }`}
                    >
                      {code.setInfo?.imageUrl && (
                        <img
                          src={code.setInfo.imageUrl}
                          alt={code.setInfo.name}
                          className="w-8 h-8 rounded object-cover border border-white/30"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold">{getFormatName(code.format)}</span>
                        {code.setInfo ? (
                          <span className="text-[10px] opacity-90 truncate max-w-[100px] font-medium">
                            {code.setInfo.name.length > 15 ? `${code.setInfo.name.substring(0, 15)}...` : code.setInfo.name}
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-90 truncate max-w-[120px]">
                            {code.code.length > 12 ? `${code.code.substring(0, 12)}...` : code.code}
                          </span>
                        )}
                      </div>
                    </Badge>
                  </button>
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
                  Stop Scanning
                </Button>
              )}
            </div>

        <p className="text-xs text-muted-foreground text-center">
          Make sure to allow camera access when prompted. Only QR codes and Data Matrix codes are detected (linear barcodes are ignored).
        </p>

            {isScanning && codesArray.length > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                {codesArray.length} code{codesArray.length !== 1 ? 's' : ''} detected
              </div>
            )}
          </>
        )}
        
        {isFullScreen && (
          <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="flex-1" size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="flex-1" size="lg">
                  <CameraOff className="h-5 w-5 mr-2" />
                  Stop Scanning
                </Button>
              )}
            </div>
            {isScanning && codesArray.length > 0 && (
              <div className="text-sm text-white text-center mt-2 bg-black/50 rounded px-3 py-1">
                {codesArray.length} code{codesArray.length !== 1 ? 's' : ''} detected
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
