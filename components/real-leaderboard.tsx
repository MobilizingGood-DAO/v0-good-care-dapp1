"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Loader2, Medal, Award, RefreshCw, Heart, Target } from "lucide-react"

interface LeaderboardEntry {
  userId: string
  username: string
  walletAddress: string
  avatar?: string
  selfCarePoints: number
  careObjectivePoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  rank: number
}

interface RealLeaderboardProps {
  currentUserId?: string
}

export function RealLeaderboard({ currentUserId }: RealLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadLeaderboard()

    // Set up realtime subscription
    const subscription = setupRealtimeSync()

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadLeaderboard = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch("/api/community/leaderboard?limit=10")
      const data = await response.json()

      if (data.success) {
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const setupRealtimeSync = () => {
    // This would be implemented with Supabase realtime
    // For now, we'll refresh every 30 seconds
    const interval = setInterval(() => {
      loadLeaderboard(true)
    }, 30000)

    return {
      unsubscribe: () => clearInterval(interval),
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
      case 3:
        return "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
          </div>
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
            <CardDescription>Top performers in the GOOD CARE community</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadLeaderboard(true)} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">Be the first to check in and start earning CARE Points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`p-4 rounded-lg border-2 ${getRankColor(entry.rank)} ${
                  entry.userId === currentUserId ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
                    <div>
                      <p className="font-medium">
                        @{entry.username}
                        {entry.userId === currentUserId && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>🔥 {entry.currentStreak} current</span>
                        <span>•</span>
                        <span>🏆 {entry.longestStreak} longest</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.totalPoints}</p>
                    <p className="text-xs text-muted-foreground mb-1">Total CARE Points</p>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1 text-green-600">
                        <Heart className="h-3 w-3" />
                        <span>{entry.selfCarePoints} Self</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <Target className="h-3 w-3" />
                        <span>{entry.careObjectivePoints} Objective</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
