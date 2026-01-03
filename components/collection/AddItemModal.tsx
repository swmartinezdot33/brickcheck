'use client'

import { useState } from 'react'
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
import { Set } from '@/types'

interface AddItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  set?: Set
}

export function AddItemModal({ open, onOpenChange, set }: AddItemModalProps) {
  const queryClient = useQueryClient()
  const [condition, setCondition] = useState<'SEALED' | 'USED'>('SEALED')
  const [conditionGrade, setConditionGrade] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [acquisitionCost, setAcquisitionCost] = useState('')
  const [acquisitionDate, setAcquisitionDate] = useState('')
  const [notes, setNotes] = useState('')

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
      onOpenChange(false)
      // Reset form
      setCondition('SEALED')
      setConditionGrade('')
      setQuantity(1)
      setAcquisitionCost('')
      setAcquisitionDate('')
      setNotes('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!set) return

    mutation.mutate({
      set_id: set.id,
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Adding...' : 'Add to Collection'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

