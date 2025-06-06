"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SimpleNFTGallery() {
  const [isLoading, setIsLoading] = useState(true)
  const [nfts, setNfts] = useState<any[]>([])

  useEffect(() => {
    // Simulate loading NFTs from local storage
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Generate mock NFT data
      const mockNfts = [
        {
          id: "1",
          title: "Daily Reflection - 2024-05-01",
          description: "Feeling grateful today",
          image: "/placeholder.svg?height=300&width=300&text=Reflection",
        },
        {
          id: "2",
          title: "Daily Reflection - 2024-05-02",
          description: "Finding balance",
          image: "/placeholder.svg?height=300&width=300&text=Reflection",
        },
        {
          id: "3",
          title: "Community Badge",
          description: "For helping others",
          image: "/placeholder.svg?height=300&width=300&text=Badge",
        },
      ]

      setNfts(mockNfts)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft) => (
        <Card key={nft.id} className="overflow-hidden">
          <div className="aspect-square relative">
            <img src={nft.image || "/placeholder.svg"} alt={nft.title} className="object-cover w-full h-full" />
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg">{nft.title}</h3>
            <p className="text-muted-foreground text-sm">{nft.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
