"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Heart, Users, TrendingUp, Loader2, Target } from "lucide-react"

interface LeaderboardUser {
  id: string
  user_id: string
  username: string
  wallet_address: string
  avatar_url?: string
  selfCarePoints: number
  communityPoints: number
  totalPoints: number
  totalCheckins: number
  currentStreak: number
  recentActivity: string[]
  rank: number
  joinedAt: string
}

interface CommunityStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalCommunityPoints: number
  totalPoints: number
  averagePointsPerUser: number
  activeUsers: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  stats: CommunityStats
}

export function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      console.log("🏆 Fetching leaderboard...")
      const response = await fetch("/api/community/leaderboard")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setData(result)
      setError(null)
      console.log("✅ Leaderboard loaded:", result.leaderboard?.length || 0, "users")
    } catch (err) {
      console.error("❌ Error fetching leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const getActivityDots = (recentActivity: string[], currentStreak: number) => {
    const today = new Date()
    const dots = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const hasActivity = recentActivity.includes(dateString)
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${hasActivity ? "bg-green-500" : "bg-gray-200"}`}
          title={`${date.toLocaleDateString()}: ${hasActivity ? "Active" : "No activity"}`}
        />,
      )
    }

    return <div className="flex gap-1">{dots}</div>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading leaderboard...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchLeaderboard} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>Track community wellness contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No community members yet</p>
            <p className="text-sm text-muted-foreground mt-2">Be the first to join and start your wellness journey!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { leaderboard, stats } = data
  const maxPoints = leaderboard[0]?.totalPoints || 1

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSelfCarePoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Self-CARE Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCommunityPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Community Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averagePointsPerUser}</p>
                <p className="text-xs text-muted-foreground">Avg per User</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>Top performers in our wellness community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  user.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-gray-50"
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 flex justify-center">{getRankIcon(user.rank)}</div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{user.username}</p>
                    {user.currentStreak > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {user.currentStreak} day streak
                      </Badge>
                    )}
                  </div>

                  {/* Points Breakdown */}
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Heart className="h-3 w-3 mr-1" />
                      {user.selfCarePoints} Self-CARE
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Target className="h-3 w-3 mr-1" />
                      {user.communityPoints} Community
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <Progress value={(user.totalPoints / maxPoints) * 100} className="h-2" />
                  </div>
                </div>

                {/* Activity & Total Points */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-primary">{user.totalPoints.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mb-2">{user.totalCheckins} check-ins</div>
                  {/* Activity dots for last 7 days */}
                  <div className="flex justify-end">{getActivityDots(user.recentActivity, user.currentStreak)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
