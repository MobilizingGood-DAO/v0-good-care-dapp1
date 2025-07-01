"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Users, Heart, Target, TrendingUp, Wifi, WifiOff } from "lucide-react"
import { hybridCommunityService } from "@/lib/hybrid-community-service"
import type { LeaderboardData, LeaderboardUser } from "@/lib/hybrid-community-service"

export function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const fetchLeaderboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)

      console.log("🏆 RealLeaderboard: Fetching data...")
      const result = await hybridCommunityService.getLeaderboard()

      if (result) {
        console.log("✅ RealLeaderboard: Data received:", result)
        setData(result)
      } else {
        console.log("⚠️ RealLeaderboard: No data received")
        setError("No data available")
      }
    } catch (err) {
      console.error("❌ RealLeaderboard: Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
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

  const getProgressPercentage = (points: number, maxPoints: number) => {
    return maxPoints > 0 ? (points / maxPoints) * 100 : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <Button onClick={handleRefresh} size="sm" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Target className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Unable to load leaderboard</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
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

  const maxPoints = data?.leaderboard?.[0]?.total_points || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Leaderboard</h2>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
          <Button onClick={handleRefresh} size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">
              <strong>Debug:</strong> Online: {isOnline ? "Yes" : "No"} | Users: {data?.leaderboard?.length || 0} |
              Success: {data?.success ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Community Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{data?.stats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Self-CARE Points</p>
                <p className="text-2xl font-bold">{data?.stats?.totalSelfCarePoints || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Community Points</p>
                <p className="text-2xl font-bold">{data?.stats?.totalCommunityPoints || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Points</p>
                <p className="text-2xl font-bold">{data?.stats?.averagePointsPerUser || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Community members ranked by their total CARE points</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.leaderboard || data.leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to join the community!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.leaderboard.map((user: LeaderboardUser) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <div className="text-2xl font-bold w-12 text-center">{getRankIcon(user.rank)}</div>

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
                          {user.current_streak} day streak
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>Self-CARE: {user.self_care_points}</span>
                      <span>Community: {user.community_points}</span>
                      <span className="font-medium">Total: {user.total_points}</span>
                    </div>

                    {/* Progress Bar */}
                    <Progress value={getProgressPercentage(user.total_points, maxPoints)} className="h-2" />
                  </div>

                  {/* Recent Activity */}
                  <div className="hidden sm:flex items-center gap-1">
                    {user.recent_activity.map((activity, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${activity === "✅" ? "bg-green-500" : "bg-gray-200"}`}
                        title={`Day ${index + 1}: ${activity === "✅" ? "Active" : "Inactive"}`}
                      />
                    ))}
                  </div>

                  {/* Total Points Badge */}
                  <Badge variant="outline" className="font-mono">
                    {user.total_points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
