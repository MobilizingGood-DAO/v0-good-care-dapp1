"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Loader2, Trophy, Medal, Award, Users, TrendingUp, Target, Heart } from "lucide-react"

interface LeaderboardUser {
  user_id: string
  username: string
  avatar_url?: string
  selfCarePoints: number
  communityPoints: number
  totalPoints: number
  checkInCount: number
  objectiveCount: number
  rank: number
  lastActivity?: string
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalCommunityPoints: number
  averagePoints: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  stats: LeaderboardStats
}

interface RealLeaderboardProps {
  currentUserId?: string
}

export function RealLeaderboard({ currentUserId }: RealLeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
    // Refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadLeaderboard = async () => {
    try {
      console.log("🏆 Loading enhanced leaderboard...")

      const response = await fetch("/api/community/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setData(result)
      setError(null)
      console.log("✅ Leaderboard loaded:", result.leaderboard?.length || 0, "users")
    } catch (err) {
      console.error("❌ Error loading leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
    } finally {
      setIsLoading(false)
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
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  const getRecentActivityDots = (lastActivity?: string) => {
    if (!lastActivity) return null

    const today = new Date()
    const activityDate = new Date(lastActivity)
    const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

    // Show dots for last 7 days
    const dots = []
    for (let i = 6; i >= 0; i--) {
      const isActive = i >= daysDiff
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-200"}`}
          title={`${i} days ago`}
        />,
      )
    }

    return (
      <div className="flex space-x-1" title="Activity in last 7 days">
        {dots}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading community leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button onClick={loadLeaderboard} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Try Again
            </button>
          </div>
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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSelfCarePoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Self-CARE Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCommunityPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Community Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averagePoints}</p>
                <p className="text-xs text-muted-foreground">Avg Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>Wellness warriors making a difference in our community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((user) => {
              const isCurrentUser = currentUserId === user.user_id
              const maxPoints = leaderboard[0]?.totalPoints || 1

              return (
                <div
                  key={user.user_id}
                  className={`p-4 rounded-lg border transition-all ${getRankStyle(user.rank)} ${
                    isCurrentUser ? "ring-2 ring-green-500 ring-opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8">{getRankIcon(user.rank)}</div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            @{user.username}
                            {isCurrentUser && <span className="text-xs text-green-600 ml-2">(You)</span>}
                          </h4>
                        </div>

                        {/* Points Breakdown */}
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Heart className="h-3 w-3 mr-1" />
                            {user.selfCarePoints} Self-CARE
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Target className="h-3 w-3 mr-1" />
                            {user.communityPoints} Community
                          </Badge>
                        </div>

                        {/* Activity Dots */}
                        <div className="mt-2">{getRecentActivityDots(user.lastActivity)}</div>
                      </div>
                    </div>

                    {/* Total Points & Progress */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{user.totalPoints.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.checkInCount} check-ins • {user.objectiveCount} objectives
                      </div>

                      {/* Progress Bar */}
                      <div className="w-24 mt-2">
                        <Progress value={(user.totalPoints / maxPoints) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {leaderboard.length > 10 && (
            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing top {Math.min(10, leaderboard.length)} of {leaderboard.length} members
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
