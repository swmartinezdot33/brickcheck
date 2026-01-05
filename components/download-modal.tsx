'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Apple, Smartphone } from 'lucide-react'

interface DownloadModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function DownloadModal({ open = false, onOpenChange, trigger }: DownloadModalProps) {
  const appStoreUrl = 'https://apps.apple.com/app/brickcheck'
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.brickcheck.app'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <div onClick={() => onOpenChange?.(true)}>
          {trigger}
        </div>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Download BrickCheck</DialogTitle>
          <DialogDescription>
            Choose your platform to download the app
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {/* App Store */}
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">App Store</span>
              <span className="text-xs text-muted-foreground">iOS</span>
            </Button>
          </a>

          {/* Google Play Store */}
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">Google Play</span>
              <span className="text-xs text-muted-foreground">Android</span>
            </Button>
          </a>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
          Track your LEGO collection like stocks on any device
        </div>
      </DialogContent>
    </Dialog>
  )
}


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Apple, Smartphone } from 'lucide-react'

interface DownloadModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function DownloadModal({ open = false, onOpenChange, trigger }: DownloadModalProps) {
  const appStoreUrl = 'https://apps.apple.com/app/brickcheck'
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.brickcheck.app'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <div onClick={() => onOpenChange?.(true)}>
          {trigger}
        </div>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Download BrickCheck</DialogTitle>
          <DialogDescription>
            Choose your platform to download the app
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {/* App Store */}
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">App Store</span>
              <span className="text-xs text-muted-foreground">iOS</span>
            </Button>
          </a>

          {/* Google Play Store */}
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">Google Play</span>
              <span className="text-xs text-muted-foreground">Android</span>
            </Button>
          </a>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
          Track your LEGO collection like stocks on any device
        </div>
      </DialogContent>
    </Dialog>
  )
}


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Apple, Smartphone } from 'lucide-react'

interface DownloadModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function DownloadModal({ open = false, onOpenChange, trigger }: DownloadModalProps) {
  const appStoreUrl = 'https://apps.apple.com/app/brickcheck'
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.brickcheck.app'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <div onClick={() => onOpenChange?.(true)}>
          {trigger}
        </div>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Download BrickCheck</DialogTitle>
          <DialogDescription>
            Choose your platform to download the app
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {/* App Store */}
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">App Store</span>
              <span className="text-xs text-muted-foreground">iOS</span>
            </Button>
          </a>

          {/* Google Play Store */}
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold">Google Play</span>
              <span className="text-xs text-muted-foreground">Android</span>
            </Button>
          </a>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
          Track your LEGO collection like stocks on any device
        </div>
      </DialogContent>
    </Dialog>
  )
}

