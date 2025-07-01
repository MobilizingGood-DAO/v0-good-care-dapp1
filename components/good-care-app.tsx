"use client"

import { useState, useEffect } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Trophy, User, Wallet, LogOut, CheckCircle, Calendar, Target, TrendingUp } from "lucide-react"
import { RealLeaderboard } from "@/components/real-leaderboard"
import { hybridCommunityService } from "@/lib/hybrid-community-service"
import { useToast } from "@/hooks/use-toast"

export default function GoodCareApp() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    selfCarePoints: 0,
    communityPoints: 0,
    currentStreak: 0,
    totalCheckins: 0,
    rank: 0,
  })
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false)

  // Mock user ID based on wallet address
  const userId = address ? `user_${address.slice(-8)}` : null

  useEffect(() => {
    if (userId) {
      loadUserStats()
      checkTodayCheckin()
    }
  }, [userId])

  const loadUserStats = async () => {
    try {
      const leaderboardData = await hybridCommunityService.getLeaderboard()
      if (leaderboardData) {
        const currentUser = leaderboardData.leaderboard.find(
          (user) => user.wallet_address?.toLowerCase() === address?.toLowerCase(),
        )

        if (currentUser) {
          setUserStats({
            totalPoints: currentUser.totalPoints,
            selfCarePoints: currentUser.selfCarePoints,
            communityPoints: currentUser.communityPoints,
            currentStreak: currentUser.currentStreak,
            totalCheckins: currentUser.totalCheckins,
            rank: currentUser.rank,
          })
        }
      }
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const checkTodayCheckin = () => {
    // Check localStorage for today's checkin
    const today = new Date().toISOString().split("T")[0]
    const checkinKey = `checkin_${userId}_${today}`
    const hasCheckedIn = localStorage.getItem(checkinKey) === "true"
    setHasCheckedInToday(hasCheckedIn)
  }

  const handleCheckin = async (mood: number, gratitude?: string) => {
    if (!userId || hasCheckedInToday) return

    setIsSubmittingCheckin(true)

    try {
      const result = await hybridCommunityService.submitCheckin({
        userId,
        mood,
        gratitude,
        isPublic: true,
      })

      if (result.success) {
        // Mark as checked in today
        const today = new Date().toISOString().split("T")[0]
        const checkinKey = `checkin_${userId}_${today}`
        localStorage.setItem(checkinKey, "true")

        setHasCheckedInToday(true)

        toast({
          title: "Check-in Successful! 🎉",
          description: result.message,
        })

        // Refresh user stats
        setTimeout(loadUserStats, 1000)
      } else {
        toast({
          title: "Check-in Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Checkin error:", error)
      toast({
        title: "Check-in Failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingCheckin(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out",
    })
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please connect your wallet to continue</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌱</div>
              <h1 className="text-xl font-bold text-green-800">GOOD CARE</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userStats.totalPoints} points • Rank #{userStats.rank || "—"}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.selfCarePoints}</p>
                      <p className="text-sm text-muted-foreground">Self-CARE Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.communityPoints}</p>
                      <p className="text-sm text-muted-foreground">Community Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">#{userStats.rank || "—"}</p>
                      <p className="text-sm text-muted-foreground">Community Rank</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to GOOD CARE! 🌱</CardTitle>
                <CardDescription>Your daily wellness companion on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Daily Check-ins</p>
                      <p className="text-sm text-muted-foreground">Track your mood and earn Self-CARE points</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Community Objectives</p>
                      <p className="text-sm text-muted-foreground">Complete objectives to earn Community points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Daily Check-in
                </CardTitle>
                <CardDescription>How are you feeling today? Share your mood and gratitude.</CardDescription>
              </CardHeader>
              <CardContent>
                {hasCheckedInToday ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Already checked in today! 🎉</h3>
                    <p className="text-muted-foreground">Come back tomorrow for your next check-in</p>
                    <Badge variant="secondary" className="mt-4">
                      Current streak: {userStats.currentStreak} days
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">How are you feeling today? (1-5)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((mood) => (
                          <Button
                            key={mood}
                            variant="outline"
                            size="lg"
                            className="flex-1 bg-transparent"
                            onClick={() => handleCheckin(mood)}
                            disabled={isSubmittingCheckin}
                          >
                            {mood === 1 && "😢"}
                            {mood === 2 && "😕"}
                            {mood === 3 && "😐"}
                            {mood === 4 && "😊"}
                            {mood === 5 && "😄"}
                            <span className="ml-2">{mood}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>Earn 10 base points + streak bonus for checking in!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <RealLeaderboard />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                        {address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </h3>
                      <p className="text-muted-foreground">GOOD CARE Member</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{userStats.totalCheckins}</p>
                      <p className="text-sm text-muted-foreground">Total Check-ins</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Wallet Connected</p>
                      <p className="text-sm text-muted-foreground">{address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
