"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, CheckCircle, Star, Heart, Loader2, Sparkles, Trophy, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/providers/wallet-provider"
import { useToast } from "@/hooks/use-toast"
import { CarePointsService, getLevelProgress } from "@/lib/care-points-service"

// Mood options with enhanced descriptions
const MOODS = [
  {
    value: 1,
    emoji: "😢",
    label: "Struggling",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Having a tough time",
  },
  {
    value: 2,
    emoji: "😕",
    label: "Low",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Feeling down",
  },
  {
    value: 3,
    emoji: "😐",
    label: "Okay",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Getting by",
  },
  {
    value: 4,
    emoji: "🙂",
    label: "Good",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Feeling positive",
  },
  {
    value: 5,
    emoji: "😄",
    label: "Great",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Thriving today",
  },
]

// Mental health resources based on mood
const MOOD_RESOURCES = {
  1: [
    { title: "Crisis Support", description: "24/7 helplines and immediate support", urgent: true },
    { title: "Breathing Exercises", description: "Quick techniques to find calm" },
    { title: "Grounding Techniques", description: "5-4-3-2-1 method and more" },
  ],
  2: [
    { title: "Self-Compassion Guide", description: "Be kind to yourself today" },
    { title: "Gentle Movement", description: "Light exercises to boost mood" },
    { title: "Journaling Prompts", description: "Process your feelings safely" },
  ],
  3: [
    { title: "Mindfulness Practices", description: "Stay present and centered" },
    { title: "Gratitude Exercises", description: "Find small moments of joy" },
    { title: "Connection Ideas", description: "Reach out to your support network" },
  ],
  4: [
    { title: "Maintain Momentum", description: "Keep your positive energy flowing" },
    { title: "Help Others", description: "Share your good vibes" },
    { title: "Creative Expression", description: "Channel your energy into art" },
  ],
  5: [
    { title: "Celebrate Yourself", description: "Acknowledge your growth" },
    { title: "Spread Joy", description: "Be a light for others" },
    { title: "Plan Ahead", description: "Set intentions for tomorrow" },
  ],
}

export function EnhancedDailyCheckIn() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()

  // Component state
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [gratitude, setGratitude] = useState("")
  const [carePointsService, setCarePointsService] = useState<CarePointsService | null>(null)
  const [carePointsData, setCarePointsData] = useState({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    lastCheckIn: null as string | null,
    checkInHistory: [],
  })
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Initialize CARE Points service
  useEffect(() => {
    if (isConnected && address) {
      const service = new CarePointsService(address)
      setCarePointsService(service)
      setCarePointsData(service.loadData())
    }
  }, [isConnected, address])

  // Check if user can check in today
  const canCheckInToday = () => {
    return carePointsService?.canCheckInToday() ?? false
  }

  // Handle mood selection
  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood)
  }

  // Handle check-in submission
  const handleCheckIn = async () => {
    if (!isConnected || !address || !carePointsService) {
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
        title: "Please select your mood",
        description: "How are you feeling today?",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Record check-in locally
      const result = carePointsService.recordCheckIn(selectedMood, gratitude.trim() || undefined)

      if (!result.success) {
        throw new Error("Failed to record check-in")
      }

      // Update local state
      setCarePointsData(carePointsService.loadData())

      // Show celebration
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)

      toast({
        title: `🎉 Check-in complete! +${result.points} CARE Points`,
        description: `${result.newStreak} day streak! Keep up the amazing work.`,
      })

      // Reset form
      setSelectedMood(null)
      setGratitude("")
      setShowMoodSelector(false)
    } catch (error) {
      console.error("Check-in error:", error)
      toast({
        title: "Check-in failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get level progress
  const levelProgress = getLevelProgress(carePointsData.totalPoints)

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Amazing!</h2>
            <p className="text-gray-600">Your daily reflection has been recorded</p>
          </div>
        </div>
      )}

      {/* Main Check-in Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Reflection
            </CardTitle>
            <Badge variant="outline" className="bg-white/20 text-white border-none">
              {carePointsData.currentStreak} Day Streak
            </Badge>
          </div>
          <CardDescription className="text-white/80">
            Take a moment to reflect and earn CARE Points for your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                <Star className="h-4 w-4" />
                <span className="text-2xl font-bold">{carePointsData.totalPoints}</span>
              </div>
              <span className="text-sm text-muted-foreground">CARE Points</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-2xl font-bold">{carePointsData.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">Level</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-2xl font-bold">{carePointsData.currentStreak}</span>
              </div>
              <span className="text-sm text-muted-foreground">Current Streak</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-2xl font-bold">{carePointsData.longestStreak}</span>
              </div>
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {levelProgress.current}</span>
              <span>Level {levelProgress.next}</span>
            </div>
            <Progress value={levelProgress.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(levelProgress.progress)}% to next level
            </p>
          </div>

          {/* Check-in Interface */}
          {!showMoodSelector ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-medium mb-2">Ready for your daily reflection?</h3>
              <p className="text-center text-muted-foreground mb-6">
                Take a moment to check in with yourself and earn CARE Points
              </p>
              <Button
                onClick={() => setShowMoodSelector(true)}
                disabled={!canCheckInToday() || !isConnected}
                className="w-full sm:w-auto"
                size="lg"
              >
                {canCheckInToday() ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Start Daily Check-in
                  </div>
                ) : (
                  "Already checked in today"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mood Selection */}
              <div className="space-y-4">
                <h3 className="font-medium text-center">How are you feeling today?</h3>
                <div className="grid grid-cols-5 gap-3">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => handleMoodSelect(mood.value)}
                      className={`
                        p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all hover:scale-105
                        ${selectedMood === mood.value ? mood.color + " border-2 shadow-lg" : "border-gray-200 hover:border-gray-300"}
                      `}
                    >
                      <span className="text-3xl mb-2">{mood.emoji}</span>
                      <span className="text-xs font-medium text-center">{mood.label}</span>
                      <span className="text-xs text-center text-muted-foreground">{mood.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources based on mood */}
              {selectedMood && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Recommended for you today:</h4>
                  <div className="space-y-2">
                    {MOOD_RESOURCES[selectedMood as keyof typeof MOOD_RESOURCES].map((resource, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded ${resource.urgent ? "bg-red-100 border border-red-200" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-2">
                          {resource.urgent && <span className="text-red-500">🚨</span>}
                          <div>
                            <span className="font-medium text-sm">{resource.title}</span>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gratitude Section */}
              <div className="space-y-3">
                <Label htmlFor="gratitude" className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  What are you grateful for today? (Optional)
                </Label>
                <Textarea
                  id="gratitude"
                  placeholder="Today I'm grateful for... (This helps boost your mood and earns bonus points!)"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={300}
                />
                <div className="text-xs text-muted-foreground text-right">{gratitude.length}/300 characters</div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleCheckIn}
                  disabled={isSubmitting || selectedMood === null}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Recording...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Complete Check-in (+
                      {selectedMood
                        ? 10 + Math.min(carePointsData.currentStreak * 2, 20) + (selectedMood >= 4 ? 5 : 0)
                        : 10}{" "}
                      points)
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMoodSelector(false)
                    setSelectedMood(null)
                    setGratitude("")
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
