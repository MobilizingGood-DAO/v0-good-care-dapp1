"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Lightbulb, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import { getSuggestionsForMood, getMoodLabel, getMoodColor, type CareSuggestion } from "@/lib/care-suggestions"
import { UserMoodService, type UserMoodData } from "@/lib/user-mood-service"
import { SupabaseAuthService } from "@/lib/supabase-auth-service"

export function MyCareSection() {
  const [moodData, setMoodData] = useState<UserMoodData | null>(null)
  const [suggestions, setSuggestions] = useState<CareSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadMoodData()
  }, [])

  const loadMoodData = async () => {
    setIsLoading(true)
    try {
      const user = await SupabaseAuthService.getCurrentUser()
      if (user) {
        const data = await UserMoodService.getUserMoodData(user.id)
        setMoodData(data)

        const moodSuggestions = getSuggestionsForMood(data.recentMood)
        // Show 4 random suggestions
        const shuffled = [...moodSuggestions].sort(() => 0.5 - Math.random())
        setSuggestions(shuffled.slice(0, 4))
      }
    } catch (error) {
      console.error("Error loading mood data:", error)
    }
    setIsLoading(false)
  }

  const toggleSuggestion = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId)
    } else {
      newSelected.add(suggestionId)
    }
    setSelectedSuggestions(newSelected)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "stable":
        return <Minus className="h-4 w-4 text-blue-500" />
      default:
        return <Heart className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving":
        return "Improving"
      case "declining":
        return "Needs attention"
      case "stable":
        return "Stable"
      default:
        return "Getting started"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your CARE insights...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mood Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            My CARE Overview
          </CardTitle>
          <CardDescription>Your recent wellness insights and personalized suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Mood */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Current Mood</div>
              <div className={`font-semibold ${getMoodColor(moodData?.recentMood || null)}`}>
                {getMoodLabel(moodData?.recentMood || null)}
              </div>
              {moodData?.recentCheckIn && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last check-in: {new Date(moodData.recentCheckIn).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Trend */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">7-Day Trend</div>
              <div className="flex items-center justify-center gap-2">
                {getTrendIcon(moodData?.moodTrend || "unknown")}
                <span className="font-semibold">{getTrendLabel(moodData?.moodTrend || "unknown")}</span>
              </div>
            </div>

            {/* Average */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Weekly Average</div>
              <div className="font-semibold">
                {moodData?.averageMood ? `${moodData.averageMood}/5` : "Getting started"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Suggestions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Today's CARE Suggestions
            </CardTitle>
            <CardDescription>
              Personalized tips based on your recent mood: {getMoodLabel(moodData?.recentMood || null)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadMoodData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedSuggestions.has(suggestion.id)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => toggleSuggestion(suggestion.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{suggestion.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{suggestion.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      {selectedSuggestions.has(suggestion.id) && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          ✓ Noted
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedSuggestions.size > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Great! You've noted {selectedSuggestions.size} suggestion{selectedSuggestions.size > 1 ? "s" : ""} to
                try today. Remember, small steps make a big difference! 💚
              </p>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Suggestions refresh based on your daily check-ins. Keep checking in to get personalized care tips!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
