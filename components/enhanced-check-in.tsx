"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Star, Clock, Gift, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EnhancedCheckInService, type UserStreak } from "@/lib/enhanced-checkin-service"
import { SupabaseAuthService, type AuthUser } from "@/lib/supabase-auth-service"
import { SuggestionsModal } from "./suggestions-modal"

const MOOD_EMOJIS = [
  { emoji: "😢", label: "Struggling", value: 1 },
  { emoji: "😕", label: "Difficult", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "😄", label: "Great", value: 5 },
]

// Preview suggestions for each mood level
const PREVIEW_SUGGESTIONS: Record<number, string[]> = {
  1: [
    "💛 Take 5 deep breaths to center yourself",
    "💛 Be extra gentle with yourself today",
    "💛 Consider reaching out to someone you trust",
  ],
  2: [
    "🧡 Try gentle stretching to release tension",
    "🧡 Name one small thing that went well today",
    "🧡 Listen to a song that lifts your spirits",
  ],
  3: [
    "💚 Take a short walk to shift your energy",
    "💚 Celebrate one small accomplishment today",
    "💚 Drink a glass of water mindfully",
  ],
  4: [
    "💙 Share your positive energy with someone",
    "💙 Take a moment to appreciate your progress",
    "💙 Channel this energy into something creative",
  ],
  5: [
    "💜 Reflect on what's helping you thrive",
    "💜 Pay it forward with a kind gesture",
    "💜 Document what made today great",
  ],
}

type EnhancedCheckInProps = {}

export function EnhancedCheckIn() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [selectedMoodValue, setSelectedMoodValue] = useState<number | null>(null)
  const [reflection, setReflection] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(true)
  const [nextCheckIn, setNextCheckIn] = useState<string>("")
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null)
  const { toast } = useToast()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [lastCheckInResult, setLastCheckInResult] = useState<any>(null)

  useEffect(() => {
    // Get current user and set up auth listener
    const initAuth = async () => {
      const user = await SupabaseAuthService.getCurrentUser()
      setAuthUser(user)
      if (user) {
        loadUserData(user.id)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = SupabaseAuthService.onAuthStateChange((user) => {
      setAuthUser(user)
      if (user) {
        loadUserData(user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId: string) => {
    const checkInService = new EnhancedCheckInService(userId)
    try {
      const [eligibility, streak] = await Promise.all([checkInService.canCheckIn(), checkInService.getUserStreak()])

      setCanCheckIn(eligibility.canCheckIn)
      if (eligibility.nextCheckIn) {
        setNextCheckIn(eligibility.nextCheckIn)
      }
      setUserStreak(streak)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleMoodSelect = (emoji: string, value: number) => {
    setSelectedMood(emoji)
    setSelectedMoodValue(value)

    // Log to verify the mood selection is working
    console.log(`Selected mood: ${emoji}, value: ${value}`)
    console.log(`Preview suggestions:`, PREVIEW_SUGGESTIONS[value])
  }

  const handleCheckIn = async () => {
    if (!authUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to check in",
        variant: "destructive",
      })
      return
    }

    if (!selectedMood) {
      toast({
        title: "Please select your mood",
        description: "How are you feeling today?",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const checkInService = new EnhancedCheckInService(authUser.id)
      const result = await checkInService.checkIn({
        emoji: selectedMood,
        prompt: reflection.trim() || undefined,
        timestamp: new Date().toISOString(),
      })

      if (result.success && result.data) {
        const { streakDays, totalPoints, multiplier, canCheckInAgain, suggestions, emojiRating } = result.data

        // Store result for suggestions modal
        setLastCheckInResult({
          suggestions,
          emojiRating,
          totalPoints,
          streakDays,
        })

        // Show suggestions modal
        setShowSuggestions(true)

        toast({
          title: "Check-in complete! 🎉",
          description: `You earned ${totalPoints} CARE Points! ${streakDays > 1 ? `${streakDays} day streak!` : ""}`,
        })

        // Reset form
        setSelectedMood("")
        setSelectedMoodValue(null)
        setReflection("")
        setCanCheckIn(false)
        setNextCheckIn(canCheckInAgain)

        // Reload user data
        await loadUserData(authUser.id)
      } else {
        toast({
          title: "Check-in failed",
          description: result.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  if (!authUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Please sign in</h3>
          <p className="text-muted-foreground">You need to be signed in to access check-ins</p>
        </CardContent>
      </Card>
    )
  }

  const getMultiplierText = (streak: number) => {
    if (streak >= 14) return "2x multiplier! 🔥"
    if (streak >= 7) return "1.5x multiplier! ⭐"
    if (streak >= 3) return "1.25x multiplier! 🌟"
    return "1x multiplier"
  }

  const getNextMilestone = (streak: number) => {
    if (streak < 3) return { target: 3, reward: "1.25x multiplier" }
    if (streak < 7) return { target: 7, reward: "1.5x multiplier" }
    if (streak < 14) return { target: 14, reward: "2x multiplier" }
    return { target: streak + 7, reward: "Keep the streak!" }
  }

  const formatTimeUntilNext = (nextTime: string) => {
    const now = new Date()
    const next = new Date(nextTime)
    const diff = next.getTime() - now.getTime()

    if (diff <= 0) return "Now"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getMoodSuggestionPreviewColor = (value: number) => {
    switch (value) {
      case 1:
        return "bg-red-50 border-red-200 text-red-700"
      case 2:
        return "bg-orange-50 border-orange-200 text-orange-700"
      case 3:
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case 4:
        return "bg-green-50 border-green-200 text-green-700"
      case 5:
        return "bg-purple-50 border-purple-200 text-purple-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  const getMoodSuggestionTitle = (value: number) => {
    switch (value) {
      case 1:
        return "When struggling, try these:"
      case 2:
        return "During difficult times, consider:"
      case 3:
        return "To improve your day:"
      case 4:
        return "To maintain this good energy:"
      case 5:
        return "To make the most of this great mood:"
      default:
        return "Suggestions for you:"
    }
  }

  return (
    <div className="space-y-6">
      {/* Streak Display */}
      {userStreak && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">Current Streak</span>
              </div>
              <Badge variant="secondary">{userStreak.totalPoints} CARE Points</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{userStreak.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{userStreak.currentMultiplier}x</div>
                <div className="text-sm text-muted-foreground">Multiplier</div>
              </div>
            </div>

            {userStreak.currentStreak > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next milestone</span>
                  <span>{getNextMilestone(userStreak.currentStreak).target} days</span>
                </div>
                <Progress
                  value={(userStreak.currentStreak / getNextMilestone(userStreak.currentStreak).target) * 100}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {getNextMilestone(userStreak.currentStreak).reward}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Check-in Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Daily Check-in
          </CardTitle>
          <CardDescription>Share how you're feeling and earn CARE Points</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canCheckIn ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">You've already checked in!</h3>
              <p className="text-muted-foreground mb-4">
                Come back in {formatTimeUntilNext(nextCheckIn)} for your next check-in
              </p>
              <Badge variant="outline">Next check-in: {new Date(nextCheckIn).toLocaleTimeString()}</Badge>
            </div>
          ) : (
            <>
              {/* Mood Selection */}
              <div className="space-y-3">
                <h3 className="font-medium">How are you feeling today?</h3>
                <div className="grid grid-cols-5 gap-2">
                  {MOOD_EMOJIS.map((mood) => (
                    <button
                      key={mood.emoji}
                      onClick={() => handleMoodSelect(mood.emoji, mood.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedMood === mood.emoji
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`Select mood: ${mood.label}`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
                {selectedMood && (
                  <Badge variant="secondary" className="text-xs">
                    +10 CARE Points for mood check-in!
                    {userStreak && userStreak.currentMultiplier > 1 && ` (${userStreak.currentMultiplier}x multiplier)`}
                  </Badge>
                )}
              </div>

              {/* Suggestion Preview */}
              {selectedMoodValue && (
                <div
                  className={`p-4 rounded-lg border space-y-3 ${getMoodSuggestionPreviewColor(selectedMoodValue)}`}
                  data-testid={`mood-preview-${selectedMoodValue}`}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <h4 className="font-medium text-sm">{getMoodSuggestionTitle(selectedMoodValue)}</h4>
                  </div>
                  <ul className="space-y-2 text-sm pl-5 list-disc">
                    {PREVIEW_SUGGESTIONS[selectedMoodValue].map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reflection Prompt */}
              <div className="space-y-3">
                <h3 className="font-medium">What's one thing you're grateful for today? (Optional)</h3>
                <Textarea
                  placeholder="Share your thoughts, gratitude, or reflection..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[100px]"
                />
                {reflection.trim() && (
                  <Badge variant="secondary" className="text-xs">
                    +5 bonus CARE Points for reflection! 🙏
                  </Badge>
                )}
              </div>

              {/* Points Preview */}
              {selectedMood && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Points Preview</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Mood check-in:</span>
                      <span>+10 points</span>
                    </div>
                    {reflection.trim() && (
                      <div className="flex justify-between">
                        <span>Reflection bonus:</span>
                        <span>+5 points</span>
                      </div>
                    )}
                    {userStreak && userStreak.currentMultiplier > 1 && (
                      <div className="flex justify-between">
                        <span>Streak multiplier:</span>
                        <span>x{userStreak.currentMultiplier}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        +{Math.floor((10 + (reflection.trim() ? 5 : 0)) * (userStreak?.currentMultiplier || 1))} points
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button onClick={handleCheckIn} disabled={!selectedMood || isSubmitting} className="w-full" size="lg">
                {isSubmitting ? "Checking in..." : "Complete Check-in"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Suggestions Modal */}
      {showSuggestions && lastCheckInResult && (
        <SuggestionsModal
          isOpen={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          suggestions={lastCheckInResult.suggestions}
          emojiRating={lastCheckInResult.emojiRating}
          totalPoints={lastCheckInResult.totalPoints}
          streakDays={lastCheckInResult.streakDays}
        />
      )}
    </div>
  )
}
