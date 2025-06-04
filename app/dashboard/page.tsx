"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EnhancedCheckIn } from "@/components/enhanced-check-in"
import { EnhancedWallet } from "@/components/enhanced-wallet"
import { LeaderboardService, type LeaderboardEntry } from "@/lib/leaderboard-service"
import { WalletService } from "@/lib/wallet-service"
import { Trophy, Users, Wallet, CheckCircle, TrendingUp } from "lucide-react"

// Demo user data - in real app this would come from auth
const DEMO_USER = {
  id: "demo-user-123",
  username: "DemoUser",
  email: "demo@goodcare.network",
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [demoWallet, setDemoWallet] = useState<any>(null)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      // Generate demo wallet
      const wallet = WalletService.generateDemoWallet(DEMO_USER.id)
      setDemoWallet(wallet)

      // Load leaderboard data
      const [globalLeaderboard, userRankData] = await Promise.all([
        LeaderboardService.getGlobalLeaderboard(10),
        LeaderboardService.getUserRankAndNearby(DEMO_USER.id, 3),
      ])

      setLeaderboard(globalLeaderboard)
      setUserRank(userRankData.userRank)
    } catch (error) {
      console.error("Error initializing dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {DEMO_USER.username}!</h1>
          <p className="text-muted-foreground">Ready to continue your wellness journey?</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Rank #{userRank || "Unranked"}
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Send
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Check-in Tab */}
        <TabsContent value="checkin">
          <EnhancedCheckIn userId={DEMO_USER.id} />
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet">
          {demoWallet && <EnhancedWallet walletAddress={demoWallet.address} privateKey={demoWallet.privateKey} />}
        </TabsContent>

        {/* Send Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Send Tokens</CardTitle>
              <CardDescription>Send CARE or GCT tokens to other users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Send Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  Token sending functionality will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>See how you rank among the GOOD CARE community</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
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
                      className={`p-4 rounded-lg border-2 ${
                        entry.rank <= 3
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                          : "bg-white border-gray-200"
                      } ${entry.userId === DEMO_USER.id ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
                          <div>
                            <p className="font-medium">
                              {entry.username}
                              {entry.userId === DEMO_USER.id && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>🔥 {entry.currentStreak} day streak</span>
                              <span>•</span>
                              <span>{entry.currentMultiplier}x multiplier</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{entry.totalPoints}</p>
                          <p className="text-xs text-muted-foreground">CARE Points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
