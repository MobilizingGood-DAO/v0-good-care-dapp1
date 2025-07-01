"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  CheckCircle,
  Gift,
  Phone,
  Globe,
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
  selfCarePoints?: number
  careObjectivePoints?: number
}

interface CheckIn {
  id: string
  userId: string
  emoji: string
  timestamp: number
  gratitudeNote?: string
  finalPoints: number
  isPublic?: boolean
}

// Smart suggestions based on mood
const MOOD_SUGGESTIONS = {
  "😊": ["What's something you're proud of today?", "What made you smile recently?", "Share a win from this week!"],
  "😌": ["What brought you peace today?", "What are you grateful for right now?", "How did you practice self-care?"],
  "😐": [
    "What's one small thing that could improve your day?",
    "What are you looking forward to?",
    "What's keeping you balanced today?",
  ],
  "😔": ["What's weighing on you right now?", "What support do you need today?", "What would help you feel better?"],
  "😢": [
    "What's been challenging lately?",
    "How can you be kind to yourself today?",
    "What comfort do you need right now?",
  ],
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
      selfCarePoints: number
      careObjectivePoints: number
      currentStreak: number
      longestStreak: number
      level: number
      rank: number
      streakDays?: string[]
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
  const [isPublicGratitude, setIsPublicGratitude] = useState(false)
  const [smartSuggestion, setSmartSuggestion] = useState("")

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

  // Update smart suggestion when mood changes
  useEffect(() => {
    if (selectedMood && MOOD_SUGGESTIONS[selectedMood]) {
      const suggestions = MOOD_SUGGESTIONS[selectedMood]
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
      setSmartSuggestion(randomSuggestion)
    } else {
      setSmartSuggestion("")
    }
  }, [selectedMood])

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const [stats, checkIns] = await Promise.all([
        HybridCommunityService.getUserStats(userId),
        HybridCommunityService.getRecentCheckIns(userId, 5),
      ])

      // Calculate split points
      const enhancedStats = {
        ...stats,
        selfCarePoints: Math.floor((stats?.totalPoints || 0) * 0.8), // 80% from check-ins
        careObjectivePoints: Math.floor((stats?.totalPoints || 0) * 0.2), // 20% from objectives
      }

      setUserStats(enhancedStats)
      setRecentCheckIns(checkIns)
      setCanCheckIn(true)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  // Load leaderboard with enhanced data
  const loadLeaderboard = async () => {
    try {
      const data = await HybridCommunityService.getLeaderboard(100)

      // Enhance leaderboard data with split points and streak calendar
      const enhancedLeaderboard = data.map((entry) => ({
        ...entry,
        selfCarePoints: Math.floor(entry.totalPoints * 0.8),
        careObjectivePoints: Math.floor(entry.totalPoints * 0.2),
        streakDays: generateStreakDays(entry.currentStreak), // Generate mock streak days
      }))

      setLeaderboard(enhancedLeaderboard)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
  }

  // Generate mock streak days for calendar display
  const generateStreakDays = (streakLength: number): string[] => {
    const days = []
    const today = new Date()

    for (let i = 0; i < streakLength; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push(date.toISOString().split("T")[0])
    }

    return days
  }

  // Check-in handler with public gratitude option
  const handleCheckIn = async () => {
    if (!user || !selectedMood) return

    setIsLoading(true)
    try {
      const result = await HybridCommunityService.recordCheckIn(
        user.id,
        user.walletAddress,
        selectedMood,
        gratitudeNote || undefined,
        isPublicGratitude,
      )

      if (result.success) {
        toast({
          title: "Check-in recorded! 🎉",
          description: `You earned ${result.points} CARE points!`,
        })

        // Reset form
        setSelectedMood(null)
        setGratitudeNote("")
        setIsPublicGratitude(false)
        setSmartSuggestion("")

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

        {/* Enhanced Points Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{userStats?.totalPoints || 0} Total CARE</span>
              <Badge variant="secondary" className="text-xs">
                {userStats?.selfCarePoints || 0} Self + {userStats?.careObjectivePoints || 0} Objective
              </Badge>
            </div>
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
              <span className="text-xs">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex flex-col gap-1 h-12">
              <Compass className="h-4 w-4" />
              <span className="text-xs">Steps</span>
            </TabsTrigger>
            <TabsTrigger value="my-care" className="flex flex-col gap-1 h-12">
              <User className="h-4 w-4" />
              <span className="text-xs">My CARE</span>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Check-in Tab */}
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
                    {/* Smaller Emoji Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm">How are you feeling?</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(MOOD_EMOJIS).map(([emoji, { value, label }]) => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedMood(emoji as keyof typeof MOOD_EMOJIS)}
                            className={`aspect-square text-2xl p-2 rounded-xl transition-all hover:scale-105 ${
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

                    {/* Smart Suggestion */}
                    {smartSuggestion && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-2">💡 Reflection Prompt:</p>
                        <p className="text-sm text-blue-700">{smartSuggestion}</p>
                      </div>
                    )}

                    {/* Enhanced Gratitude Note with Privacy Toggle */}
                    <div className="space-y-3">
                      <Label htmlFor="gratitude" className="text-sm">
                        Share your thoughts <span className="text-green-600">(+5 points)</span>
                      </Label>
                      <Textarea
                        id="gratitude"
                        placeholder={smartSuggestion || "I'm grateful for..."}
                        value={gratitudeNote}
                        onChange={(e) => setGratitudeNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />

                      {/* Privacy Toggle */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="public-gratitude"
                          checked={isPublicGratitude}
                          onCheckedChange={setIsPublicGratitude}
                        />
                        <Label htmlFor="public-gratitude" className="text-sm text-muted-foreground">
                          Make this reflection public to inspire others
                        </Label>
                      </div>
                    </div>

                    {/* Points Preview */}
                    {selectedMood && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          You'll earn: {10 + (gratitudeNote ? 5 : 0)} SelfCARE points
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
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            +{checkIn.finalPoints}
                          </Badge>
                          {checkIn.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhanced Leaderboard Tab */}
          <TabsContent value="community" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  CARE Community Leaderboard
                </CardTitle>
                <CardDescription className="text-sm">
                  SelfCARE (check-ins) + CARE Objectives = Total CARE Points
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                      <div
                        key={entry.userId}
                        className={`p-3 rounded-lg border ${
                          entry.userId === user.id ? "bg-green-100 border-green-200" : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
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
                            <p className="font-bold text-sm">{entry.totalPoints} Total</p>
                            <div className="text-xs text-muted-foreground">
                              <span className="text-green-600">{entry.selfCarePoints} Self</span>
                              {" + "}
                              <span className="text-blue-600">{entry.careObjectivePoints} Obj</span>
                            </div>
                          </div>
                        </div>

                        {/* Streak Calendar Mini Display */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-xs">
                              {entry.currentStreak} day streak (longest: {entry.longestStreak})
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {entry.streakDays?.slice(0, 7).map((day, i) => (
                              <div
                                key={day}
                                className="w-2 h-2 rounded-full bg-green-400"
                                title={`Check-in on ${day}`}
                              />
                            ))}
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

          {/* Enhanced Steps Tab */}
          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Your GOOD CARE Journey
                </CardTitle>
                <CardDescription className="text-sm">Complete these steps to unlock more CARE features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Onboarding Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700 text-sm">🌱 Getting Started</h3>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle
                        className={`h-4 w-4 ${recentCheckIns.length > 0 ? "text-green-600" : "text-gray-400"}`}
                      />
                      <span className="text-sm">Complete first check-in</span>
                    </div>
                    <Badge variant={recentCheckIns.length > 0 ? "default" : "secondary"} className="text-xs">
                      {recentCheckIns.length > 0 ? "✓ Done" : "Start"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`h-4 w-4 ${user.username ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-sm">Set your username</span>
                    </div>
                    <Badge variant={user.username ? "default" : "secondary"} className="text-xs">
                      {user.username ? "✓ Done" : "Set"}
                    </Badge>
                  </div>
                </div>

                {/* Engagement Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-700 text-sm">🚀 Level Up</h3>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Visit GOOD on Avax</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://good.xyz" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gift className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Get VIP Pass NFT on Salvor</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://salvor.io" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Book Intro Call via Calendly</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://calendly.com/goodcare" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                  <p className="text-sm font-medium text-center">
                    Complete all steps to unlock exclusive CARE rewards! 🎁
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced My CARE Tab */}
          <TabsContent value="my-care" className="space-y-4">
            {/* Profile Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My CARE Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Display Name</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={user.username || "Set your display name"}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="text-sm"
                    />
                    <Button onClick={handleUpdateUsername} disabled={!newUsername} size="sm">
                      Save
                    </Button>
                  </div>
                </div>

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
              </CardContent>
            </Card>

            {/* CARE Points Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total CARE Points</CardTitle>
                <CardDescription className="text-sm">Your complete CARE contribution breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">SelfCARE Points</p>
                      <p className="text-xs text-muted-foreground">From daily check-ins</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">{userStats?.selfCarePoints || 0}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">CARE Objective Points</p>
                      <p className="text-xs text-muted-foreground">From community contributions</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{userStats?.careObjectivePoints || 0}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-200">
                    <div>
                      <p className="font-bold text-sm">Total CARE Points</p>
                      <p className="text-xs text-muted-foreground">Your complete CARE contribution</p>
                    </div>
                    <p className="text-2xl font-bold text-green-800">{userStats?.totalPoints || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Check-in Summary */}
            {recentCheckIns.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Last Check-in Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{recentCheckIns[0].emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {new Date(recentCheckIns[0].timestamp).toLocaleDateString()}
                      </p>
                      {recentCheckIns[0].gratitudeNote && (
                        <p className="text-sm text-muted-foreground mt-1">"{recentCheckIns[0].gratitudeNote}"</p>
                      )}
                    </div>
                    <Badge>+{recentCheckIns[0].finalPoints}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NFTs Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">My CARE NFTs</CardTitle>
                <CardDescription className="text-sm">Your GOOD CARE Collection achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">NFT collection coming soon!</p>
                  <p className="text-xs text-muted-foreground">
                    Earn NFTs by completing milestones and contributing to the community
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center">
                <p className="text-xl font-bold text-green-600">{userStats?.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xl font-bold text-blue-600">{userStats?.level || 1}</p>
                <p className="text-xs text-muted-foreground">CARE Level</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xl font-bold text-purple-600">{userStats?.totalCheckins || 0}</p>
                <p className="text-xs text-muted-foreground">Total Check-ins</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-xl font-bold text-orange-600">
                  {leaderboard.find((entry) => entry.userId === user.id)?.rank || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Community Rank</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
