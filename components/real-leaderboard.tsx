"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Heart, Users, Target, TrendingUp, Calendar } from "lucide-react"

interface LeaderboardUser {
  userId: string
  username: string
  avatar?: string
  selfCarePoints: number
  objectivePoints: number
  totalPoints: number
  totalCheckins: number
  currentStreak: number
  rank: number
  lastCheckin?: string
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
  averagePointsPerUser: number
}

export function RealLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/community/leaderboard")
      const data = await response.json()

      if (data.success) {
        setLeaderboard(data.leaderboard || [])
        setStats(data.stats)
        setError(null)
      } else {
        setError(data.error || "Failed to fetch leaderboard")
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError("Failed to connect to server")
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

  const getStreakDots = (streak: number) => {
    const dots = []
    const maxDots = 7
    const activeDots = Math.min(streak, maxDots)

    for (let i = 0; i < maxDots; i++) {
      dots.push(<div key={i} className={`w-2 h-2 rounded-full ${i < activeDots ? "bg-green-500" : "bg-gray-200"}`} />)
    }
    return dots
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Unable to load leaderboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Community Stats
            </CardTitle>
            <CardDescription>Overall community wellness metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Heart className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-600">{stats.totalSelfCarePoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Self-CARE Points</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-purple-600">{stats.totalObjectivePoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Community Points</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Trophy className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-600">{stats.totalPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>Top wellness champions in our community</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No leaderboard data available yet</p>
              <p className="text-sm">Complete your first check-in to appear here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    user.rank <= 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {/* Rank */}
                  <div className="text-2xl font-bold min-w-[3rem] text-center">{getRankIcon(user.rank)}</div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{user.username}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {user.currentStreak} day streak
                      </Badge>
                    </div>

                    {/* Points Breakdown */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-green-600" />
                        <span className="text-green-600 font-medium">{user.selfCarePoints}</span>
                        <span className="text-muted-foreground">Self-CARE</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-purple-600" />
                        <span className="text-purple-600 font-medium">{user.objectivePoints}</span>
                        <span className="text-muted-foreground">Community</span>
                      </div>
                    </div>

                    {/* Streak Visualization */}
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">{getStreakDots(user.currentStreak)}</div>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{user.totalPoints.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
