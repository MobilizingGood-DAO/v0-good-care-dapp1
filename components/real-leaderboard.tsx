"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Users, Trophy, TrendingUp, Wifi, WifiOff } from "lucide-react"
import { hybridCommunityService, type LeaderboardData } from "@/lib/hybrid-community-service"

export function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData>({
    users: [],
    stats: { totalUsers: 0, totalPoints: 0, averagePoints: 0, activeToday: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({ isOnline: true, queueLength: 0, cacheSize: 0 })

  const fetchLeaderboard = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    setError(null)

    try {
      console.log("🏆 Component: Fetching leaderboard...")
      const leaderboardData = await hybridCommunityService.getLeaderboard()
      console.log("✅ Component: Received data:", leaderboardData)

      setData(leaderboardData)

      // Update connection status
      const status = hybridCommunityService.getConnectionStatus()
      setConnectionStatus(status)

      // Show debug info in development
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Debug Info:", {
          users: leaderboardData.users.length,
          stats: leaderboardData.stats,
          connection: status,
        })
      }
    } catch (err) {
      console.error("❌ Component: Error fetching leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    // Refresh every 30 seconds
    const interval = setInterval(() => fetchLeaderboard(), 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchLeaderboard(true)
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

  const getActivityDots = (activity: boolean[]) => {
    return activity.map((active, index) => (
      <div
        key={index}
        className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-200"}`}
        title={`Day ${index + 1}: ${active ? "Active" : "Inactive"}`}
      />
    ))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading leaderboard...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {connectionStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">{connectionStatus.isOnline ? "Online" : "Offline"}</span>
              {connectionStatus.queueLength > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {connectionStatus.queueLength} queued
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{data.stats.totalPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{data.stats.activeToday}</div>
                <div className="text-xs text-muted-foreground">Active Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>Top community members by total CARE points</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️ {error}</div>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : data.users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Be the first to join the community! 🌟
            </div>
          ) : (
            <div className="space-y-4">
              {data.users.map((user) => {
                const maxPoints = data.users[0]?.totalPoints || 1
                const progressPercentage = (user.totalPoints / maxPoints) * 100

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Rank */}
                    <div className="text-2xl font-bold min-w-[3rem] text-center">{getRankIcon(user.rank)}</div>

                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{user.username}</h3>
                        {user.streak > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            🔥 {user.streak} day streak
                          </Badge>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <Progress value={progressPercentage} className="h-2 mb-2" />

                      {/* Points Breakdown */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <span className="text-blue-600 font-medium">{user.selfCarePoints}</span> Self-CARE
                        </span>
                        <span>
                          <span className="text-green-600 font-medium">{user.communityPoints}</span> Community
                        </span>
                        <span className="font-semibold text-foreground">{user.totalPoints} total</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-muted-foreground">Last 7 days</div>
                      <div className="flex gap-1">{getActivityDots(user.recentActivity)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>Users loaded: {data.users.length}</div>
            <div>Connection: {connectionStatus.isOnline ? "Online" : "Offline"}</div>
            <div>Queue length: {connectionStatus.queueLength}</div>
            <div>Cache size: {connectionStatus.cacheSize}</div>
            <div>Average points: {data.stats.averagePoints}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
