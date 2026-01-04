'use client'

import React from 'react'

interface SetImageProps {
  src?: string | null
  alt: string
  className?: string
  containerClassName?: string
}

/**
 * Set image component with BrickCheck logo fallback
 * Displays the BrickCheck logo when image fails to load or is not available
 */
export function SetImage({ src, alt, className = 'w-full h-full object-cover', containerClassName }: SetImageProps) {
  const [imageError, setImageError] = React.useState(false)

  const hasImage = src && !imageError

  if (!hasImage) {
    return (
      <div className={containerClassName || 'w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground'}>
        <img
          src="/BrickCheck Logo.png"
          alt="BrickCheck Logo"
          className="w-12 h-12 object-contain opacity-50"
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  )
}

