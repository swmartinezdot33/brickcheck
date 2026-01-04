'use client'

import { Set } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SetImage } from '@/components/ui/SetImage'
import { Zap } from 'lucide-react'

interface SetCardProps {
  set: Set
  onClick?: () => void
  className?: string
}

export function SetCard({ set, onClick, className = '' }: SetCardProps) {
  const isCompleteSet = set.is_complete_set
  const setType = set.set_type || 'STANDARD'

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition-shadow h-full ${className}`}
    >
      <CardContent className="p-4 h-full flex flex-col">
        <div className="mb-4 rounded-lg overflow-hidden bg-muted aspect-square">
          <SetImage
            src={set.image_url}
            alt={set.name}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {isCompleteSet && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Complete Set
            </Badge>
          )}

          {setType === 'MINIFIGURE_SERIES' && (
            <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-200 text-blue-900">
              Series
            </Badge>
          )}

          {setType === 'COLLECTIBLE' && (
            <Badge variant="secondary" className="bg-amber-100 hover:bg-amber-200 text-amber-900">
              Collectible
            </Badge>
          )}

          {set.retired && (
            <Badge variant="secondary" className="bg-orange-100 hover:bg-orange-200 text-orange-900">
              Retired
            </Badge>
          )}
        </div>

        {isCompleteSet && set.minifigure_count && (
          <div className="mb-2 text-xs text-muted-foreground font-medium">
            {set.minifigure_count} minifigures included
          </div>
        )}

        <h3 className="font-semibold text-sm mb-1 line-clamp-2 flex-grow">{set.name}</h3>

        <div className="text-xs text-muted-foreground space-y-1 mt-auto">
          <div>Set #{set.set_number}</div>
          {set.theme && <div>{set.theme}</div>}
          {set.year && <div>{set.year}</div>}
          {set.piece_count && set.piece_count > 0 && (
            <div>{Number(set.piece_count).toLocaleString()} pieces</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

