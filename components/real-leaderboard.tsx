"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Trophy, Users, Target, TrendingUp } from "lucide-react"

interface LeaderboardUser {
  username: string
  selfCarePoints: number
  objectivePoints: number
  totalPoints: number
  streak: number
  checkins: number
  objectives: number
  recentDays: boolean[]
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
  averageStreak: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  stats: LeaderboardStats
  lastUpdated: string
}

export default function RealLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <p className="text-gray-500">No leaderboard data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{data.stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Self-CARE Points</p>
                <p className="text-2xl font-bold text-green-900">{data.stats.totalSelfCarePoints.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Community Points</p>
                <p className="text-2xl font-bold text-purple-900">{data.stats.totalObjectivePoints.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Points</p>
                <p className="text-2xl font-bold text-orange-900">{data.stats.totalPoints.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
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
          <CardDescription>
            Showing Self-CARE points (daily check-ins) + Community CARE points (objectives)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.leaderboard.map((user, index) => (
              <div
                key={user.username}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                      : index === 2
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200"
                        : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-bold ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                            ? "text-gray-600"
                            : index === 2
                              ? "text-orange-600"
                              : "text-gray-500"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    {index < 3 && (
                      <Trophy
                        className={`h-4 w-4 ${
                          index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-500" : "text-orange-500"
                        }`}
                      />
                    )}
                  </div>

                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🔥 {user.streak} day streak</span>
                      <span>•</span>
                      <span>{user.checkins} check-ins</span>
                      <span>•</span>
                      <span>{user.objectives} objectives</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Recent Activity Dots */}
                  <div className="flex gap-1">
                    {user.recentDays.map((active, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-200"}`}
                        title={`${7 - dayIndex} days ago`}
                      />
                    ))}
                  </div>

                  {/* Points Breakdown */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Self: {user.selfCarePoints}
                      </Badge>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        Community: {user.objectivePoints}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-blue-600">{user.totalPoints} pts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No community members yet. Be the first to check in!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-500 text-center">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
    </div>
  )
}
