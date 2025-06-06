"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRealAuth } from "@/providers/real-auth-provider"
import { RealSupabaseService, type LeaderboardEntry } from "@/lib/real-supabase-service"
import { Trophy, Medal, Award, Loader2 } from "lucide-react"

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

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800">🥇 Champion</Badge>
      case 2:
        return <Badge className="bg-gray-100 text-gray-800">🥈 Runner-up</Badge>
      case 3:
        return <Badge className="bg-amber-100 text-amber-800">🥉 Third Place</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading leaderboard...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🏆 Community Leaderboard</CardTitle>
        <CardDescription>See how you rank among fellow wellness warriors</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No community members yet. Be the first to check in!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  entry.user_id === user?.id ? "bg-blue-50 border-blue-200" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} />
                  <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{entry.username}</p>
                    {entry.user_id === user?.id && <Badge variant="outline">You</Badge>}
                    {getRankBadge(entry.rank)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Level {entry.level}</span>
                    <span>🔥 {entry.current_streak} day streak</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{entry.total_points}</p>
                  <p className="text-xs text-muted-foreground">CARE Points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
