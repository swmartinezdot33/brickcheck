'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Set } from '@/types'
import { AddItemModal } from './AddItemModal'

export function SetSearch({ onSelect }: { onSelect?: (set: Set) => void }) {
  const [query, setQuery] = useState('')
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['search-sets', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []
      const res = await fetch(`/api/searchSets?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Failed to search')
      const data = await res.json()
      return data.results as Set[]
    },
    enabled: query.length >= 2,
    staleTime: 30000, // 30 seconds
  })

  const handleSelect = (set: Set) => {
    setSelectedSet(set)
    setModalOpen(true)
    if (onSelect) {
      onSelect(set)
    }
  }

  return (
    <>
      <div className="relative">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search by set number or name..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && <div className="p-4 text-sm text-muted-foreground">Searching...</div>}
            {!isLoading && (!data || data.length === 0) && query.length >= 2 && (
              <CommandEmpty>No sets found.</CommandEmpty>
            )}
            {data && data.length > 0 && (
              <CommandGroup heading="Results">
                {data.map((set) => (
                  <CommandItem
                    key={set.id}
                    value={set.set_number}
                    onSelect={() => handleSelect(set)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{set.name}</div>
                        <div className="text-sm text-muted-foreground">
                          #{set.set_number} • {set.theme || 'Unknown'} • {set.year || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
      {selectedSet && (
        <AddItemModal open={modalOpen} onOpenChange={setModalOpen} set={selectedSet} />
      )}
    </>
  )
}

