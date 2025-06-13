"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Smile, Meh, Frown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const moodOptions = [
  { value: 5, label: "Excellent", icon: Star, color: "text-green-600" },
  { value: 4, label: "Good", icon: Smile, color: "text-blue-600" },
  { value: 3, label: "Okay", icon: Meh, color: "text-yellow-600" },
  { value: 2, label: "Not Great", icon: Frown, color: "text-orange-600" },
  { value: 1, label: "Difficult", icon: Heart, color: "text-red-600" },
]

export function EnhancedDailyCheckIn() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [gratitude, setGratitude] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const points = selectedMood * 10 + (gratitude ? 20 : 0)

      toast({
        title: "Check-in complete! 🎉",
        description: `You earned ${points} CARE Points today!`,
      })

      // Reset form
      setSelectedMood(null)
      setGratitude("")
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Daily Check-in
        </CardTitle>
        <CardDescription>Take a moment to reflect on your day and earn CARE Points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-3">
          <h3 className="font-medium">How are you feeling today?</h3>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => {
              const Icon = mood.icon
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMood === mood.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-1 ${mood.color}`} />
                  <p className="text-xs font-medium">{mood.label}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Gratitude Note */}
        <div className="space-y-3">
          <h3 className="font-medium">What are you grateful for today? (Optional)</h3>
          <Textarea
            placeholder="Share something you're thankful for..."
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="min-h-[100px]"
          />
          {gratitude && (
            <Badge variant="secondary" className="text-xs">
              +20 bonus CARE Points for gratitude! 🙏
            </Badge>
          )}
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={!selectedMood || isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Complete Check-in"}
        </Button>

        {/* Today's Progress */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <Badge variant="outline">
              {selectedMood ? `${selectedMood * 10 + (gratitude ? 20 : 0)} points ready` : "0 points"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
