// Note: Facebook has deprecated fb:app_id - this warning can be safely ignored
// If you still want to add it, you'll need to create a Facebook App and add NEXT_PUBLIC_FACEBOOK_APP_ID to your environment variables
// For now, we're using a workaround by adding it via a custom component

export function MetadataHead() {
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  
  if (!facebookAppId) {
    return null
  }

  return (
    <meta property="fb:app_id" content={facebookAppId} />
  )
}



