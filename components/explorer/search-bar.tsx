"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { useSearch } from "@/hooks/use-explorer"

export function SearchBar() {
  const router = useRouter()
  const { query, setQuery, performSearch, isLoading, resultType } = useSearch()
  const [searchInput, setSearchInput] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchInput)
    await performSearch(searchInput)

    // Redirect based on search result type
    if (resultType === "block") {
      router.push(`/explorer/block/${searchInput}`)
    } else if (resultType === "transaction") {
      router.push(`/explorer/tx/${searchInput}`)
    } else if (resultType === "account") {
      router.push(`/explorer/address/${searchInput}`)
    } else if (resultType === "not_found") {
      // Stay on the same page, show error in UI
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-3xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by Address / Tx Hash / Block"
          className="pl-8"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <Button type="submit" className="ml-2 bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Search
      </Button>
    </form>
  )
}
