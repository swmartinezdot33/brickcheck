/**
 * Utility functions for managing collection selection persistence
 */

const COLLECTION_ID_KEY = 'brickcheck_selected_collection_id'

/**
 * Get the selected collection ID from localStorage
 */
export function getSelectedCollectionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(COLLECTION_ID_KEY)
  } catch (error) {
    console.error('Error reading collection ID from localStorage:', error)
    return null
  }
}

/**
 * Save the selected collection ID to localStorage
 */
export function setSelectedCollectionId(collectionId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COLLECTION_ID_KEY, collectionId)
  } catch (error) {
    console.error('Error saving collection ID to localStorage:', error)
  }
}

/**
 * Remove the selected collection ID from localStorage
 */
export function clearSelectedCollectionId(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(COLLECTION_ID_KEY)
  } catch (error) {
    console.error('Error clearing collection ID from localStorage:', error)
  }
}

/**
 * Get collection ID from URL params or localStorage (URL takes precedence)
 */
export function getCollectionIdFromUrlOrStorage(searchParams: URLSearchParams): string | null {
  // First check URL params (takes precedence)
  const urlCollectionId = searchParams.get('collectionId')
  if (urlCollectionId) {
    // Sync to localStorage
    setSelectedCollectionId(urlCollectionId)
    return urlCollectionId
  }
  
  // Fall back to localStorage
  return getSelectedCollectionId()
}

/**
 * Build a URL with collectionId query parameter, preserving existing params
 */
export function buildUrlWithCollectionId(basePath: string, collectionId: string | null | undefined, existingParams?: URLSearchParams): string {
  const params = existingParams ? new URLSearchParams(existingParams) : new URLSearchParams()
  
  if (collectionId) {
    params.set('collectionId', collectionId)
  }
  
  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

