"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RealSupabaseService, type LeaderboardEntry } from "@/lib/real-supabase-service"
import { useRealAuth } from "@/providers/real-auth-provider"
import { Trophy, Users, Loader2, Medal, Award } from "lucide-react"

export function RealLeaderboard() {
  const { user } = useRealAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const data = await RealSupabaseService.getLeaderboard(10)
      setLeaderboard(data)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
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
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200"
      case 2:
        return "bg-gray-50 border-gray-200"
      case 3:
        return "bg-amber-50 border-amber-200"
      default:
        return "bg-white border-gray-200"
    }
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
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Leaderboard
        </CardTitle>
        <CardDescription>See how you rank among the GOOD CARE community</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No community members yet. Be the first to check in!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`p-4 rounded-lg border-2 ${getRankColor(entry.rank)} ${
                  entry.user_id === user?.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
                    <div>
                      <p className="font-medium">
                        {entry.username}
                        {entry.user_id === user?.id && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.total_points}</p>
                    <p className="text-xs text-muted-foreground">CARE Points</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>🔥 {entry.current_streak} day streak</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
