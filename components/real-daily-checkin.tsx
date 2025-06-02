"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CheckCircle, Star, Heart, Loader2, Sparkles, Trophy, Target } from "lucide-react"
import { useRealAuth } from "@/providers/real-auth-provider"
import { RealSupabaseService, type UserStats, type CheckIn } from "@/lib/real-supabase-service"

const MOODS = [
  { value: 1, emoji: "😢", label: "Struggling", color: "bg-red-100 text-red-800 border-red-200" },
  { value: 2, emoji: "😕", label: "Low", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: 3, emoji: "😐", label: "Okay", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: 4, emoji: "🙂", label: "Good", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: 5, emoji: "😄", label: "Great", color: "bg-green-100 text-green-800 border-green-200" },
]

const RESOURCES = [
  { id: "breathing", title: "Breathing Exercises", description: "Quick techniques to find calm" },
  { id: "mindfulness", title: "Mindfulness", description: "Stay present and centered" },
  { id: "gratitude", title: "Gratitude Practice", description: "Find moments of appreciation" },
  { id: "movement", title: "Gentle Movement", description: "Light exercises to boost mood" },
  { id: "connection", title: "Social Connection", description: "Reach out to your support network" },
]

export function RealDailyCheckIn() {
  const { user, isAuthenticated } = useRealAuth()
  const { toast } = useToast()

  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([])
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [gratitude, setGratitude] = useState("")
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Load user stats
      const userStats = await RealSupabaseService.getUserStats(user.id)
      setStats(userStats)

      // Load recent check-ins
      const checkIns = await RealSupabaseService.getUserCheckIns(user.id, 7)
      setRecentCheckIns(checkIns)

      // Check if can check in today
      const canCheck = await RealSupabaseService.canCheckInToday(user.id)
      setCanCheckIn(canCheck)
    } catch (error) {
      console.error("Error loading user data:", error)
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!user || selectedMood === null) return

    setIsSubmitting(true)

    try {
      const moodOption = MOODS.find((m) => m.value === selectedMood)
      if (!moodOption) throw new Error("Invalid mood selection")

      const result = await RealSupabaseService.recordCheckIn(
        user.id,
        selectedMood,
        moodOption.label,
        gratitude.trim() || undefined,
        selectedResources,
      )

      if (!result.success) {
        throw new Error(result.error || "Failed to record check-in")
      }

      // Reload data
      await loadUserData()

      toast({
        title: `🎉 Check-in complete! +${result.points} CARE Points`,
        description: `${result.newStreak} day streak! Keep up the amazing work.`,
      })

      // Reset form
      setSelectedMood(null)
      setGratitude("")
      setSelectedResources([])
      setShowForm(false)
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

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-lg font-medium mb-2">Sign in to start your wellness journey</h3>
          <p className="text-muted-foreground">Track your daily mood and earn CARE Points</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your wellness data...</p>
        </CardContent>
      </Card>
    )
  }

  const levelProgress = stats ? ((stats.total_points % 100) / 100) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Wellness Check-in
            </CardTitle>
            <Badge variant="outline" className="bg-white/20 text-white border-none">
              {stats?.current_streak || 0} Day Streak
            </Badge>
          </div>
          <CardDescription className="text-white/80">
            Track your mood and earn CARE Points for your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                <Star className="h-4 w-4" />
                <span className="text-2xl font-bold">{stats?.total_points || 0}</span>
              </div>
              <span className="text-sm text-muted-foreground">CARE Points</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-2xl font-bold">{stats?.level || 1}</span>
              </div>
              <span className="text-sm text-muted-foreground">Level</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-2xl font-bold">{stats?.current_streak || 0}</span>
              </div>
              <span className="text-sm text-muted-foreground">Current Streak</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-2xl font-bold">{stats?.longest_streak || 0}</span>
              </div>
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {stats?.level || 1}</span>
              <span>Level {(stats?.level || 1) + 1}</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">{Math.round(levelProgress)}% to next level</p>
          </div>

          {/* Check-in Interface */}
          {!showForm ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-lg font-medium mb-2">
                {canCheckIn ? "Ready for your daily check-in?" : "You've checked in today!"}
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                {canCheckIn
                  ? "Take a moment to reflect on your wellness"
                  : "Come back tomorrow to continue your journey"}
              </p>
              {canCheckIn && (
                <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Check-in
                </Button>
              )}
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
                      onClick={() => setSelectedMood(mood.value)}
                      className={`
                        p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all hover:scale-105
                        ${selectedMood === mood.value ? mood.color + " border-2 shadow-lg" : "border-gray-200 hover:border-gray-300"}
                      `}
                    >
                      <span className="text-3xl mb-2">{mood.emoji}</span>
                      <span className="text-xs font-medium text-center">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <h4 className="font-medium">Wellness resources you'd like to explore:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {RESOURCES.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => {
                        setSelectedResources((prev) =>
                          prev.includes(resource.id) ? prev.filter((id) => id !== resource.id) : [...prev, resource.id],
                        )
                      }}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        selectedResources.includes(resource.id)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedResources.includes(resource.id) && <span className="text-blue-500">✓</span>}
                        <div>
                          <span className="font-medium text-sm">{resource.title}</span>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gratitude */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-medium">
                  <Heart className="h-4 w-4 text-green-600" />
                  What are you grateful for today? (Optional +3 bonus points)
                </label>
                <Textarea
                  placeholder="Today I'm grateful for..."
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
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Check-in
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
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

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCheckIns.map((checkIn) => {
                const mood = MOODS.find((m) => m.value === checkIn.mood)
                return (
                  <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mood?.emoji}</span>
                      <div>
                        <p className="font-medium">{new Date(checkIn.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{checkIn.mood_label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="h-4 w-4" />
                      <span className="font-medium">+{checkIn.points}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
