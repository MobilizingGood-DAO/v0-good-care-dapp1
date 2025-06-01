"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Star, Trophy, Calendar, Sparkles, BookOpen, Smile, Meh, Frown } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { getUserCarePoints, recordCheckIn, canCheckInToday, type CarePointsData } from "@/lib/care-points-service"

const MOOD_OPTIONS = [
  { value: "amazing", label: "Amazing", icon: Smile, color: "text-green-500", rating: 5 },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-500", rating: 4 },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-500", rating: 3 },
  { value: "struggling", label: "Struggling", icon: Frown, color: "text-orange-500", rating: 2 },
  { value: "difficult", label: "Difficult", icon: Frown, color: "text-red-500", rating: 1 },
]

const MENTAL_HEALTH_RESOURCES = [
  { id: "anxiety", label: "Anxiety Support", description: "Breathing exercises and coping strategies" },
  { id: "depression", label: "Depression Resources", description: "Understanding and managing depression" },
  { id: "stress", label: "Stress Management", description: "Techniques for reducing daily stress" },
  { id: "sleep", label: "Sleep Hygiene", description: "Tips for better sleep quality" },
  { id: "mindfulness", label: "Mindfulness", description: "Meditation and present-moment awareness" },
  { id: "community", label: "Community Support", description: "Connect with others on similar journeys" },
]

export function EnhancedDailyCheckIn() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [carePointsData, setCarePointsData] = useState<CarePointsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Form state
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [gratitudeNote, setGratitudeNote] = useState("")
  const [selectedResources, setSelectedResources] = useState<string[]>([])

  // Load user's CARE Points data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCarePointsData()
    }
  }, [isAuthenticated, user])

  const loadCarePointsData = async () => {
    if (!user) return

    try {
      const data = await getUserCarePoints(user.id)
      setCarePointsData(data)
    } catch (error) {
      console.error("Error loading CARE Points data:", error)
    }
  }

  const handleCheckIn = async () => {
    if (!user || !selectedMood) return

    setIsLoading(true)

    try {
      const moodOption = MOOD_OPTIONS.find((m) => m.value === selectedMood)

      const updatedData = await recordCheckIn(user.id, {
        mood: selectedMood,
        gratitudeNote: gratitudeNote.trim() || undefined,
        resourcesViewed: selectedResources,
        moodRating: moodOption?.rating || 3,
      })

      setCarePointsData(updatedData)
      setShowCheckInForm(false)
      setShowCelebration(true)

      // Reset form
      setSelectedMood("")
      setGratitudeNote("")
      setSelectedResources([])

      toast({
        title: "Check-in Complete! 🎉",
        description: `You earned ${updatedData.checkInHistory[updatedData.checkInHistory.length - 1]?.points || 0} CARE Points!`,
      })

      // Hide celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000)
    } catch (error: any) {
      toast({
        title: "Check-in Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleResource = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId],
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">Sign in to start your daily reflection journey</p>
          <Button className="bg-green-600 hover:bg-green-700">Sign In</Button>
        </CardContent>
      </Card>
    )
  }

  if (!carePointsData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse">Loading your progress...</div>
        </CardContent>
      </Card>
    )
  }

  const canCheckIn = canCheckInToday(carePointsData.lastCheckIn)
  const progressToNextLevel = ((carePointsData.totalPoints % 100) / 100) * 100

  return (
    <div className="space-y-6">
      {/* Main Check-in Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Daily Reflection
            </CardTitle>
            <Badge variant="outline" className="bg-white/20 text-white border-none">
              Level {carePointsData.level}
            </Badge>
          </div>
          <CardDescription className="text-white/80">Take a moment to reflect and earn CARE Points</CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Streak</span>
              </div>
              <div className="text-2xl font-bold">{carePointsData.currentStreak}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Points</span>
              </div>
              <div className="text-2xl font-bold">{carePointsData.totalPoints}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Best</span>
              </div>
              <div className="text-2xl font-bold">{carePointsData.longestStreak}</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {carePointsData.level} Progress</span>
              <span>
                {carePointsData.totalPoints} / {carePointsData.nextLevelPoints}
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          {canCheckIn ? (
            <Button
              onClick={() => setShowCheckInForm(true)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Start Daily Reflection
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-2">You've already reflected today!</p>
              <p className="text-sm text-muted-foreground">Come back tomorrow to continue your journey</p>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Check-in Form Modal */}
      <AnimatePresence>
        {showCheckInForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCheckInForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Daily Reflection</h3>

              {/* Mood Selection */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium">How are you feeling today?</label>
                <div className="grid grid-cols-1 gap-2">
                  {MOOD_OPTIONS.map((mood) => {
                    const Icon = mood.icon
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          selectedMood === mood.value
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${mood.color}`} />
                        <span className="font-medium">{mood.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gratitude Note */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">What are you grateful for today? (Optional)</label>
                <Textarea
                  value={gratitudeNote}
                  onChange={(e) => setGratitudeNote(e.target.value)}
                  placeholder="Share something you're grateful for..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Resource Selection */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  Interested in any resources? (Optional)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {MENTAL_HEALTH_RESOURCES.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => toggleResource(resource.id)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        selectedResources.includes(resource.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium">{resource.label}</div>
                      <div className="text-sm text-muted-foreground">{resource.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCheckInForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  disabled={!selectedMood || isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Saving..." : "Complete Reflection"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">Reflection Complete!</h3>
              <p className="text-muted-foreground">Thank you for taking time to care for yourself</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
