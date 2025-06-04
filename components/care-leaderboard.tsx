"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp, Users } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { getMockLeaderboard, CarePointsService, type LeaderboardEntry } from "@/lib/care-points-service"

export function CareLeaderboard() {
  const { address, isConnected } = useWallet()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null)

  useEffect(() => {
    // Load mock leaderboard data
    const mockData = getMockLeaderboard()

    // If user is connected, add their data to the leaderboard
    if (isConnected && address) {
      const carePointsService = new CarePointsService(address)
      const userData = carePointsService.loadData()

      const userLeaderboardEntry: LeaderboardEntry = {
        address,
        username: `User_${address.slice(-4)}`,
        totalPoints: userData.totalPoints,
        currentStreak: userData.currentStreak,
        level: userData.level,
        avatar: "🌟",
      }

      // Combine user data with mock data and sort
      const combinedData = [...mockData, userLeaderboardEntry].sort((a, b) => b.totalPoints - a.totalPoints)

      setLeaderboard(combinedData)

      // Find user's rank
      const rank = combinedData.findIndex((entry) => entry.address === address) + 1
      setUserRank(rank)
      setUserEntry(userLeaderboardEntry)
    } else {
      setLeaderboard(mockData)
      setUserRank(null)
      setUserEntry(null)
    }
  }, [isConnected, address])

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

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case 2:
        return "text-gray-600 bg-gray-50 border-gray-200"
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>See how you rank among fellow wellness warriors</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {leaderboard.length} members
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's Current Rank (if connected) */}
        {userRank && userEntry && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getRankColor(userRank)}`}
                >
                  {getRankIcon(userRank)}
                </div>
                <div>
                  <p className="font-medium">Your Rank</p>
                  <p className="text-sm text-muted-foreground">
                    {userEntry.totalPoints} CARE Points • Level {userEntry.level}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{userEntry.currentStreak} day streak</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.slice(0, 10).map((entry, index) => {
            const rank = index + 1
            const isCurrentUser = entry.address === address

            return (
              <div
                key={entry.address}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isCurrentUser ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getRankColor(rank)}`}
                  >
                    {getRankIcon(rank)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{entry.avatar}</span>
                    <div>
                      <p className="font-medium">
                        {entry.username}
                        {isCurrentUser && <span className="text-green-600 ml-1">(You)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-600 mb-1">
                    <Star className="h-3 w-3" />
                    <span className="font-medium">{entry.totalPoints}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.currentStreak} day streak</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Encouragement Message */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">Keep checking in daily to climb the leaderboard! 🌱</p>
        </div>
      </CardContent>
    </Card>
  )
}
