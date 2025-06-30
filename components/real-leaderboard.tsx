"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Heart, Users, Target, TrendingUp, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeaderboardUser {
  username: string
  selfCarePoints: number
  communityPoints: number
  totalPoints: number
  streak: number
  checkins: number
  lastCheckin: string
  level: number
  rank: number
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalCommunityPoints: number
  totalPoints: number
  averagePointsPerUser: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  stats: LeaderboardStats
  success: boolean
}

export default function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch("/api/community/leaderboard")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch leaderboard")
      }

      setData(result)
      setError(null)
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchLeaderboard(true), 30000)
    return () => clearInterval(interval)
  }, [])

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

  const getStreakDots = (streak: number) => {
    const dots = []
    const maxDots = 7
    const activeDots = Math.min(streak, maxDots)

    for (let i = 0; i < maxDots; i++) {
      dots.push(<div key={i} className={`w-2 h-2 rounded-full ${i < activeDots ? "bg-green-500" : "bg-gray-200"}`} />)
    }
    return dots
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchLeaderboard()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No leaderboard data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-700">{data.stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-600">Self-CARE</p>
                <p className="text-2xl font-bold text-green-700">{data.stats.totalSelfCarePoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-600">Community</p>
                <p className="text-2xl font-bold text-purple-700">{data.stats.totalCommunityPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-600">Total Points</p>
                <p className="text-2xl font-bold text-orange-700">{data.stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Community Leaderboard</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => fetchLeaderboard(true)} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.leaderboard.map((user) => (
              <div
                key={user.username}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                  user.rank <= 3
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10">{getRankIcon(user.rank)}</div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.username}</h3>
                      <Badge variant="outline" className="text-xs">
                        Level {user.level}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          {user.selfCarePoints}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {user.communityPoints}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-1">
                        {getStreakDots(user.streak)}
                        <span className="text-xs text-muted-foreground ml-2">
                          {user.streak} day{user.streak !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{user.totalPoints.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.checkins} check-in{user.checkins !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(user.lastCheckin)}</div>
                </div>
              </div>
            ))}
          </div>

          {data.leaderboard.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found. Be the first to check in!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
