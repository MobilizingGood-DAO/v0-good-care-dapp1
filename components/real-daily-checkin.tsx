"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRealAuth } from "@/providers/real-auth-provider"
import { RealSupabaseService } from "@/lib/real-supabase-service"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2, CheckCircle } from "lucide-react"

const MOOD_OPTIONS = [
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

  useEffect(() => {
    checkIfCanCheckIn()
  }, [user])

  const checkIfCanCheckIn = async () => {
    if (!user) return

    try {
      const canCheck = await RealSupabaseService.canCheckInToday(user.id)
      setCanCheckIn(canCheck)
    } catch (error) {
      console.error("Error checking if can check in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedMood) return

    setIsSubmitting(true)

    try {
      const moodOption = MOOD_OPTIONS.find((m) => m.value === selectedMood)
      if (!moodOption) return

      const result = await RealSupabaseService.recordCheckIn(
        user.id,
        selectedMood,
        moodOption.label,
        gratitudeNote || undefined,
        [],
      )

      if (result.success) {
        toast({
          title: "Check-in recorded! 🎉",
          description: `You earned ${result.points} CARE Points! Current streak: ${result.newStreak} days`,
        })

        setCanCheckIn(false)
        setSelectedMood(null)
        setGratitudeNote("")
      } else {
        toast({
          title: "Check-in failed",
          description: result.error || "Something went wrong",
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
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!canCheckIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Daily Check-in Complete
          </CardTitle>
          <CardDescription>You've already checked in today! Come back tomorrow for your next check-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-muted-foreground">Great job staying consistent with your wellness journey!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Daily Check-in
        </CardTitle>
        <CardDescription>How are you feeling today? Track your mood and earn CARE Points.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">How are you feeling today?</label>
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMood === mood.value ? "border-primary bg-primary/10" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-xs font-medium">{mood.label}</div>
              </button>
            ))}
          </div>
          {selectedMood && (
            <Badge className={MOOD_OPTIONS.find((m) => m.value === selectedMood)?.color}>
              {MOOD_OPTIONS.find((m) => m.value === selectedMood)?.label}
            </Badge>
          )}
        </div>

        {/* Gratitude Note */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What are you grateful for today? (Optional)</label>
          <Textarea
            placeholder="I'm grateful for..."
            value={gratitudeNote}
            onChange={(e) => setGratitudeNote(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={!selectedMood || isSubmitting} className="w-full">
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
