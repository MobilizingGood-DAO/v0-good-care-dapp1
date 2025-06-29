"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Heart, Users, Target, TrendingUp } from "lucide-react"

interface LeaderboardUser {
  username: string
  selfCarePoints: number
  objectivePoints: number
  totalPoints: number
  streak: number
  checkins: number
  objectives: number
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  stats: LeaderboardStats
}

export default function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/community/leaderboard")

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard")
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError("Failed to load leaderboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
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
          <button onClick={fetchLeaderboard} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
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
                <p className="text-2xl font-bold text-green-700">{data.stats.totalSelfCarePoints}</p>
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
                <p className="text-2xl font-bold text-purple-700">{data.stats.totalObjectivePoints}</p>
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
                <p className="text-2xl font-bold text-orange-700">{data.stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Community Leaderboard</span>
          </CardTitle>
          <CardDescription>Ranking based on Self-CARE points and Community objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.leaderboard.map((user, index) => (
              <div
                key={user.username}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">{getRankIcon(index)}</div>

                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium">{user.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">{getStreakDots(user.streak)}</div>
                      <span className="text-xs text-muted-foreground">{user.streak} day streak</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Heart className="h-3 w-3 mr-1" />
                        {user.selfCarePoints}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Target className="h-3 w-3 mr-1" />
                        {user.objectivePoints}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold">Total: {user.totalPoints} pts</p>
                  </div>
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
