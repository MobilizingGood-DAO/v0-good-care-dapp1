"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Users, TrendingUp, Heart, Target, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { hybridCommunityService, type LeaderboardData } from "@/lib/hybrid-community-service"

export function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      console.log("🔄 Fetching leaderboard from service...")
      const result = await hybridCommunityService.getLeaderboard()

      if (result) {
        console.log("✅ Leaderboard data received:", result.leaderboard?.length || 0, "users")
        setData(result)
        setError(null)
      } else {
        console.log("❌ No leaderboard data received")
        setError("Failed to load leaderboard data")
      }
    } catch (err) {
      console.error("❌ Error fetching leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    console.log("🚀 RealLeaderboard component mounted")
    fetchLeaderboard()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("⏰ Auto-refreshing leaderboard...")
      fetchLeaderboard(true)
    }, 30000)

    return () => {
      console.log("🛑 RealLeaderboard component unmounted")
      clearInterval(interval)
    }
  }, [])

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

  const getProgressColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600"
      default:
        return "bg-gradient-to-r from-green-400 to-blue-500"
    }
  }

  const formatRecentActivity = (activity: string[]) => {
    if (!activity || activity.length === 0) return []
    return activity.slice(0, 7) // Last 7 days
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>Loading community wellness champions...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Loading leaderboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>Unable to load leaderboard data</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">{error || "No data available"}</p>
          <Button onClick={() => fetchLeaderboard()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { leaderboard, stats } = data
  const maxPoints = leaderboard[0]?.total_points || 1

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
                <p className="text-xs text-muted-foreground">Avg Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>Top wellness champions in our community</CardDescription>
          </div>
          <Button onClick={() => fetchLeaderboard(true)} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found. Be the first to check in!</p>
            </div>
          ) : (
            leaderboard.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  user.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-muted/30"
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 flex justify-center">{getRankIcon(user.rank)}</div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{user.username}</p>
                    {user.current_streak > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        🔥 {user.current_streak}
                      </Badge>
                    )}
                  </div>

                  {/* Points Breakdown */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        <Heart className="h-3 w-3 mr-1" />
                        {user.self_care_points}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        <Target className="h-3 w-3 mr-1" />
                        {user.community_points}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold">{user.total_points} total</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(user.rank)}`}
                      style={{
                        width: `${Math.max((user.total_points / maxPoints) * 100, 5)}%`,
                      }}
                    />
                  </div>

                  {/* Recent Activity */}
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground mr-2">Recent:</p>
                    {formatRecentActivity(user.recent_activity).map((date, index) => (
                      <div key={index} className="w-2 h-2 rounded-full bg-green-400" title={`Active on ${date}`} />
                    ))}
                    {formatRecentActivity(user.recent_activity).length === 0 && (
                      <span className="text-xs text-muted-foreground">No recent activity</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right text-sm text-muted-foreground">
                  <p>{user.total_checkins} check-ins</p>
                  <p className="text-xs">Joined {new Date(user.joined_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
