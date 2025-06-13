"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, CheckCircle, Gift, Star, Trophy } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface CheckInData {
  lastCheckIn: string | null
  streak: number
  totalCheckIns: number
  rewards: {
    care: number
    gct: number
    badges: string[]
  }
}

// Helper function to get today's date as YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split("T")[0]

export function DailyCheckIn() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  const [checkInData, setCheckInData] = useState<CheckInData>({
    lastCheckIn: null,
    streak: 0,
    totalCheckIns: 0,
    rewards: {
      care: 0,
      gct: 0,
      badges: [],
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load check-in data from localStorage
  useEffect(() => {
    if (isConnected && address) {
      const storedData = localStorage.getItem(`checkIn_${address}`)
      if (storedData) {
        setCheckInData(JSON.parse(storedData))
      }
    }
  }, [isConnected, address])

  // Save check-in data to localStorage
  const saveCheckInData = (data: CheckInData) => {
    if (isConnected && address) {
      localStorage.setItem(`checkIn_${address}`, JSON.stringify(data))
      setCheckInData(data)
    }
  }

  // Check if user can check in today
  const canCheckInToday = () => {
    if (!checkInData.lastCheckIn) return true
    return checkInData.lastCheckIn !== getTodayString()
  }

  // Calculate rewards based on streak
  const calculateRewards = (streak: number) => {
    // Base rewards
    let careReward = 0.1
    let gctReward = 0.5

    // Bonus for streaks
    if (streak >= 7) {
      careReward += 0.2
      gctReward += 1.0
    }
    if (streak >= 30) {
      careReward += 0.5
      gctReward += 2.5
    }

    return { care: careReward, gct: gctReward }
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

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const today = getTodayString()
      const isConsecutiveDay = checkInData.lastCheckIn === new Date(Date.now() - 86400000).toISOString().split("T")[0]

      const newStreak = isConsecutiveDay ? checkInData.streak + 1 : 1
      const newTotalCheckIns = checkInData.totalCheckIns + 1

      // Calculate rewards
      const rewards = calculateRewards(newStreak)

      // Check for badge rewards
      const newBadges = [...checkInData.rewards.badges]

      if (newStreak === 7 && !newBadges.includes("week-streak")) {
        newBadges.push("week-streak")
      }
      if (newStreak === 30 && !newBadges.includes("month-streak")) {
        newBadges.push("month-streak")
      }
      if (newTotalCheckIns === 50 && !newBadges.includes("fifty-checkins")) {
        newBadges.push("fifty-checkins")
      }
      if (newTotalCheckIns === 100 && !newBadges.includes("century-checkins")) {
        newBadges.push("century-checkins")
      }

      // Update check-in data
      const newCheckInData: CheckInData = {
        lastCheckIn: today,
        streak: newStreak,
        totalCheckIns: newTotalCheckIns,
        rewards: {
          care: checkInData.rewards.care + rewards.care,
          gct: checkInData.rewards.gct + rewards.gct,
          badges: newBadges,
        },
      }

      saveCheckInData(newCheckInData)

      // Show success message
      toast({
        title: "Check-in successful!",
        description: `You earned ${rewards.care} CARE and ${rewards.gct} GCT tokens.`,
        variant: "default",
      })

      // Show confetti animation
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
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

  // Get next streak milestone
  const getNextMilestone = () => {
    const streak = checkInData.streak
    if (streak < 7) return { target: 7, progress: streak / 7 }
    if (streak < 30) return { target: 30, progress: streak / 30 }
    if (streak < 100) return { target: 100, progress: streak / 100 }
    return { target: streak + 100, progress: 1 }
  }

  const nextMilestone = getNextMilestone()

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Check-In
          </CardTitle>
          <Badge variant="outline" className="bg-white/20 text-white border-none">
            {checkInData.streak} Day Streak
          </Badge>
        </div>
        <CardDescription className="text-white/80">
          Check in daily to earn CARE and GCT tokens and build your streak!
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{checkInData.streak} days</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Total Check-ins</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{checkInData.totalCheckIns}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Badges Earned</span>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{checkInData.rewards.badges.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Next milestone: {nextMilestone.target} day streak</span>
            <span>
              {checkInData.streak} / {nextMilestone.target}
            </span>
          </div>
          <Progress value={nextMilestone.progress * 100} className="h-2" />
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-green-500" />
            Today's Rewards
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="text-sm text-muted-foreground">CARE Token</div>
              <div className="text-xl font-bold">{calculateRewards(checkInData.streak).care}</div>
            </div>
            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="text-sm text-muted-foreground">GCT Token</div>
              <div className="text-xl font-bold">{calculateRewards(checkInData.streak).gct}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pb-6">
        <Button
          onClick={handleCheckIn}
          disabled={isLoading || !canCheckInToday() || !isConnected}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isLoading ? "Processing..." : canCheckInToday() ? "Check In Now" : "Already Checked In Today"}
        </Button>
      </CardFooter>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#1A535C", "#FF9F1C"][Math.floor(Math.random() * 5)],
                top: `${Math.random() * 20}%`,
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: `${Math.random() * 100 + 100}vh`,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1.5, 1, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
