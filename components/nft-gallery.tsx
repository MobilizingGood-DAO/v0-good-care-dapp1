"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNFTs } from "@/hooks/use-nfts"
import { Loader2, AlertCircle } from 'lucide-react'
import { useWallet } from "@/providers/wallet-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"

export function NFTGallery({ filter = "all" }: { filter?: string }) {
  const { isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const { nfts, isLoading, error } = useNFTs(filter)
  const [showDebug, setShowDebug] = useState(false)

  // Update the reflections count calculation
  const reflectionsCount = nfts.length // All NFTs are now considered reflections

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Connect your wallet to view your NFTs</p>
        <Button onClick={connectWallet} className="bg-green-600 hover:bg-green-700">
          Connect Wallet
        </Button>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="text-center py-6">
        <p className="mb-4">Switch to the GOOD CARE Network to view your NFTs</p>
        <Button onClick={switchNetwork} className="bg-green-600 hover:bg-green-700">
          Switch Network
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading your NFTs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
        </div>
        {showDebug && (
          <div className="bg-muted p-4 rounded-md text-xs overflow-auto">
            <p>Looking for NFTs in these contracts:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>GOOD Reflections: 0xC28Bd1D69E390beF1547a63Fa705618C41F3B813</li>
              <li>CARE Badges: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d</li>
              <li>Soulbound Achievements: 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258</li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="space-y-4 py-6">
        <div className="text-center">
          <p>NFTs are coming soon!</p>
          <p className="text-sm text-muted-foreground mt-1">
            We're working on integrating NFTs into the GOOD CARE Network
          </p>
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
        </div>
        {showDebug && (
          <div className="bg-muted p-4 rounded-md text-xs overflow-auto">
            <p>Looking for NFTs in these contracts:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>GOOD Reflections: 0xC28Bd1D69E390beF1547a63Fa705618C41F3B813</li>
              <li>CARE Badges: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d</li>
              <li>Soulbound Achievements: 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258</li>
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your NFT Collection</h3>
        <Badge className="bg-green-600">{reflectionsCount} Total NFTs</Badge>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {nfts.map((nft) => (
          <Card key={nft.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={nft.metadata.image || "/placeholder.svg?height=300&width=300"}
                alt={nft.metadata.name}
                className="object-cover w-full h-full"
              />
              <Badge className="absolute top-2 right-2 bg-blue-500">NFT</Badge>
              {!nft.transferable && <Badge className="absolute top-2 left-2 bg-purple-500">Soulbound</Badge>}
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{nft.metadata.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">Token ID: {nft.tokenId}</p>
              <p className="text-sm text-muted-foreground">Received: {nft.date}</p>
              <p className="text-sm text-muted-foreground truncate">
                Contract: {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-4">
        <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
      </div>
      {showDebug && (
        <div className="bg-muted p-4 rounded-md text-xs overflow-auto">
          <p>Looking for NFTs in these contracts:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>GOOD Reflections: 0xC28Bd1D69E390beF1547a63Fa705618C41F3B813</li>
            <li>CARE Badges: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d</li>
            <li>Soulbound Achievements: 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258</li>
          </ul>
        </div>
      )}
    </div>
  )
}
