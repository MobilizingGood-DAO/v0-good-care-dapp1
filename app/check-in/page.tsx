"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { calculatePoints, getStreakMultiplier } from "@/utils/suggestions"

export default function CheckIn() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [reflection, setReflection] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data - in a real app, this would come from your backend
  const streakDays = 5 // Example streak
  const multiplier = getStreakMultiplier(streakDays)

  const moods = [
    { emoji: "😢", label: "Sad" },
    { emoji: "😕", label: "Down" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "🙂", label: "Good" },
    { emoji: "😁", label: "Great" },
  ]

  const handleSubmit = async () => {
    if (!selectedMood) return

    setIsSubmitting(true)

    // Calculate points
    const points = calculatePoints(reflection.length > 0, streakDays)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would save this to your backend
    console.log({
      mood: selectedMood,
      reflection,
      timestamp: Date.now(),
      points,
    })

    // Redirect to profile page
    router.push("/profile")
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Daily Check-In</h1>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
          <CardDescription>Your check-in helps personalize your CARE experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Current streak: {streakDays} days</div>
            <div className="text-sm font-medium">Multiplier: {multiplier}x</div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood) => (
              <button
                key={mood.emoji}
                onClick={() => setSelectedMood(mood.emoji)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                  selectedMood === mood.emoji ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl mb-2">{mood.emoji}</span>
                <span className="text-sm">{mood.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Share a reflection (optional)</label>
            <Textarea
              placeholder="What's on your mind today? How are you taking care of yourself?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">Adding a reflection earns you +5 CARE points</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Points you'll earn:</span>
              <span className="text-xl font-bold">{calculatePoints(reflection.length > 0, streakDays)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Base: 10 + Reflection: {reflection.length > 0 ? "5" : "0"} × Multiplier: {multiplier}x
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={!selectedMood || isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Check-In"}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        You can check in once every 8 hours. Your next check-in will be available after submission.
      </div>
    </div>
  )
}
