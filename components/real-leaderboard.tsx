"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Loader2, Medal, Award, RefreshCw, Heart, Target } from "lucide-react"

interface LeaderboardEntry {
  userId: string
  username: string
  walletAddress: string
  selfCarePoints: number
  careObjectivePoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  rank: number
  objectives: Array<{
    title: string
    points: number
    category: string
  }>
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
}

interface RealLeaderboardProps {
  currentUserId?: string
}

export function RealLeaderboard({ currentUserId }: RealLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch("/api/community/leaderboard?limit=10")
      const data = await response.json()

      if (data.success) {
        setLeaderboard(data.leaderboard || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
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
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
      case 3:
        return "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
      default:
        return "bg-white border-gray-200"
    }
  }

  const getStreakDays = (streak: number) => {
    const days = []
    for (let i = 0; i < Math.min(streak, 7); i++) {
      days.push(<div key={i} className="w-2 h-2 rounded-full bg-green-500" title={`Day ${i + 1}`} />)
    }
    return days
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.totalSelfCarePoints}</div>
              <div className="text-xs text-muted-foreground">Self-CARE</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{stats.totalObjectivePoints}</div>
              <div className="text-xs text-muted-foreground">Community</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>Top performers in the GOOD CARE community</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadLeaderboard(true)} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No rankings yet</h3>
              <p className="text-muted-foreground">Be the first to check in and start earning CARE Points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`p-4 rounded-lg border-2 ${getRankColor(entry.rank)} ${
                    entry.userId === currentUserId ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
                      <div>
                        <p className="font-medium">
                          @{entry.username}
                          {entry.userId === currentUserId && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>🔥 {entry.currentStreak} current</span>
                          <span>•</span>
                          <span>🏆 {entry.longestStreak} longest</span>
                        </div>

                        {/* Streak Visualization */}
                        {entry.currentStreak > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="flex gap-1">{getStreakDays(entry.currentStreak)}</div>
                            {entry.currentStreak > 7 && (
                              <span className="text-xs text-muted-foreground">+{entry.currentStreak - 7}</span>
                            )}
                          </div>
                        )}

                        {/* Recent Objectives */}
                        {entry.objectives && entry.objectives.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.objectives.slice(0, 2).map((objective, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {objective.title} (+{objective.points})
                              </Badge>
                            ))}
                            {entry.objectives.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.objectives.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.totalPoints}</p>
                      <p className="text-xs text-muted-foreground mb-1">Total CARE Points</p>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 text-green-600">
                          <Heart className="h-3 w-3" />
                          <span>{entry.selfCarePoints} Self</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Target className="h-3 w-3" />
                          <span>{entry.careObjectivePoints} Objective</span>
                        </div>
                      </div>
                    </div>
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
