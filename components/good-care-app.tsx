"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAccount, useDisconnect } from "wagmi"
import { Heart, Trophy, User, Home, LogOut, Wallet, Target, TrendingUp } from "lucide-react"
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
  })
  const [syncStatus, setSyncStatus] = useState({ isOnline: true, queueLength: 0 })

  // Get username from wallet address
  const username = address ? `user_${address.slice(-6)}` : "anonymous"

  useEffect(() => {
    // Update sync status periodically
    const interval = setInterval(() => {
      const status = hybridCommunityService.getSyncQueueStatus()
      setSyncStatus(status)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCheckin = async (mood: number, gratitude?: string, isPublic = false) => {
    if (!address) return

    try {
      const result = await hybridCommunityService.submitCheckin({
        userId: address,
        username,
        mood,
        gratitude,
        isPublic,
      })

      toast({
        title: result.success ? "Check-in Successful!" : "Check-in Queued",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })

      // Refresh user stats
      // This would typically fetch from an API
    } catch (error) {
      console.error("Check-in error:", error)
      toast({
        title: "Check-in Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Disconnected",
      description: "You have been disconnected from your wallet",
    })
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please connect your wallet to continue</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌱</div>
              <div>
                <h1 className="text-xl font-bold text-green-800">GOOD CARE</h1>
                <p className="text-sm text-muted-foreground">Welcome, {username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {syncStatus.isOnline ? "Online" : "Offline"}
                  {syncStatus.queueLength > 0 && ` (${syncStatus.queueLength} queued)`}
                </span>
              </div>

              {/* User Points */}
              <Badge variant="outline" className="bg-green-50">
                <Heart className="h-3 w-3 mr-1" />
                {userStats.totalPoints} pts
              </Badge>

              {/* Disconnect Button */}
              <Button onClick={handleDisconnect} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.selfCarePoints}</p>
                      <p className="text-sm text-muted-foreground">Self-CARE Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.communityPoints}</p>
                      <p className="text-sm text-muted-foreground">Community Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your wellness journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setActiveTab("checkin")} className="w-full justify-start" size="lg">
                  <Heart className="h-5 w-5 mr-3" />
                  Daily Check-in
                </Button>
                <Button
                  onClick={() => setActiveTab("leaderboard")}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <Trophy className="h-5 w-5 mr-3" />
                  View Leaderboard
                </Button>
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
                <CardDescription>How are you feeling today? Share your mood and earn CARE points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">How are you feeling?</label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { emoji: "😢", label: "Sad", value: 1 },
                      { emoji: "😕", label: "Down", value: 2 },
                      { emoji: "😐", label: "Okay", value: 3 },
                      { emoji: "😊", label: "Good", value: 4 },
                      { emoji: "😄", label: "Great", value: 5 },
                    ].map((mood) => (
                      <Button
                        key={mood.value}
                        variant="outline"
                        className="h-20 flex flex-col gap-2 bg-transparent"
                        onClick={() => handleCheckin(mood.value)}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs">{mood.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Points Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Earn CARE Points</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Base check-in: 10 points</li>
                    <li>• Add gratitude: +5 points</li>
                    <li>• Streak bonus: up to +10 points</li>
                  </ul>
                </div>
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
                  Profile
                </CardTitle>
                <CardDescription>Your wellness journey overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{username}</h3>
                    <p className="text-sm text-muted-foreground">{address}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{userStats.totalCheckins}</p>
                    <p className="text-sm text-muted-foreground">Total Check-ins</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallet Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span>GOOD CARE Subnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chain ID:</span>
                      <span>432201</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-mono text-xs">{address}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
