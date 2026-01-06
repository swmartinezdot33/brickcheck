'use client'

import { useEffect } from 'react'

export function FacebookMeta() {
  useEffect(() => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    
    if (facebookAppId) {
      // Check if meta tag already exists
      let metaTag = document.querySelector('meta[property="fb:app_id"]')
      
      if (!metaTag) {
        // Create and add the meta tag
        metaTag = document.createElement('meta')
        metaTag.setAttribute('property', 'fb:app_id')
        metaTag.setAttribute('content', facebookAppId)
        document.head.appendChild(metaTag)
      } else {
        // Update existing meta tag
        metaTag.setAttribute('content', facebookAppId)
      }
    }
  }, [])

  return null
}



