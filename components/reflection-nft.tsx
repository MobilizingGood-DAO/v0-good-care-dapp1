"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/providers/wallet-provider"
import { ethers } from "ethers"
import { Loader2 } from "lucide-react"

// Simplified ERC1155 ABI for reflection NFTs
const REFLECTION_NFT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function uri(uint256 id) view returns (string)",
]

// Reflection NFT contract address
const REFLECTION_NFT_ADDRESS = "0x5fb4048031364A47c320236312fF66CB42ae822F"

// Mood emojis and descriptions
const MOODS = [
  { value: 1, emoji: "😢", label: "Very Upset", color: "bg-red-100 text-red-800 border-red-200" },
  { value: 2, emoji: "😕", label: "Somewhat Upset", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: 3, emoji: "😐", label: "Neutral", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: 4, emoji: "🙂", label: "Somewhat Happy", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: 5, emoji: "😄", label: "Very Happy", color: "bg-green-100 text-green-800 border-green-200" },
]

interface ReflectionNFT {
  id: number
  balance: number
  emoji: string
  label: string
  color: string
}

export function ReflectionNFTs() {
  const { address, isConnected } = useWallet()
  const [reflections, setReflections] = useState<ReflectionNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      fetchReflections()
    }
  }, [isConnected, address])

  const fetchReflections = async () => {
    if (!isConnected || !address || typeof window === "undefined" || !window.ethereum) return

    setIsLoading(true)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const reflectionContract = new ethers.Contract(REFLECTION_NFT_ADDRESS, REFLECTION_NFT_ABI, provider)

      const userReflections: ReflectionNFT[] = []

      // Check balance for each mood type (1-5)
      for (let i = 1; i <= 5; i++) {
        try {
          const balance = await reflectionContract.balanceOf(address, i)

          if (Number(balance) > 0) {
            userReflections.push({
              id: i,
              balance: Number(balance),
              emoji: MOODS[i - 1].emoji,
              label: MOODS[i - 1].label,
              color: MOODS[i - 1].color,
            })
          }
        } catch (error) {
          console.error(`Error fetching balance for mood ${i}:`, error)
        }
      }

      setReflections(userReflections)
    } catch (error) {
      console.error("Error fetching reflections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Reflection NFTs</CardTitle>
          <CardDescription>NFTs minted from your daily check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading your reflections...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (reflections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Reflection NFTs</CardTitle>
          <CardDescription>NFTs minted from your daily check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>You haven't minted any reflection NFTs yet.</p>
            <p className="mt-2">Check in daily and mint reflections to see them here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Reflection NFTs</CardTitle>
        <CardDescription>NFTs minted from your daily check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {reflections.map((reflection) => (
            <div
              key={reflection.id}
              className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center ${reflection.color}`}
            >
              <span className="text-4xl mb-2">{reflection.emoji}</span>
              <span className="font-medium text-sm">{reflection.label}</span>
              <span className="text-xs mt-1">x{reflection.balance}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
