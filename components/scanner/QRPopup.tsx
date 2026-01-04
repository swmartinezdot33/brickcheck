import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SetImage } from '@/components/ui/SetImage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Plus } from 'lucide-react'

interface SetInfo {
  name: string
  imageUrl: string | null
  setNumber: string
  theme?: string
  year?: number
}

interface QRPopupProps {
  setInfo: SetInfo
  position: { x: number; y: number }
  onOpen: () => void
  onAdd?: () => void
  containerWidth: number
  containerHeight: number
}

export function QRPopup({ setInfo, position, onOpen, onAdd, containerWidth, containerHeight }: QRPopupProps) {
  // Calculate position to keep popup within bounds
  // Default to above the QR code
  const popupWidth = 280
  const popupHeight = 160 // Approximate
  const padding = 16

  let top = position.y - popupHeight - 20
  let left = position.x - popupWidth / 2

  // If too close to top, show below
  if (top < padding) {
    top = position.y + 40
  }

  // If too close to left, push right
  if (left < padding) {
    left = padding
  }

  // If too close to right, push left
  if (left + popupWidth > containerWidth - padding) {
    left = containerWidth - popupWidth - padding
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute z-50 pointer-events-auto"
        style={{ top, left, width: popupWidth }}
      >
        <div className="bg-background/90 backdrop-blur-md rounded-xl shadow-2xl border-2 border-primary/20 overflow-hidden">
          <div className="p-3 flex gap-3">
            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0 border border-border/50">
              <SetImage
                src={setInfo.imageUrl}
                alt={setInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 h-5 bg-background/50">
                    #{setInfo.setNumber}
                  </Badge>
                  {setInfo.year && (
                    <span className="text-[10px] text-muted-foreground">{setInfo.year}</span>
                  )}
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                  {setInfo.name}
                </h3>
                {setInfo.theme && (
                  <p className="text-xs text-muted-foreground truncate">{setInfo.theme}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1 p-2 bg-muted/30 border-t border-border/50">
            {onAdd && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onAdd()
                }}
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Add
              </Button>
            )}
            <Button 
              size="sm" 
              className={`h-8 text-xs ${!onAdd ? 'col-span-2 w-full' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpen()
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Details
            </Button>
          </div>
        </div>
        
        {/* Connector arrow/triangle pointing to QR code */}
        {top < position.y ? (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/90 backdrop-blur-md border-r-2 border-b-2 border-primary/20 rotate-45 transform" />
        ) : (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background/90 backdrop-blur-md border-l-2 border-t-2 border-primary/20 rotate-45 transform" />
        )}
      </motion.div>
    </AnimatePresence>
  )
}


