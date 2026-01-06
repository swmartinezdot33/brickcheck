'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, Link2, X, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ShareCollectionProps {
  collectionId: string
  collectionName: string
  isPublic?: boolean
  shareToken?: string | null
}

export function ShareCollection({
  collectionId,
  collectionName,
  isPublic: initialIsPublic = false,
  shareToken: initialShareToken = null,
}: ShareCollectionProps) {
  const [open, setOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  // Build shareUrl from current props, recalculate when props change
  const shareUrl = initialShareToken 
    ? `https://www.brickcheck.app/share/${initialShareToken}` 
    : null
  const [displayShareUrl, setDisplayShareUrl] = useState<string | null>(shareUrl)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Update display URL when props change
  useEffect(() => {
    const newUrl = initialShareToken 
      ? `https://www.brickcheck.app/share/${initialShareToken}` 
      : null
    setDisplayShareUrl(newUrl)
    setIsPublic(initialIsPublic)
  }, [initialShareToken, initialIsPublic])

  const handleGenerateShareLink = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch(`/api/collections/${collectionId}/share`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await res.json()
      setDisplayShareUrl(data.shareUrl)
      setIsPublic(true)
      setSuccessMessage('Share link generated! Your collection is now publicly viewable.')
      // Invalidate collections query to refresh data
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error('Error generating share link:', error)
      setError('Failed to generate share link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeShare = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch(`/api/collections/${collectionId}/share`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to revoke share link')
      }

      setDisplayShareUrl(null)
      setIsPublic(false)
      setSuccessMessage('Sharing revoked. Your collection is no longer publicly viewable.')
      // Invalidate collections query to refresh data
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    } catch (error) {
      console.error('Error revoking share:', error)
      setError('Failed to revoke sharing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!displayShareUrl) return

    try {
      await navigator.clipboard.writeText(displayShareUrl)
      setCopied(true)
      setSuccessMessage('Link copied to clipboard!')
      setTimeout(() => {
        setCopied(false)
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      setError('Failed to copy link. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Collection</DialogTitle>
          <DialogDescription>
            Generate a public link to share &quot;{collectionName}&quot; with others.
            Sensitive information like purchase prices and notes will be hidden.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              {successMessage}
            </div>
          )}
          {isPublic && displayShareUrl ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="share-url">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={displayShareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    disabled={!displayShareUrl}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Your collection is publicly viewable via this link
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleRevokeShare}
                disabled={loading}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                {loading ? 'Revoking...' : 'Stop Sharing'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <p>
                  Generate a shareable link to let others view your collection.
                  Private information (purchase prices, dates, notes) will not be visible.
                </p>
              </div>
              <Button
                onClick={handleGenerateShareLink}
                disabled={loading}
                className="w-full"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

