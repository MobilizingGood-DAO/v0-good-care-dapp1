"use client"

import { useEffect, useState } from "react"
import { careSuggestions, type MoodType } from "../utils/suggestions"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, RefreshCw, TrendingUp, CheckCircle } from "lucide-react"
import { SupabaseAuthService } from "@/lib/supabase-auth-service"
import { HydrationSafeDate } from "./hydration-safe-date"

interface MyCareProps {
  userId?: string
}

const MyCare = ({ userId }: MyCareProps) => {
  const [userMood, setUserMood] = useState<MoodType>("feelingGood")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [checkedSuggestions, setCheckedSuggestions] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchMood()
  }, [userId])

  useEffect(() => {
    setMounted(true)
  }, [])

  async function fetchMood() {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user if userId not provided
      let currentUserId = userId
      if (!currentUserId) {
        const user = await SupabaseAuthService.getCurrentUser()
        if (!user) {
          // Fallback to demo mode
          setUserMood("feelingGood")
          setSuggestions(careSuggestions.feelingGood)
          setIsLoading(false)
          return
        }
        currentUserId = user.id
      }

      // Fetch most recent check-in
      const { data, error } = await supabase
        .from("checkins")
        .select("emoji, timestamp")
        .eq("user_id", currentUserId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching mood:", error)
        // Fallback to default suggestions
        setUserMood("feelingGood")
        setSuggestions(careSuggestions.feelingGood)
        setIsLoading(false)
        return
      }

      // Determine mood based on emoji or default to good
      let mood: MoodType = "feelingGood"
      if (data?.emoji) {
        // Map emojis to mood - struggling/difficult = down, others = good
        const downEmojis = ["😢", "😕", "😔"]
        mood = downEmojis.includes(data.emoji) ? "feelingDown" : "feelingGood"
        setLastCheckIn(data.timestamp)
      }

      setUserMood(mood)
      setSuggestions(careSuggestions[mood])
    } catch (error) {
      console.error("Error in fetchMood:", error)
      setError("Unable to load personalized suggestions")
      // Fallback to default
      setUserMood("feelingGood")
      setSuggestions(careSuggestions.feelingGood)
    }
    setIsLoading(false)
  }

  const toggleSuggestion = (index: number) => {
    const newChecked = new Set(checkedSuggestions)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedSuggestions(newChecked)
  }

  const getMoodLabel = () => {
    return userMood === "feelingDown" ? "Taking Care" : "Thriving"
  }

  const getMoodColor = () => {
    return userMood === "feelingDown" ? "text-yellow-600" : "text-blue-600"
  }

  const getMoodEmoji = () => {
    return userMood === "feelingDown" ? "💛" : "💙"
  }

  if (!mounted) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading your CARE suggestions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          My CARE
        </h1>
        <Button variant="outline" size="sm" onClick={fetchMood}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800 text-sm">{error}</p>
            <p className="text-yellow-600 text-xs mt-1">Showing default suggestions</p>
          </CardContent>
        </Card>
      )}

      {/* Mood Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Current Status
          </CardTitle>
          <CardDescription>Based on your recent check-in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-lg font-semibold ${getMoodColor()}`}>{getMoodLabel()}</div>
              {lastCheckIn && (
                <div className="text-sm text-muted-foreground">
                  Last check-in: <HydrationSafeDate date={lastCheckIn} />
                </div>
              )}
            </div>
            <div className="text-2xl">{getMoodEmoji()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Today's CARE Suggestions</CardTitle>
          <CardDescription>
            {userMood === "feelingDown"
              ? "Gentle reminders to support you through tough moments"
              : "Ways to maintain and share your positive energy"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((tip, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  checkedSuggestions.has(index)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => toggleSuggestion(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 flex-1">{tip}</span>
                  {checkedSuggestions.has(index) && <CheckCircle className="h-5 w-5 text-green-600 ml-2" />}
                </div>
              </div>
            ))}
          </div>

          {checkedSuggestions.size > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Great! You've noted {checkedSuggestions.size} suggestion{checkedSuggestions.size > 1 ? "s" : ""} to try
                today. Small steps make a big difference! 💚
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Suggestions update based on your daily check-ins. Keep checking in for personalized care tips!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MyCare
