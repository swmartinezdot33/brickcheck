'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Set, Collection } from '@/types'
import { useSearchParams } from 'next/navigation'
import { getCollectionIdFromUrlOrStorage } from '@/lib/utils/collection'

interface AddItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  set?: Set
  onSuccess?: () => void
}

export function AddItemModal({ open, onOpenChange, set, onSuccess }: AddItemModalProps) {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  // Get collection ID from URL or localStorage (URL takes precedence)
  const defaultCollectionId = getCollectionIdFromUrlOrStorage(searchParams)

  const [condition, setCondition] = useState<'SEALED' | 'USED'>('SEALED')
  const [conditionGrade, setConditionGrade] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [acquisitionCost, setAcquisitionCost] = useState('')
  const [acquisitionDate, setAcquisitionDate] = useState('')
  const [notes, setNotes] = useState('')
  const [collectionId, setCollectionId] = useState<string>('')
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    if (open) {
      fetchCollections()
    }
  }, [open])

  useEffect(() => {
    if (defaultCollectionId) {
      setCollectionId(defaultCollectionId)
    } else if (collections.length > 0 && !collectionId) {
      setCollectionId(collections[0].id)
    }
  }, [defaultCollectionId, collections, collectionId])

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
        // If we don't have a selection yet (and no URL param), default to first one
        if (!collectionId && !defaultCollectionId && data.length > 0) {
          setCollectionId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch collections', error)
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add item')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] })
      // Reset form
      setCondition('SEALED')
      setConditionGrade('')
      setQuantity(1)
      setAcquisitionCost('')
      setAcquisitionDate('')
      setNotes('')
      // Close modal
      onOpenChange(false)
      // Call optional success callback
      if (onSuccess) {
        onSuccess()
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // We allow set.id to be a temp ID now, the backend will handle it
    if (!set) {
      console.error('Set is missing:', set)
      return
    }

    if (!collectionId) {
      // Should not happen if we have collections, but handle it
      console.error('No collection selected')
      return
    }

    // Pass the ID we have (either UUID or temp-XXXX)
    const setIdToUse = set.id || `temp-${set.set_number}`;

    console.log('Submitting collection item:', {
      set_id: setIdToUse,
      collection_id: collectionId,
      condition,
      quantity,
    })

    mutation.mutate({
      set_id: setIdToUse,
      collection_id: collectionId,
      condition,
      condition_grade: condition === 'USED' && conditionGrade ? conditionGrade : null,
      quantity,
      acquisition_cost_cents: acquisitionCost
        ? Math.round(parseFloat(acquisitionCost) * 100)
        : null,
      acquisition_date: acquisitionDate || null,
      notes: notes || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            {set ? `Add ${set.name} to your collection` : 'Select a set first'}
          </DialogDescription>
        </DialogHeader>
        {set && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as 'SEALED' | 'USED')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEALED">Sealed</SelectItem>
                  <SelectItem value="USED">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {condition === 'USED' && (
              <div className="space-y-2">
                <Label>Condition Grade</Label>
                <Select value={conditionGrade} onValueChange={setConditionGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MINT">Mint</SelectItem>
                    <SelectItem value="COMPLETE">Complete</SelectItem>
                    <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionCost">Acquisition Cost (USD)</Label>
              <Input
                id="acquisitionCost"
                type="number"
                step="0.01"
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionDate">Acquisition Date</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>

            {mutation.error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
                {mutation.error.message}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending || !collectionId}>
                {mutation.isPending ? 'Adding...' : 'Add to Collection'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
