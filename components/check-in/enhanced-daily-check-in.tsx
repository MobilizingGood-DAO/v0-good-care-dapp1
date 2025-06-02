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
import { SupabaseCareService, getLevelProgress, type CarePointsData } from "@/lib/supabase-care-service"

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
    { id: "crisis", title: "Crisis Support", description: "24/7 helplines and immediate support", urgent: true },
    { id: "breathing", title: "Breathing Exercises", description: "Quick techniques to find calm" },
    { id: "grounding", title: "Grounding Techniques", description: "5-4-3-2-1 method and more" },
  ],
  2: [
    { id: "self-compassion", title: "Self-Compassion Guide", description: "Be kind to yourself today" },
    { id: "gentle-movement", title: "Gentle Movement", description: "Light exercises to boost mood" },
    { id: "journaling", title: "Journaling Prompts", description: "Process your feelings safely" },
  ],
  3: [
    { id: "mindfulness", title: "Mindfulness Practices", description: "Stay present and centered" },
    { id: "gratitude", title: "Gratitude Exercises", description: "Find small moments of joy" },
    { id: "connection", title: "Connection Ideas", description: "Reach out to your support network" },
  ],
  4: [
    { id: "momentum", title: "Maintain Momentum", description: "Keep your positive energy flowing" },
    { id: "help-others", title: "Help Others", description: "Share your good vibes" },
    { id: "creative", title: "Creative Expression", description: "Channel your energy into art" },
  ],
  5: [
    { id: "celebrate", title: "Celebrate Yourself", description: "Acknowledge your growth" },
    { id: "spread-joy", title: "Spread Joy", description: "Be a light for others" },
    { id: "plan-ahead", title: "Plan Ahead", description: "Set intentions for tomorrow" },
  ],
}

export function EnhancedDailyCheckIn() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()

  // Component state
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [gratitude, setGratitude] = useState("")
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [careService, setCareService] = useState<SupabaseCareService | null>(null)
  const [carePointsData, setCarePointsData] = useState<CarePointsData>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    lastCheckIn: null,
    checkInHistory: [],
    totalCheckIns: 0,
  })
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize service and load data
  useEffect(() => {
    if (isConnected && address) {
      initializeService()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])

  const initializeService = async () => {
    if (!address) return

    try {
      setIsLoading(true)
      const service = new SupabaseCareService(address)

      // Initialize user in database
      await service.initializeUser(address)

      setCareService(service)

      // Load data
      const data = await service.loadData()
      setCarePointsData(data)

      // Check if can check in today
      const canCheck = await service.canCheckInToday()
      setCanCheckIn(canCheck)
    } catch (error) {
      console.error("Error initializing service:", error)
      toast({
        title: "Connection Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle mood selection
  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood)
  }

  // Toggle resource selection
  const toggleResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId],
    )
  }

  // Handle check-in submission
  const handleCheckIn = async () => {
    if (!isConnected || !address || !careService) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to check in",
        variant: "destructive",
      })
      return
    }

    if (!canCheckIn) {
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
      const moodOption = MOODS.find((m) => m.value === selectedMood)
      if (!moodOption) throw new Error("Invalid mood selection")

      // Record check-in in Supabase
      const result = await careService.recordCheckIn(
        selectedMood,
        moodOption.label,
        gratitude.trim() || undefined,
        selectedResources,
      )

      if (!result.success) {
        throw new Error(result.error || "Failed to record check-in")
      }

      // Reload data
      const updatedData = await careService.loadData()
      setCarePointsData(updatedData)
      setCanCheckIn(false)

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
      setSelectedResources([])
      setShowMoodSelector(false)
    } catch (error: any) {
      console.error("Check-in error:", error)
      toast({
        title: "Check-in failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get level progress
  const levelProgress = getLevelProgress(carePointsData.totalPoints)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            <div className="h-12 bg-gray-200 rounded w-40 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to start your daily reflection journey and earn CARE Points
          </p>
          <Button className="bg-green-600 hover:bg-green-700">Connect Wallet</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Amazing!</h2>
            <p className="text-gray-600">Your daily reflection has been saved to the blockchain of care</p>
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
                disabled={!canCheckIn}
                className="w-full sm:w-auto"
                size="lg"
              >
                {canCheckIn ? (
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
                  <h4 className="font-medium text-blue-800 mb-3">Recommended resources for you today:</h4>
                  <div className="space-y-2">
                    {MOOD_RESOURCES[selectedMood as keyof typeof MOOD_RESOURCES].map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => toggleResource(resource.id)}
                        className={`w-full text-left p-2 rounded transition-colors ${
                          selectedResources.includes(resource.id)
                            ? "bg-blue-100 border border-blue-300"
                            : resource.urgent
                              ? "bg-red-100 border border-red-200"
                              : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {resource.urgent && <span className="text-red-500">🚨</span>}
                          {selectedResources.includes(resource.id) && <span className="text-blue-500">✓</span>}
                          <div>
                            <span className="font-medium text-sm">{resource.title}</span>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Click to mark resources you'd like to explore</p>
                </div>
              )}

              {/* Gratitude Section */}
              <div className="space-y-3">
                <Label htmlFor="gratitude" className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  What are you grateful for today? (Optional +3 bonus points)
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
                      Complete Check-in
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMoodSelector(false)
                    setSelectedMood(null)
                    setGratitude("")
                    setSelectedResources([])
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
