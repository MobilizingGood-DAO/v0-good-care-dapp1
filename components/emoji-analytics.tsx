"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, BarChart3 } from "lucide-react"
import { EnhancedCheckInService } from "@/lib/enhanced-checkin-service"

interface EmojiAnalyticsProps {
  userId: string
}

const EMOJI_LABELS = {
  1: { emoji: "😢", label: "Struggling", color: "bg-red-500" },
  2: { emoji: "😕", label: "Difficult", color: "bg-orange-500" },
  3: { emoji: "😐", label: "Okay", color: "bg-yellow-500" },
  4: { emoji: "😊", label: "Good", color: "bg-green-500" },
  5: { emoji: "😄", label: "Amazing", color: "bg-purple-500" },
}

export function EmojiAnalytics({ userId }: EmojiAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [userId])

  const loadAnalytics = async () => {
    try {
      const checkInService = new EnhancedCheckInService(userId)
      const data = await checkInService.getEmojiAnalytics(30)
      setAnalytics(data)
    } catch (error) {
      console.error("Error loading emoji analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalCheckIns = Object.values(analytics).reduce((sum, count) => sum + count, 0)
  const averageRating =
    totalCheckIns > 0
      ? Object.entries(analytics).reduce((sum, [rating, count]) => sum + Number.parseInt(rating) * count, 0) /
        totalCheckIns
      : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-3 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Mood Insights
        </CardTitle>
        <CardDescription>Your emotional patterns over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalCheckIns > 0 ? (
          <>
            {/* Average Rating */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Average Mood</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{averageRating.toFixed(1)}/5</div>
                <div className="text-xs text-blue-600">
                  {EMOJI_LABELS[Math.round(averageRating) as keyof typeof EMOJI_LABELS]?.emoji}
                  {EMOJI_LABELS[Math.round(averageRating) as keyof typeof EMOJI_LABELS]?.label}
                </div>
              </div>
            </div>

            {/* Mood Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Mood Distribution</h4>
              {Object.entries(EMOJI_LABELS).map(([rating, info]) => {
                const count = analytics[Number.parseInt(rating)] || 0
                const percentage = totalCheckIns > 0 ? (count / totalCheckIns) * 100 : 0

                return (
                  <div key={rating} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.emoji}</span>
                        <span>{info.label}</span>
                      </div>
                      <span className="font-medium">{count} times</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>

            {/* Total Check-ins */}
            <div className="text-center pt-2 border-t">
              <div className="text-2xl font-bold text-gray-700">{totalCheckIns}</div>
              <div className="text-sm text-gray-500">Total check-ins this month</div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No check-ins yet this month</p>
            <p className="text-sm">Start checking in to see your mood insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
