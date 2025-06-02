"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp, Users, Loader2 } from "lucide-react"
import { useRealAuth } from "@/providers/real-auth-provider"
import { RealSupabaseService, type LeaderboardEntry } from "@/lib/real-supabase-service"

export function RealLeaderboard() {
  const { user, isAuthenticated } = useRealAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [user])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      const data = await RealSupabaseService.getLeaderboard(10)
      setLeaderboard(data)

      // Find current user's rank
      if (user) {
        const userEntry = data.find((entry) => entry.user_id === user.id)
        setUserRank(userEntry?.rank || null)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case 2:
        return "text-gray-600 bg-gray-50 border-gray-200"
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank among fellow wellness warriors
              {userRank && <span className="block mt-1 text-green-600 font-medium">You're ranked #{userRank}! 🎉</span>}
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {leaderboard.length} members
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === user?.id

            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isCurrentUser ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getRankColor(entry.rank)}`}
                  >
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌟</span>
                    <div>
                      <p className="font-medium">
                        {entry.username}
                        {isCurrentUser && <span className="text-green-600 ml-1">(You)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-600 mb-1">
                    <Star className="h-3 w-3" />
                    <span className="font-medium">{entry.total_points}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.current_streak} day streak</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Encouragement Message */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No one has started their journey yet.</p>
            <p className="text-sm">Be the first to check in!</p>
          </div>
        ) : (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">Keep checking in daily to climb the leaderboard! 🌱</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
