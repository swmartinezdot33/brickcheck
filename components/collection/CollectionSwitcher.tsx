'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Collection {
  id: string
  name: string
  description: string | null
}

export function CollectionSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [showNewDialog, setShowNewDialog] = React.useState(false)
  const [collections, setCollections] = React.useState<Collection[]>([])
  const [loading, setLoading] = React.useState(true)
  const [newCollectionName, setNewCollectionName] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  const selectedCollectionId = searchParams.get('collectionId')
  const selectedCollection = collections.find((c) => c.id === selectedCollectionId) || collections[0]

  React.useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Failed to fetch collections', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (collection: Collection) => {
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('collectionId', collection.id)
    router.push(`?${params.toString()}`)
  }

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName,
        }),
      })

      if (res.ok) {
        const newCollection = await res.json()
        setCollections([...collections, newCollection])
        setNewCollectionName('')
        setShowNewDialog(false)
        handleSelect(newCollection)
      }
    } catch (error) {
      console.error('Failed to create collection', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <Button variant="outline" className="w-[200px] justify-between" disabled>Loading...</Button>
  }

  return (
    <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedCollection?.name || 'Select collection...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search collection..." />
            <CommandList>
              <CommandEmpty>No collection found.</CommandEmpty>
              <CommandGroup heading="Collections">
                {collections.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    onSelect={() => handleSelect(collection)}
                    className="text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCollection?.id === collection.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {collection.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewDialog(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Collection
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Add a new collection to organize your LEGO sets.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              placeholder="e.g., Investment, Personal, Wishlist"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !newCollectionName.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




