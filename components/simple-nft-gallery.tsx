"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/providers/wallet-provider"

interface NFTData {
  tokenId: string
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

export function SimpleNFTGallery() {
  const { address } = useWallet()
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      // Simulate loading NFTs
      // In production, this would fetch from the blockchain or an indexer
      setTimeout(() => {
        const mockNFTs: NFTData[] = [
          {
            tokenId: "1",
            name: "Daily Reflection – 2024-01-15",
            description: "A daily reflection capturing mood and thoughts on the GOOD CARE journey.",
            image: "/placeholder.svg?height=200&width=200&text=😊",
            attributes: [
              { trait_type: "Mood", value: "Very Happy" },
              { trait_type: "Mood Score", value: 5 },
              { trait_type: "Streak", value: 7 },
              { trait_type: "Date", value: "2024-01-15" },
            ],
          },
          {
            tokenId: "2",
            name: "Daily Reflection – 2024-01-14",
            description: "A daily reflection capturing mood and thoughts on the GOOD CARE journey.",
            image: "/placeholder.svg?height=200&width=200&text=🙂",
            attributes: [
              { trait_type: "Mood", value: "Somewhat Happy" },
              { trait_type: "Mood Score", value: 4 },
              { trait_type: "Streak", value: 6 },
              { trait_type: "Date", value: "2024-01-14" },
            ],
          },
        ]
        setNfts(mockNFTs)
        setLoading(false)
      }, 1000)
    }
  }, [address])

  if (!address) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Connect your wallet to view your Reflection NFTs</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading your Reflection NFTs...</p>
        </CardContent>
      </Card>
    )
  }

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No Reflection NFTs found. Start your daily check-in journey to mint your first reflection!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Reflection NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <Card key={nft.tokenId} className="overflow-hidden">
            <CardHeader className="p-0">
              <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-48 object-cover" />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{nft.name}</CardTitle>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{nft.description}</p>
              <div className="flex flex-wrap gap-1">
                {nft.attributes.slice(0, 3).map((attr, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {attr.trait_type}: {attr.value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
