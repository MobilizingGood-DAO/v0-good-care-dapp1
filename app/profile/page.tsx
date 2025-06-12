"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  careSuggestions,
  type MoodType,
  type CheckIn,
  getMoodType,
  formatTimeAgo,
  canCheckInAgain,
  getStreakMultiplier,
} from "@/utils/suggestions"

export default function MyCare() {
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null)
  const [moodType, setMoodType] = useState<MoodType>("feelingGood")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [notedSuggestions, setNotedSuggestions] = useState<Set<number>>(new Set())
  const [streakDays, setStreakDays] = useState(0)
  const [moodHistory, setMoodHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock function to fetch user data - in a real app, this would come from your backend
  const fetchUserData = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock data
    const mockCheckIn: CheckIn = {
      timestamp: Date.now() - 3600000, // 1 hour ago
      mood: Math.random() > 0.5 ? "😁" : "😕",
      reflection: "Taking time for myself today.",
    }

    const mockStreakDays = Math.floor(Math.random() * 15) // 0-14 days
    const mockMoodHistory = Array(7)
      .fill("")
      .map(() => (Math.random() > 0.5 ? "😁" : Math.random() > 0.5 ? "🙂" : Math.random() > 0.5 ? "😐" : "😕"))

    setLastCheckIn(mockCheckIn)
    setMoodType(getMoodType(mockCheckIn.mood))
    setStreakDays(mockStreakDays)
    setMoodHistory(mockMoodHistory)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (moodType) {
      setSuggestions(careSuggestions[moodType])
      setNotedSuggestions(new Set())
    }
  }, [moodType])

  const handleNoteSuggestion = (index: number) => {
    const newNotedSuggestions = new Set(notedSuggestions)
    if (newNotedSuggestions.has(index)) {
      newNotedSuggestions.delete(index)
    } else {
      newNotedSuggestions.add(index)
    }
    setNotedSuggestions(newNotedSuggestions)
  }

  const getMoodTrend = (): { icon: JSX.Element; text: string } => {
    const positiveCount = moodHistory.filter((mood) => ["😁", "🙂"].includes(mood)).length
    const negativeCount = moodHistory.filter((mood) => ["😕", "😢"].includes(mood)).length

    if (positiveCount > negativeCount + 1) {
      return { icon: <TrendingUp className="h-5 w-5 text-green-500" />, text: "Improving" }
    } else if (negativeCount > positiveCount + 1) {
      return { icon: <TrendingDown className="h-5 w-5 text-red-500" />, text: "Declining" }
    } else {
      return { icon: <Minus className="h-5 w-5 text-blue-500" />, text: "Stable" }
    }
  }

  const moodTrend = getMoodTrend()
  const multiplier = getStreakMultiplier(streakDays)

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My CARE Experience</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserData}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : lastCheckIn ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card
              className={moodType === "feelingDown" ? "border-yellow-300 bg-yellow-50" : "border-blue-300 bg-blue-50"}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Current Mood {lastCheckIn.mood}</CardTitle>
                <CardDescription>Last check-in: {formatTimeAgo(lastCheckIn.timestamp)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Your reflection:</p>
                    <p className="text-gray-600 italic">"{lastCheckIn.reflection || "No reflection provided"}"</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500">Streak</p>
                      <p className="text-xl font-bold">{streakDays} days</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500">Multiplier</p>
                      <p className="text-xl font-bold">{multiplier}x</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Trend</p>
                        <p className="text-sm font-medium">{moodTrend.text}</p>
                      </div>
                      {moodTrend.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {canCheckInAgain(lastCheckIn.timestamp) ? (
                  <Button className="w-full" asChild>
                    <a href="/check-in">Check In Again</a>
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    You can check in again in {Math.ceil(8 - (Date.now() - lastCheckIn.timestamp) / (1000 * 60 * 60))}{" "}
                    hours
                  </p>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7-Day Mood History</CardTitle>
                <CardDescription>Your emotional journey this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end h-32 mt-4">
                  {moodHistory.map((mood, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <span className="text-2xl mb-2">{mood}</span>
                      <div
                        className={`w-8 ${
                          mood === "😁"
                            ? "h-24 bg-green-400"
                            : mood === "🙂"
                              ? "h-18 bg-green-300"
                              : mood === "😐"
                                ? "h-12 bg-yellow-300"
                                : "h-6 bg-red-300"
                        } rounded-t-md`}
                      ></div>
                      <span className="text-xs mt-1">{index === 0 ? "Today" : index === 6 ? "7d ago" : ""}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>CARE Suggestions For You</CardTitle>
              <CardDescription>Based on your recent check-ins, here are some personalized suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      notedSuggestions.has(index) ? "bg-green-50 border-green-200" : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => handleNoteSuggestion(index)}
                  >
                    <div className="flex justify-between">
                      <p>{suggestion}</p>
                      {notedSuggestions.has(index) && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Click on a suggestion to mark it as noted. These are personalized based on your mood patterns.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your CARE Journey</CardTitle>
              <CardDescription>Track your progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total CARE Points</span>
                  <span className="text-xl font-bold">1,250</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="text-sm text-gray-600">
                  You're 350 points away from reaching the next level. Keep checking in daily!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg border text-center">
                    <p className="text-sm text-gray-500">Check-ins</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border text-center">
                    <p className="text-sm text-gray-500">Reflections</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border text-center">
                    <p className="text-sm text-gray-500">Best Streak</p>
                    <p className="text-2xl font-bold">9 days</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border text-center">
                    <p className="text-sm text-gray-500">NFTs Earned</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-medium mb-2">Welcome to Your CARE Journey</h3>
            <p className="text-gray-600 mb-6">
              You haven't checked in yet. Start your wellness journey by sharing how you're feeling.
            </p>
            <Button asChild>
              <a href="/check-in">Check In Now</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
