"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Users, Trophy, TrendingUp, Wifi, WifiOff } from "lucide-react"
import { hybridCommunityService, type LeaderboardData, type LeaderboardUser } from "@/lib/hybrid-community-service"

export function RealLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ isOnline: true, queueLength: 0 })

  const fetchLeaderboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)

      console.log("🏆 Component: Fetching leaderboard...")
      const data = await hybridCommunityService.getLeaderboard()

      if (data) {
        setLeaderboardData(data)
        console.log("✅ Component: Leaderboard data loaded:", data.leaderboard?.length || 0, "users")
      } else {
        setError("No data available")
        console.log("📭 Component: No leaderboard data returned")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load leaderboard"
      setError(errorMessage)
      console.error("❌ Component: Error loading leaderboard:", err)
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  const updateSyncStatus = () => {
    const status = hybridCommunityService.getSyncQueueStatus()
    setSyncStatus(status)
  }

  useEffect(() => {
    fetchLeaderboard()
    updateSyncStatus()

    // Update sync status every 10 seconds
    const statusInterval = setInterval(updateSyncStatus, 10000)

    return () => clearInterval(statusInterval)
  }, [])

  const handleRefresh = () => {
    fetchLeaderboard(true)
    updateSyncStatus()
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
    return maxPoints > 0 ? Math.min((points / maxPoints) * 100, 100) : 0
  }

  const renderActivityDots = (activity: string[]) => {
    return (
      <div className="flex gap-1">
        {activity.map((active, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-200"}`}
            title={`Day ${index + 1}: ${active ? "Active" : "Inactive"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !leaderboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <div className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Button onClick={handleRefresh} disabled={refreshing} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Failed to load leaderboard</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = leaderboardData?.stats
  const users = leaderboardData?.leaderboard || []
  const maxPoints = users.length > 0 ? users[0].total_points : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <p className="text-muted-foreground">See how you rank in the GOOD CARE community</p>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus.isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          {syncStatus.queueLength > 0 && <Badge variant="secondary">{syncStatus.queueLength} pending</Badge>}
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeUsers} active today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Self-CARE: {stats.totalSelfCarePoints} | Community: {stats.totalCommunityPoints}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averagePointsPerUser}</div>
              <p className="text-xs text-muted-foreground">per member</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>Top community members by total points (Self-CARE + Community)</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No community members yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to join and start earning points!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: LeaderboardUser) => (
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
                      {user.current_streak > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          🔥 {user.current_streak}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>Self-CARE: {user.self_care_points}</span>
                      <span>Community: {user.community_points}</span>
                      <span className="font-medium">Total: {user.total_points}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={getProgressPercentage(user.total_points, maxPoints)} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground min-w-[3rem]">
                        {Math.round(getProgressPercentage(user.total_points, maxPoints))}%
                      </span>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Last 7 days</p>
                    {renderActivityDots(user.recent_activity)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>Online: {syncStatus.isOnline ? "✅" : "❌"}</p>
            <p>Queue: {syncStatus.queueLength} items</p>
            <p>Users: {users.length}</p>
            <p>Last fetch: {new Date().toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
