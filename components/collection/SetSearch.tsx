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
    console.log('Set selected:', set)
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
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
            )}
            {!isLoading && query.length >= 2 && (!data || data.length === 0) && (
              <CommandEmpty>
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No sets found.</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try: 75192, Millennium, Titanic, or Disney
                  </p>
                </div>
              </CommandEmpty>
            )}
            {!isLoading && query.length < 2 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Type at least 2 characters to search...
              </div>
            )}
            {data && data.length > 0 && (
              <CommandGroup heading={`${data.length} result${data.length > 1 ? 's' : ''} found`}>
                {data.map((set) => (
                  <CommandItem
                    key={set.id || set.set_number}
                    value={`${set.set_number}-${set.name}`}
                    onSelect={() => {
                      console.log('CommandItem selected:', set)
                      handleSelect(set)
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full py-1">
                      <div className="flex-1">
                        <div className="font-medium">{set.name}</div>
                        <div className="text-sm text-muted-foreground">
                          #{set.set_number} • {set.theme || 'Unknown'} • {set.year || 'Unknown'}
                          {set.retired && (
                            <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 rounded">
                              Retired
                            </span>
                          )}
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
        <AddItemModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open)
            if (!open) {
              setSelectedSet(null)
              setQuery('') // Clear search after adding
            }
          }}
          set={selectedSet}
        />
      )}
    </>
  )
}

