'use client'

import React from 'react'
import Image from 'next/image'

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
 * Set image component with BrickCheckLogo fallback
 * Displays the BrickCheckLogo when image fails to load or is not available
 * Uses Next.js Image for optimization
 */
export function SetImage({ src, alt, className = 'w-full h-full object-cover', containerClassName, width = 800, height = 800, priority = false }: SetImageProps) {
  const [imageError, setImageError] = React.useState(false)
  const [logoError, setLogoError] = React.useState(false)

  const hasImage = src && !imageError

  if (!hasImage) {
    return (
      <div className={containerClassName || 'w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground'}>
        {!logoError ? (
          <img
            src="/BrickCheckLogo.png"
            alt="BrickCheck Logo"
            className="w-12 h-12 object-contain opacity-50"
            onError={() => setLogoError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center text-2xl opacity-30">🧱</div>
        )}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
    />
  )
}

