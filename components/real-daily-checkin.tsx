"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRealAuth } from "@/providers/real-auth-provider"
import { RealSupabaseService } from "@/lib/real-supabase-service"
import { Loader2, Heart, Flame, Star } from "lucide-react"

const moodOptions = [
  { value: 1, label: "Struggling", emoji: "😔", color: "bg-red-100 text-red-800" },
  { value: 2, label: "Low", emoji: "😕", color: "bg-orange-100 text-orange-800" },
  { value: 3, label: "Okay", emoji: "😐", color: "bg-yellow-100 text-yellow-800" },
  { value: 4, label: "Good", emoji: "😊", color: "bg-green-100 text-green-800" },
  { value: 5, label: "Great", emoji: "😄", color: "bg-blue-100 text-blue-800" },
]

export function RealDailyCheckIn() {
  const { user } = useRealAuth()
  const { toast } = useToast()

  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [gratitudeNote, setGratitudeNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    if (user) {
      checkCanCheckIn()
      loadUserStats()
    }
  }, [user])

  const checkCanCheckIn = async () => {
    if (!user) return

    try {
      const canCheck = await RealSupabaseService.canCheckInToday(user.id)
      setCanCheckIn(canCheck)
    } catch (error) {
      console.error("Error checking check-in status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserStats = async () => {
    if (!user) return

    try {
      const stats = await RealSupabaseService.getUserStats(user.id)
      setUserStats(stats)
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedMood) return

    setIsSubmitting(true)

    try {
      const selectedMoodData = moodOptions.find((m) => m.value === selectedMood)
      const result = await RealSupabaseService.recordCheckIn(
        user.id,
        selectedMood,
        selectedMoodData?.label || "Unknown",
        gratitudeNote || undefined,
        [],
      )

      if (result.success) {
        toast({
          title: "Check-in recorded! 🎉",
          description: `You earned ${result.points} CARE Points! Current streak: ${result.newStreak} days`,
        })

        // Reset form
        setSelectedMood(null)
        setGratitudeNote("")
        setCanCheckIn(false)

        // Reload stats
        await loadUserStats()
      } else {
        toast({
          title: "Check-in failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading check-in...</span>
        </CardContent>
      </Card>
    )
  }

  if (!canCheckIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">✅ Daily Check-in Complete</CardTitle>
          <CardDescription>You've already checked in today! Come back tomorrow for your next check-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Total Points</p>
                <p className="text-2xl font-bold text-green-600">{userStats?.total_points || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg">
              <Flame className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{userStats?.current_streak || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Level</p>
                <p className="text-2xl font-bold text-blue-600">{userStats?.level || 1}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🌱 Daily Wellness Check-in</CardTitle>
        <CardDescription>Take a moment to reflect on your day and track your wellness journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">How are you feeling today?</label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedMood === mood.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-medium">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Gratitude Note */}
        <div className="space-y-3">
          <label className="text-sm font-medium">What are you grateful for today? (Optional)</label>
          <Textarea
            placeholder="Share something you're grateful for..."
            value={gratitudeNote}
            onChange={(e) => setGratitudeNote(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Points Preview */}
        {selectedMood && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Points Preview:</h4>
            <div className="space-y-1 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Base check-in points:</span>
                <span>+10</span>
              </div>
              <div className="flex justify-between">
                <span>Streak bonus:</span>
                <span>+{Math.min(((userStats?.current_streak || 0) + 1) * 2, 20)}</span>
              </div>
              {selectedMood >= 4 && (
                <div className="flex justify-between">
                  <span>Positive mood bonus:</span>
                  <span>+5</span>
                </div>
              )}
              {gratitudeNote && (
                <div className="flex justify-between">
                  <span>Gratitude bonus:</span>
                  <span>+3</span>
                </div>
              )}
              <div className="border-t pt-1 flex justify-between font-medium">
                <span>Total:</span>
                <span>
                  +
                  {10 +
                    Math.min(((userStats?.current_streak || 0) + 1) * 2, 20) +
                    (selectedMood >= 4 ? 5 : 0) +
                    (gratitudeNote ? 3 : 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={!selectedMood || isSubmitting} className="w-full" size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording check-in...
            </>
          ) : (
            "Complete Check-in"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
