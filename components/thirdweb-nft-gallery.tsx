"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart } from "lucide-react"
import { useContract, useAddress, useOwnedNFTs } from "@thirdweb-dev/react"
import { REFLECTION_NFT_CONTRACT } from "@/lib/reflection-minting"

export function ThirdwebNFTGallery() {
  const address = useAddress()
  const { contract } = useContract(REFLECTION_NFT_CONTRACT, "nft-drop")
  const { data: ownedNFTs, isLoading: isLoadingNFTs } = useOwnedNFTs(contract, address)

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

  if (isLoadingNFTs) {
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
              {ownedNFTs?.length || 0} reflection{(ownedNFTs?.length || 0) !== 1 ? "s" : ""} minted on the GOOD CARE
              Network
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {ownedNFTs?.length || 0} NFTs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!ownedNFTs || ownedNFTs.length === 0 ? (
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
            {ownedNFTs.map((nft) => (
              <Card key={nft.metadata.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={nft.metadata.image || `/placeholder.svg?height=300&width=300&text=NFT`}
                    alt={nft.metadata.name || "Reflection NFT"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      #{nft.metadata.id}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{nft.metadata.name || "Reflection NFT"}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {nft.metadata.description || "A daily reflection NFT"}
                  </p>

                  {/* Display attributes if available */}
                  {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {nft.metadata.attributes.slice(0, 3).map((attr: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{attr.trait_type}:</span>
                          <span className="font-medium">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        window.open(
                          `https://subnets.avax.network/goodcare/token/${REFLECTION_NFT_CONTRACT}/${nft.metadata.id}`,
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
