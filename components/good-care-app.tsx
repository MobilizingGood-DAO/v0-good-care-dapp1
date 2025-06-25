"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Heart,
  Trophy,
  Compass,
  ExternalLink,
  Copy,
  RefreshCw,
  Clock,
  Flame,
  Calendar,
  User,
  LogOut,
} from "lucide-react"
import { useAccount, useDisconnect } from "wagmi"
import { HybridCommunityService } from "@/lib/hybrid-community-service"
import { MOOD_EMOJIS } from "@/lib/local-checkin-service"

// Simple user interface for localStorage
interface LocalUser {
  id: string
  walletAddress: string
  username?: string
  email?: string
}

interface UserStats {
  totalPoints: number
  currentStreak: number
  level: number
  totalCheckins: number
}

interface CheckIn {
  id: string
  userId: string
  emoji: string
  timestamp: number
  gratitudeNote?: string
  finalPoints: number
}

export default function GoodCareApp() {
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const [user, setUser] = useState<LocalUser | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([])
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      userId: string
      username: string
      walletAddress: string
      totalPoints: number
      currentStreak: number
      level: number
      rank: number
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(true)
  const [nextCheckIn, setNextCheckIn] = useState<Date | null>(null)

  // Authentication states
  const [newUsername, setNewUsername] = useState("")

  // Check-in states
  const [selectedMood, setSelectedMood] = useState<keyof typeof MOOD_EMOJIS | null>(null)
  const [gratitudeNote, setGratitudeNote] = useState("")

  // Create or load user when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      const initUser = async () => {
        const result = await HybridCommunityService.initializeUser(address, {
          username: `User_${address.slice(-6)}`,
        })

        if (result.success && result.userId) {
          const newUser: LocalUser = {
            id: result.userId,
            walletAddress: address,
          }
          setUser(newUser)
        }
      }

      initUser()
    } else {
      setUser(null)
    }
  }, [isConnected, address])

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData(user.id)
      loadLeaderboard()
    }
  }, [user])

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const [stats, checkIns] = await Promise.all([
        HybridCommunityService.getUserStats(userId),
        HybridCommunityService.getRecentCheckIns(userId, 5),
      ])

      setUserStats(stats)
      setRecentCheckIns(checkIns)
      setCanCheckIn(true) // Will be validated on actual check-in
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const data = await HybridCommunityService.getLeaderboard(100)
      setLeaderboard(data)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
  }

  // Check-in handler
  const handleCheckIn = async () => {
    if (!user || !selectedMood) return

    setIsLoading(true)
    try {
      const result = await HybridCommunityService.recordCheckIn(
        user.id,
        user.walletAddress,
        selectedMood,
        gratitudeNote || undefined,
      )

      if (result.success) {
        toast({
          title: "Check-in recorded! 🎉",
          description: `You earned ${result.points} CARE points!`,
        })

        // Reset form
        setSelectedMood(null)
        setGratitudeNote("")

        // Reload user data
        await loadUserData(user.id)
        await loadLeaderboard()
      } else {
        toast({
          title: "Check-in failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  // Update username handler
  const handleUpdateUsername = async () => {
    if (!user || !newUsername) return

    const updatedUser = { ...user, username: newUsername }
    localStorage.setItem("goodcare_current_user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setNewUsername("")

    toast({
      title: "Username updated!",
      description: "Your username has been saved.",
    })
  }

  // Copy address handler
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <p className="text-muted-foreground">Setting up your GOOD CARE profile...</p>
        </div>
      </div>
    )
  }

  // Mobile-first app layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌱</div>
            <div>
              <h1 className="font-bold text-green-800">GOOD CARE</h1>
              <p className="text-xs text-muted-foreground">{user.username || `User_${user.walletAddress.slice(-6)}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Level {userStats?.level || 1}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => disconnect()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Points Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{userStats?.totalPoints || 0} CARE Points</span>
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs">{userStats?.currentStreak || 0} day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="check-in" className="w-full">
          {/* Mobile-optimized tab list */}
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="check-in" className="flex flex-col gap-1 h-12">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Check-in</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex flex-col gap-1 h-12">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Community</span>
            </TabsTrigger>
            <TabsTrigger value="next-steps" className="flex flex-col gap-1 h-12">
              <Compass className="h-4 w-4" />
              <span className="text-xs">Steps</span>
            </TabsTrigger>
            <TabsTrigger value="my-care" className="flex flex-col gap-1 h-12">
              <User className="h-4 w-4" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Daily Check-in Tab - Primary focus */}
          <TabsContent value="check-in" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Daily Check-in</CardTitle>
                <CardDescription className="text-sm">How are you feeling today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canCheckIn && nextCheckIn ? (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                    <p className="font-medium text-sm">Already checked in!</p>
                    <p className="text-xs text-muted-foreground">Next check-in at {nextCheckIn.toLocaleTimeString()}</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile-optimized mood selection */}
                    <div className="space-y-3">
                      <Label className="text-sm">How are you feeling?</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(MOOD_EMOJIS).map(([emoji, { value, label }]) => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedMood(emoji as keyof typeof MOOD_EMOJIS)}
                            className={`aspect-square text-3xl p-3 rounded-xl transition-all hover:scale-105 ${
                              selectedMood === emoji
                                ? "bg-green-100 ring-2 ring-green-500 shadow-md"
                                : "bg-white hover:bg-gray-50 border"
                            }`}
                            title={label}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {selectedMood && (
                        <p className="text-center text-sm text-muted-foreground font-medium">
                          {MOOD_EMOJIS[selectedMood].label}
                        </p>
                      )}
                    </div>

                    {/* Gratitude Note */}
                    <div className="space-y-2">
                      <Label htmlFor="gratitude" className="text-sm">
                        What are you grateful for? <span className="text-green-600">(+5 points)</span>
                      </Label>
                      <Textarea
                        id="gratitude"
                        placeholder="I'm grateful for..."
                        value={gratitudeNote}
                        onChange={(e) => setGratitudeNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Points Preview */}
                    {selectedMood && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          You'll earn: {10 + (gratitudeNote ? 5 : 0)} points
                        </p>
                        {userStats?.currentStreak && userStats.currentStreak >= 3 && (
                          <p className="text-xs text-green-600">
                            + Streak bonus: ×
                            {userStats.currentStreak >= 14 ? "2.0" : userStats.currentStreak >= 7 ? "1.5" : "1.25"}
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleCheckIn}
                      disabled={!selectedMood || isLoading}
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="mr-2 h-4 w-4" />
                      )}
                      Record Check-in
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Check-ins - Compact for mobile */}
            {recentCheckIns.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Recent Check-ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentCheckIns.slice(0, 3).map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{checkIn.emoji}</span>
                          <div>
                            <p className="text-sm font-medium">{new Date(checkIn.timestamp).toLocaleDateString()}</p>
                            {checkIn.gratitudeNote && (
                              <p className="text-xs text-muted-foreground truncate max-w-32">
                                "{checkIn.gratitudeNote}"
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{checkIn.finalPoints}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Community Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.userId === user.id ? "bg-green-100 border border-green-200" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs font-bold">
                            {index < 3 ? (index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉") : index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{entry.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{entry.totalPoints}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">L{entry.level}</span>
                            {entry.currentStreak > 0 && <span className="text-xs">🔥{entry.currentStreak}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Complete your first check-in to join!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">First check-in</span>
                    <Badge variant={recentCheckIns.length > 0 ? "default" : "secondary"} className="text-xs">
                      {recentCheckIns.length > 0 ? "✓" : "Start"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Set username</span>
                    <Badge variant={user.username ? "default" : "secondary"} className="text-xs">
                      {user.username ? "✓" : "Set"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Follow @goodonavax</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://twitter.com/goodonavax" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="my-care" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-6)}`}
                      readOnly
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={() => copyAddress(user.walletAddress)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm">
                    Username
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      placeholder={user.username || "Set username"}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="text-sm"
                    />
                    <Button onClick={handleUpdateUsername} disabled={!newUsername} size="sm">
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{userStats?.totalPoints || 0}</p>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{userStats?.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{userStats?.level || 1}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{userStats?.totalCheckins || 0}</p>
                <p className="text-xs text-muted-foreground">Check-ins</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
