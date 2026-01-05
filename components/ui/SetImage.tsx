'use client'

import React from 'react'
import { Package } from 'lucide-react'

interface SetImageProps {
  src?: string | null
  alt: string
  className?: string
  containerClassName?: string
  width?: number
  height?: number
  priority?: boolean
}

/**
 * Set image component with fallback to Package icon
 * Displays a package icon when image fails to load or is not available
 */
export function SetImage({ src, alt, className = 'w-full h-full object-cover', containerClassName, width = 800, height = 800, priority = false }: SetImageProps) {
  const [imageError, setImageError] = React.useState(false)

  const hasImage = src && !imageError

  if (!hasImage) {
    return (
      <div className={containerClassName || 'w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground'}>
        <Package className="w-12 h-12 text-muted-foreground opacity-50" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width={width}
      height={height}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

