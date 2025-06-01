"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { REFLECTION_NFT_CONTRACT } from "@/lib/reflection-minting"

interface NFTItem {
  id: string
  tokenId: string
  name: string
  description: string
  image: string
}

export function ThirdwebNFTGallery() {
  const { address, isConnected } = useWallet()
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load NFTs from localStorage check-in data
  useEffect(() => {
    if (isConnected && address) {
      setIsLoading(true)
      loadNFTsFromLocalStorage()
    } else {
      setNfts([])
      setIsLoading(false)
    }
  }, [isConnected, address])

  const loadNFTsFromLocalStorage = () => {
    try {
      // Try different storage keys to ensure backward compatibility
      const possibleKeys = [
        `checkIn_${address}`,
        `checkIn_${address?.toLowerCase()}`,
        `checkIn_${address?.toUpperCase()}`,
      ]

      let entries: any[] = []

      for (const key of possibleKeys) {
        const storedData = localStorage.getItem(key)
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (parsedData.entries && Array.isArray(parsedData.entries)) {
              entries = parsedData.entries
              break
            }
          } catch (error) {
            console.error(`Error parsing stored check-in data from ${key}:`, error)
          }
        }
      }

      // Convert entries to NFT items
      const nftItems: NFTItem[] = entries
        .filter((entry) => entry.nftTokenId)
        .map((entry, index) => ({
          id: entry.nftTokenId || `local-${index}`,
          tokenId: entry.nftTokenId || `${index}`,
          name: `Daily Reflection - ${entry.date}`,
          description: entry.reflection || "A daily reflection on the GOOD CARE Network",
          image: "/placeholder.svg?height=300&width=300&text=Reflection",
        }))

      setNfts(nftItems)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading NFTs from localStorage:", error)
      setNfts([])
      setIsLoading(false)
    }
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Your Reflection NFTs
          </CardTitle>
          <CardDescription>Connect your wallet to view your reflection NFT collection</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Your Reflection NFTs
          </CardTitle>
          <CardDescription>Loading your NFT collection...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-1"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              Your Reflection NFTs
            </CardTitle>
            <CardDescription>
              {nfts.length} reflection{nfts.length !== 1 ? "s" : ""} minted on the GOOD CARE Network
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {nfts.length} NFTs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {nfts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-lg font-medium mb-2">No reflection NFTs yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your daily reflection journey to mint your first NFT on the blockchain
            </p>
            <Button variant="outline">Start Daily Check-in</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      #{nft.tokenId}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{nft.description}</p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        window.open(
                          `https://subnets.avax.network/goodcare/token/${REFLECTION_NFT_CONTRACT}/${nft.tokenId}`,
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
