"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Users, Trophy, TrendingUp, Wifi, WifiOff } from "lucide-react"
import { hybridCommunityService, type LeaderboardData } from "@/lib/hybrid-community-service"

export function RealLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    users: [],
    stats: { totalUsers: 0, totalPoints: 0, averagePoints: 0, activeToday: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState({ isOnline: true, queueLength: 0, lastSync: Date.now() })

  const loadLeaderboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)

      console.log("🏆 Component: Loading leaderboard...")
      const data = await hybridCommunityService.getLeaderboard()

      console.log("📊 Component: Received data:", {
        userCount: data.users.length,
        totalPoints: data.stats.totalPoints,
        activeToday: data.stats.activeToday,
      })

      setLeaderboardData(data)

      // Update sync status
      const status = hybridCommunityService.getSyncStatus()
      setSyncStatus(status)
    } catch (err) {
      console.error("❌ Component: Failed to load leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()

    // Refresh every 2 minutes
    const interval = setInterval(
      () => {
        loadLeaderboard()
      },
      2 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    hybridCommunityService.clearCache()
    loadLeaderboard(true)
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

  const getProgressPercentage = (points: number, maxPoints: number) => {
    return maxPoints > 0 ? (points / maxPoints) * 100 : 0
  }

  const maxPoints = leaderboardData.users.length > 0 ? leaderboardData.users[0].totalPoints : 1

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              {syncStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span>
                Status: {syncStatus.isOnline ? "Online" : "Offline"} | Queue: {syncStatus.queueLength} | Users:{" "}
                {leaderboardData.users.length} | Points: {leaderboardData.stats.totalPoints}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Total Users</p>
                <p className="text-2xl font-bold">{leaderboardData.stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Total Points</p>
                <p className="text-2xl font-bold">{leaderboardData.stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Average Points</p>
                <p className="text-2xl font-bold">{leaderboardData.stats.averagePoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="ml-2">
                <p className="text-sm font-medium leading-none">Active Today</p>
                <p className="text-2xl font-bold">{leaderboardData.stats.activeToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Community Leaderboard</CardTitle>
            <CardDescription>Top contributors in the GOOD CARE community</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Failed to load leaderboard</p>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          ) : leaderboardData.users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No users found</p>
              <p className="text-sm">Be the first to join the community!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboardData.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="text-lg font-bold">{getRankIcon(user.rank)}</span>
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      {user.streak > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          🔥 {user.streak}
                        </Badge>
                      )}
                    </div>

                    {/* Points Breakdown */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>Self-CARE: {user.selfCarePoints}</span>
                      <span>Community: {user.communityPoints}</span>
                      <span className="font-medium">Total: {user.totalPoints}</span>
                    </div>

                    {/* Progress Bar */}
                    <Progress value={getProgressPercentage(user.totalPoints, maxPoints)} className="h-2" />
                  </div>

                  {/* Recent Activity */}
                  <div className="flex-shrink-0">
                    <div className="flex gap-1">
                      {user.recentActivity.map((active, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-200"}`}
                          title={`${7 - index} days ago`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">7 days</p>
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
