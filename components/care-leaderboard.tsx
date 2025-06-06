"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

const mockLeaderboard = [
  { rank: 1, name: "Sarah Chen", points: 2450, streak: 15, avatar: "🌟" },
  { rank: 2, name: "Alex Rivera", points: 2380, streak: 12, avatar: "🌱" },
  { rank: 3, name: "Jordan Kim", points: 2290, streak: 18, avatar: "🌸" },
  { rank: 4, name: "Taylor Swift", points: 2150, streak: 8, avatar: "🦋" },
  { rank: 5, name: "Morgan Lee", points: 2050, streak: 22, avatar: "🌺" },
]

export function CareLeaderboard() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Community Leaderboard
        </CardTitle>
        <CardDescription>See how you're doing compared to other wellness warriors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLeaderboard.map((user) => (
            <div key={user.rank} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{user.avatar}</span>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.streak} day streak</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="font-mono">
                  {user.points.toLocaleString()} pts
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Current Rank</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="font-bold">#12</p>
                <p className="text-sm text-muted-foreground">1,850 points</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
