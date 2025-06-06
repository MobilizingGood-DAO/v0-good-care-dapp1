"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, CheckCircle, Star, Heart, Coins, Loader2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { Badge } from "@/components/ui/badge"
import { mintReflectionNFT, estimateGasCostInCARE } from "@/lib/reflection-minting"
import { ethers } from "ethers"

// Mood emojis and descriptions
const MOODS = [
  { value: 1, emoji: "😢", label: "Very Upset", color: "bg-red-100 text-red-800 border-red-200" },
  { value: 2, emoji: "😕", label: "Somewhat Upset", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: 3, emoji: "😐", label: "Neutral", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: 4, emoji: "🙂", label: "Somewhat Happy", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: 5, emoji: "😄", label: "Very Happy", color: "bg-green-100 text-green-800 border-green-200" },
]

// Helper function to get today's date as YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split("T")[0]

interface CheckInEntry {
  date: string
  mood: number
  reflection?: string
  timestamp: number
  nftTokenId?: string
  nftTxHash?: string
}

export function MoodCheckIn() {
  const { address, isConnected, walletType } = useWallet()
  const { toast } = useToast()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [reflection, setReflection] = useState("")
  const [checkInData, setCheckInData] = useState({
    lastCheckIn: null as string | null,
    streak: 0,
    totalCheckIns: 0,
    entries: [] as CheckInEntry[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [gasCost, setGasCost] = useState<string>("0.001")
  const [isEstimatingGas, setIsEstimatingGas] = useState(false)
  const [needsFunding, setNeedsFunding] = useState(false)
  const [isFunding, setIsFunding] = useState(false)

  // Load check-in data from localStorage
  useEffect(() => {
    if (isConnected && address) {
      loadCheckInData()
      checkWalletBalance()
    }
  }, [isConnected, address])

  // Load check-in data from all possible storage keys
  const loadCheckInData = () => {
    if (!address) return

    // Try different storage keys to ensure backward compatibility
    const possibleKeys = [`checkIn_${address}`, `checkIn_${address.toLowerCase()}`, `checkIn_${address.toUpperCase()}`]

    for (const key of possibleKeys) {
      const storedData = localStorage.getItem(key)
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setCheckInData(parsedData)
          console.log(`Loaded check-in data from ${key}:`, parsedData)
          return
        } catch (error) {
          console.error(`Error parsing stored check-in data from ${key}:`, error)
        }
      }
    }

    console.log("No check-in data found for address:", address)
  }

  // Check if wallet needs funding
  const checkWalletBalance = async () => {
    if (!address || walletType !== "avacloud") return

    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_GOODCARE_RPC)
      const balance = await provider.getBalance(address)

      // If balance is less than 0.01 CARE, wallet needs funding
      if (balance < ethers.parseEther("0.01")) {
        setNeedsFunding(true)
      } else {
        setNeedsFunding(false)
      }
    } catch (error) {
      console.error("Error checking wallet balance:", error)
    }
  }

  // Request funds from faucet
  const requestFunds = async () => {
    if (!address) return

    setIsFunding(true)
    try {
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Wallet funded!",
          description: `Your wallet has been funded with ${data.amount}`,
          variant: "default",
        })
        setNeedsFunding(false)

        // Wait a moment for the transaction to be processed
        setTimeout(() => {
          checkWalletBalance()
        }, 3000)
      } else {
        toast({
          title: "Funding failed",
          description: data.error || "Failed to fund wallet",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error funding wallet:", error)
      toast({
        title: "Funding failed",
        description: "An error occurred while funding your wallet",
        variant: "destructive",
      })
    } finally {
      setIsFunding(false)
    }
  }

  // Estimate gas cost when mood selector is shown
  useEffect(() => {
    if (showMoodSelector && isConnected) {
      estimateGas()
    }
  }, [showMoodSelector, isConnected])

  const estimateGas = async () => {
    setIsEstimatingGas(true)
    try {
      const { gasCostInCARE } = await estimateGasCostInCARE()
      setGasCost(gasCostInCARE)
    } catch (error) {
      console.error("Error estimating gas:", error)
    } finally {
      setIsEstimatingGas(false)
    }
  }

  // Check if user can check in today
  const canCheckInToday = () => {
    if (!checkInData.lastCheckIn) return true
    return checkInData.lastCheckIn !== getTodayString()
  }

  // Handle mood selection
  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood)
  }

  // Handle check-in
  const handleCheckIn = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to check in",
        variant: "destructive",
      })
      return
    }

    if (!canCheckInToday()) {
      toast({
        title: "Already checked in",
        description: "You've already checked in today. Come back tomorrow!",
        variant: "destructive",
      })
      return
    }

    if (selectedMood === null) {
      toast({
        title: "No mood selected",
        description: "Please select how you're feeling today",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const today = getTodayString()
      const newCheckInNumber = checkInData.totalCheckIns + 1
      const newStreak = checkInData.streak + 1

      // Mint NFT first
      toast({
        title: "Minting your reflection NFT...",
        description: "Please confirm the transaction in your wallet",
      })

      const mintResult = await mintReflectionNFT(
        selectedMood,
        reflection.trim() || undefined,
        today,
        newStreak,
        newCheckInNumber,
      )

      if (!mintResult.success) {
        toast({
          title: "NFT minting failed",
          description: mintResult.error || "Failed to mint reflection NFT",
          variant: "destructive",
        })
        return
      }

      // Create new entry with NFT data
      const newEntry: CheckInEntry = {
        date: today,
        mood: selectedMood,
        reflection: reflection.trim() || undefined,
        timestamp: Date.now(),
        nftTokenId: mintResult.tokenId,
        nftTxHash: mintResult.txHash,
      }

      const newEntries = [...checkInData.entries, newEntry]

      const newCheckInData = {
        lastCheckIn: today,
        streak: newStreak,
        totalCheckIns: newCheckInNumber,
        entries: newEntries,
      }

      setCheckInData(newCheckInData)

      // Save to localStorage with the exact address case
      if (address) {
        localStorage.setItem(`checkIn_${address}`, JSON.stringify(newCheckInData))
      }

      toast({
        title: "Check-in recorded & NFT minted! 🎉",
        description: `Your reflection NFT #${mintResult.tokenId} has been minted successfully!`,
        variant: "default",
      })

      setSelectedMood(null)
      setReflection("")
      setShowMoodSelector(false)
    } catch (error) {
      console.error("Check-in error:", error)
      toast({
        title: "Check-in failed",
        description: "There was an error processing your check-in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Reflection
          </CardTitle>
          <Badge variant="outline" className="bg-white/20 text-white border-none">
            {checkInData.streak} Day Streak
          </Badge>
        </div>
        <CardDescription className="text-white/80">
          Check in daily and mint your reflection as an NFT on the GOOD CARE Network
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {needsFunding && walletType === "avacloud" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-yellow-800 mb-2">Your wallet needs CARE tokens</h3>
            <p className="text-sm text-yellow-700 mb-3">
              You need CARE tokens to pay for gas fees when minting reflection NFTs.
            </p>
            <Button
              onClick={requestFunds}
              disabled={isFunding}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isFunding ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Funding...
                </div>
              ) : (
                "Get 0.1 CARE from Faucet"
              )}
            </Button>
          </div>
        )}

        {!showMoodSelector ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl mb-4">😐</div>
            <p className="text-center text-muted-foreground mb-4">
              Start your reflection journey by checking in daily and minting NFTs
            </p>
            <Button
              onClick={() => setShowMoodSelector(true)}
              disabled={!canCheckInToday() || !isConnected || (needsFunding && walletType === "avacloud")}
              className="w-full sm:w-auto"
            >
              {canCheckInToday() ? "Check In & Mint NFT" : "Already Checked In Today"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium text-center">How are you feeling today?</h3>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`
                    p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all
                    ${selectedMood === mood.value ? mood.color + " border-2" : "border-transparent hover:border-gray-200"}
                  `}
                >
                  <span className="text-3xl mb-1">{mood.emoji}</span>
                  <span className="text-xs text-center">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflection" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-green-600" />
                Reflection (Optional)
              </Label>
              <Textarea
                id="reflection"
                placeholder="Share what's on your mind today... What are you grateful for? What challenges are you facing? How can you show care to yourself or others?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">{reflection.length}/500 characters</div>
            </div>

            {/* Gas Cost Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="font-medium">NFT Minting Cost:</span>
                {isEstimatingGas ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Estimating...</span>
                  </div>
                ) : (
                  <span className="text-blue-700">{gasCost} CARE</span>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Each check-in mints a unique reflection NFT with your mood and thoughts
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleCheckIn} disabled={isLoading || selectedMood === null} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Minting NFT...
                  </div>
                ) : (
                  "Submit Check-In & Mint NFT"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoodSelector(false)
                  setSelectedMood(null)
                  setReflection("")
                }}
                className="sm:w-auto"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{checkInData.streak} days</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Reflection NFTs</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{checkInData.totalCheckIns}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
