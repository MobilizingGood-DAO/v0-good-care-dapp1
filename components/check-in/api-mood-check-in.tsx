"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, CheckCircle, Star, Heart, Loader2, ExternalLink, Zap, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/providers/wallet-provider"
import { useContract, useAddress, useOwnedNFTs } from "@thirdweb-dev/react"
import { useToast } from "@/hooks/use-toast"
import { mintReflectionViaAPI, REFLECTION_NFT_CONTRACT } from "@/lib/reflection-minting"

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

export function APIMoodCheckIn() {
  const { address: walletAddress, isConnected } = useWallet()
  const thirdwebAddress = useAddress()
  const { toast } = useToast()

  // Thirdweb hooks for displaying NFTs
  const { contract } = useContract(REFLECTION_NFT_CONTRACT, "nft-drop")
  const { data: ownedNFTs, isLoading: isLoadingOwnedNFTs } = useOwnedNFTs(contract, thirdwebAddress)

  // Component state
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [reflection, setReflection] = useState("")
  const [checkInData, setCheckInData] = useState({
    lastCheckIn: null as string | null,
    streak: 0,
    totalCheckIns: 0,
    entries: [] as CheckInEntry[],
  })
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Load check-in data from localStorage
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadCheckInData()
    }
  }, [isConnected, walletAddress])

  // Load check-in data from all possible storage keys
  const loadCheckInData = () => {
    if (!walletAddress) return

    // Try different storage keys to ensure backward compatibility
    const possibleKeys = [
      `checkIn_${walletAddress}`,
      `checkIn_${walletAddress.toLowerCase()}`,
      `checkIn_${walletAddress.toUpperCase()}`,
    ]

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

    console.log("No check-in data found for address:", walletAddress)
  }

  // Check if user can check in today
  const canCheckInToday = () => {
    if (!checkInData.lastCheckIn) return true
    return checkInData.lastCheckIn !== getTodayString()
  }

  // Handle mood selection
  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood)
    console.log("Mood selected:", mood)
  }

  // Handle check-in with API-based NFT minting
  const handleCheckIn = async () => {
    console.log("🚀 Check-in button clicked!")
    console.log("Wallet connected:", isConnected)
    console.log("Wallet address:", walletAddress)
    console.log("Selected mood:", selectedMood)
    console.log("Can check in today:", canCheckInToday())

    setDebugInfo(`Starting check-in process...
Wallet: ${walletAddress}
Mood: ${selectedMood}
Connected: ${isConnected}`)

    if (!isConnected || !walletAddress) {
      const errorMsg = "Wallet not connected"
      console.error("❌", errorMsg)
      setDebugInfo((prev) => prev + `\n❌ ${errorMsg}`)
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to check in",
        variant: "destructive",
      })
      return
    }

    if (!canCheckInToday()) {
      const errorMsg = "Already checked in today"
      console.error("❌", errorMsg)
      setDebugInfo((prev) => prev + `\n❌ ${errorMsg}`)
      toast({
        title: "Already checked in",
        description: "You've already checked in today. Come back tomorrow!",
        variant: "destructive",
      })
      return
    }

    if (selectedMood === null) {
      const errorMsg = "No mood selected"
      console.error("❌", errorMsg)
      setDebugInfo((prev) => prev + `\n❌ ${errorMsg}`)
      toast({
        title: "No mood selected",
        description: "Please select how you're feeling today",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)

    try {
      const today = getTodayString()
      const newCheckInNumber = checkInData.totalCheckIns + 1
      const newStreak = checkInData.streak + 1

      console.log("📝 Preparing to mint NFT...")
      setDebugInfo((prev) => prev + `\n📝 Preparing to mint NFT...`)

      toast({
        title: "Minting your reflection NFT...",
        description: "This may take a few moments. No gas fees required! ✨",
      })

      // Mint the NFT using the API
      console.log("🔗 Calling API with:", { selectedMood, reflection: reflection.trim(), newStreak, walletAddress })
      setDebugInfo((prev) => prev + `\n🔗 Calling API...`)

      const result = await mintReflectionViaAPI(selectedMood, reflection.trim() || undefined, newStreak, walletAddress)

      console.log("📦 API Response:", result)
      setDebugInfo((prev) => prev + `\n📦 API Response: ${JSON.stringify(result, null, 2)}`)

      if (!result.success) {
        throw new Error(result.error || "Minting failed")
      }

      // Create new entry with real NFT data
      const newEntry: CheckInEntry = {
        date: today,
        mood: selectedMood,
        reflection: reflection.trim() || undefined,
        timestamp: Date.now(),
        nftTokenId: result.tokenId,
        nftTxHash: result.txHash,
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
      localStorage.setItem(`checkIn_${walletAddress}`, JSON.stringify(newCheckInData))

      console.log("✅ Check-in successful!")
      setDebugInfo((prev) => prev + `\n✅ Check-in successful!`)

      toast({
        title: "Reflection NFT minted successfully! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <span>Your daily reflection has been minted on the GOOD CARE Network!</span>
            {result.txHash && (
              <a
                href={`https://subnets.avax.network/goodcare/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ),
      })

      setSelectedMood(null)
      setReflection("")
      setShowMoodSelector(false)
    } catch (error) {
      console.error("💥 Check-in error:", error)
      setDebugInfo((prev) => prev + `\n💥 Error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Minting failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to mint your reflection right now. Please try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  // Calculate total NFTs owned (for display)
  const totalOwnedNFTs = ownedNFTs?.length || 0

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
        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-gray-800 mb-2">
              <AlertCircle className="h-4 w-4" />
              <h3 className="font-medium">Debug Info</h3>
            </div>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        {/* Connection Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Zap className="h-4 w-4" />
            <h3 className="font-medium">Connection Status</h3>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Wallet Connected: {isConnected ? "✅ Yes" : "❌ No"}</p>
            <p>Wallet Address: {walletAddress || "None"}</p>
            <p>Thirdweb Address: {thirdwebAddress || "None"}</p>
            <p>Can Check In: {canCheckInToday() ? "✅ Yes" : "❌ No"}</p>
          </div>
        </div>

        {/* Free Minting Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <Zap className="h-4 w-4" />
            <h3 className="font-medium">Free NFT Minting!</h3>
          </div>
          <p className="text-sm text-green-700">
            No gas fees required! Our backend handles the minting process for you.
          </p>
        </div>

        {!showMoodSelector ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-center text-muted-foreground mb-4">
              Start your reflection journey by checking in daily and minting care on-chain
            </p>
            <Button
              onClick={() => {
                console.log("🎯 Show mood selector clicked")
                setShowMoodSelector(true)
              }}
              disabled={!canCheckInToday() || !isConnected}
              className="w-full sm:w-auto"
            >
              {canCheckInToday() ? "Check In & Mint Reflection NFT" : "Already Checked In Today"}
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
                placeholder="Today I slowed down and breathed deeply... What are you grateful for? What challenges are you facing? How can you show care to yourself or others?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground text-right">{reflection.length}/500 characters</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleCheckIn} disabled={isMinting || selectedMood === null} className="flex-1">
                {isMinting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Minting NFT...
                  </div>
                ) : (
                  "Submit Check-In & Mint NFT (Free!)"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMoodSelector(false)
                  setSelectedMood(null)
                  setReflection("")
                  setDebugInfo("")
                }}
                className="sm:w-auto"
                disabled={isMinting}
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
              <span className="text-2xl font-bold">{totalOwnedNFTs}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
