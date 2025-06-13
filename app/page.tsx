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
  Wallet,
  ExternalLink,
  Copy,
  Download,
  RefreshCw,
  Send,
  Clock,
  Flame,
  Star,
  Calendar,
  User,
} from "lucide-react"
import { AuthService, type User as AuthUser } from "@/lib/auth-service"
import { CheckInService, MOOD_EMOJIS, type UserStats, type CheckIn } from "@/lib/checkin-service"
import { getTokenBalances, sendTransaction, exportPrivateKey } from "@/lib/avacloud-waas"
import { switchToGoodCareNetwork } from "@/lib/blockchain-config"

export default function GoodCareApp() {
  const { toast } = useToast()
  const [user, setUser] = useState<AuthUser | null>(null)
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
  const [tokenBalances, setTokenBalances] = useState<
    Array<{
      symbol: string
      name: string
      balance: string
      decimals: number
      contractAddress?: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [canCheckIn, setCanCheckIn] = useState(true)
  const [nextCheckIn, setNextCheckIn] = useState<Date | null>(null)

  // Authentication states
  const [email, setEmail] = useState("")
  const [newUsername, setNewUsername] = useState("")

  // Check-in states
  const [selectedMood, setSelectedMood] = useState<keyof typeof MOOD_EMOJIS | null>(null)
  const [gratitudeNote, setGratitudeNote] = useState("")

  // Send tokens states
  const [sendTo, setSendTo] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [sendToken, setSendToken] = useState("CARE")

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const [stats, checkIns, eligibility] = await Promise.all([
        CheckInService.getUserStats(userId),
        CheckInService.getRecentCheckIns(userId, 5),
        CheckInService.canCheckIn(userId),
      ])

      setUserStats(stats)
      setRecentCheckIns(checkIns)
      setCanCheckIn(eligibility.canCheckIn)
      setNextCheckIn(eligibility.nextCheckIn || null)

      // Load token balances
      if (user?.walletAddress) {
        const balances = await getTokenBalances(user.walletAddress)
        setTokenBalances(balances)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const data = await CheckInService.getLeaderboard(100)
      setLeaderboard(data)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
  }

  useEffect(() => {
    if (user) {
      loadUserData(user.id)
    }
    loadLeaderboard()
  }, [user])

  // Authentication handlers
  const handleEmailSignIn = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      const result = await AuthService.signInWithEmail(email)
      if (result.success && result.user) {
        setUser(result.user)
        toast({
          title: "Welcome to GOOD CARE!",
          description: "Your embedded wallet has been created.",
        })
      } else {
        toast({
          title: "Sign in failed",
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

  const handleSocialSignIn = async (provider: "twitter" | "google") => {
    setIsLoading(true)
    try {
      const result = await AuthService.signInWithSocial(provider)
      if (result.success && result.user) {
        setUser(result.user)
        toast({
          title: "Welcome to GOOD CARE!",
          description: `Signed in with ${provider}. Your embedded wallet has been created.`,
        })
      } else {
        toast({
          title: "Sign in failed",
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

  const handleWalletConnect = async () => {
    setIsLoading(true)
    try {
      // Switch to GOOD CARE network first
      await switchToGoodCareNetwork()

      const result = await AuthService.connectWallet()
      if (result.success && result.user) {
        setUser(result.user)
        toast({
          title: "Wallet connected!",
          description: "Welcome to GOOD CARE Network.",
        })
      } else {
        toast({
          title: "Connection failed",
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

  // Check-in handler
  const handleCheckIn = async () => {
    if (!user || !selectedMood) return

    setIsLoading(true)
    try {
      const result = await CheckInService.recordCheckIn(user.id, selectedMood, gratitudeNote || undefined)

      if (result.success) {
        toast({
          title: "Check-in recorded!",
          description: `You earned ${result.checkIn?.finalPoints} CARE points!`,
        })

        // Reset form
        setSelectedMood(null)
        setGratitudeNote("")

        // Reload user data
        await loadUserData(user.id)
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

    setIsLoading(true)
    try {
      const result = await AuthService.updateUsername(user.id, newUsername)
      if (result.success) {
        setUser({ ...user, username: newUsername })
        setNewUsername("")
        toast({
          title: "Username updated!",
          description: "Your username has been saved.",
        })
      } else {
        toast({
          title: "Update failed",
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

  // Export wallet handler
  const handleExportWallet = async () => {
    if (!user || user.walletType !== "embedded" || !user.walletId) {
      toast({
        title: "Cannot export",
        description: "Only embedded wallets can be exported",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await exportPrivateKey(user.walletId)
      if (result.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.privateKey)
        toast({
          title: "Private key exported!",
          description: "Private key copied to clipboard. Keep it safe!",
        })
      } else {
        toast({
          title: "Export failed",
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

  // Send tokens handler
  const handleSendTokens = async () => {
    if (!user || !sendTo || !sendAmount) return

    setIsLoading(true)
    try {
      const tokenAddress = sendToken === "GCT" ? "0x10acd62bdfa7028b0A96710a9f6406446D2b1164" : undefined

      const result = await sendTransaction({
        from: user.walletAddress,
        to: sendTo,
        value: sendAmount,
        tokenAddress,
      })

      if (result.success) {
        toast({
          title: "Transaction sent!",
          description: `Sent ${sendAmount} ${sendToken} to ${sendTo}`,
        })

        // Reset form
        setSendTo("")
        setSendAmount("")

        // Reload balances
        const balances = await getTokenBalances(user.walletAddress)
        setTokenBalances(balances)
      } else {
        toast({
          title: "Transaction failed",
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

  // Copy address handler
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  // If not authenticated, show login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <CardTitle className="text-2xl">Welcome to GOOD CARE</CardTitle>
            <CardDescription>Your daily wellness companion on the GOOD CARE Network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Sign In */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleEmailSignIn} disabled={isLoading || !email} className="w-full">
                {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
                Sign in with Email
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Social Sign In */}
            <div className="space-y-2">
              <Button
                onClick={() => handleSocialSignIn("google")}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Sign in with Google
              </Button>
              <Button
                onClick={() => handleSocialSignIn("twitter")}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Sign in with Twitter
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or connect existing wallet</span>
              </div>
            </div>

            {/* Wallet Connect */}
            <Button onClick={handleWalletConnect} disabled={isLoading} variant="outline" className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              By signing in, you agree to join the GOOD CARE Network on subnet 741741
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main app with 4 tabs
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-800 mb-2">🌱 GOOD CARE Network</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.username || `User_${user.walletAddress.slice(-6)}`}!
          </p>
          <Badge variant="outline" className="mt-2">
            {userStats?.level ? `Level ${userStats.level}` : "Level 1"} • {userStats?.totalPoints || 0} CARE Points
          </Badge>
        </div>

        <Tabs defaultValue="next-steps" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="next-steps" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Next Steps
            </TabsTrigger>
            <TabsTrigger value="check-in" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Daily Check-in
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              CARE Community
            </TabsTrigger>
            <TabsTrigger value="my-care" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My CARE
            </TabsTrigger>
          </TabsList>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Your GOOD CARE Journey
                </CardTitle>
                <CardDescription>Start your wellness journey with these guided steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Beginner Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700">🌱 Beginner (Getting Started)</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Complete your first daily check-in</span>
                      <Badge variant={recentCheckIns.length > 0 ? "default" : "secondary"}>
                        {recentCheckIns.length > 0 ? "✓ Done" : "Start"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Set your username</span>
                      <Badge variant={user.username ? "default" : "secondary"}>
                        {user.username ? "✓ Done" : "Set"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Follow @goodonavax on Twitter</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://twitter.com/goodonavax" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Intermediate Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-700">🚀 Intermediate (Building Habits)</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Maintain a 3-day check-in streak</span>
                      <Badge variant={(userStats?.currentStreak || 0) >= 3 ? "default" : "secondary"}>
                        {(userStats?.currentStreak || 0) >= 3 ? "✓ Done" : `${userStats?.currentStreak || 0}/3`}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Explore NFT gallery on Salvor</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://salvor.io" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Try trading on Apex Exchange</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://apex.exchange" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Advanced Steps */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-purple-700">⭐ Advanced (Community Leader)</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span>Reach Level 5 (500+ CARE points)</span>
                      <Badge variant={(userStats?.level || 1) >= 5 ? "default" : "secondary"}>
                        {(userStats?.level || 1) >= 5 ? "✓ Done" : `Level ${userStats?.level || 1}`}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span>Schedule a community call</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://calendly.com/goodcareavax/30min" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span>Learn about GOOD CARE Network</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.goodonavax.info" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Check-in Tab */}
          <TabsContent value="check-in" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Daily Check-in
                </CardTitle>
                <CardDescription>How are you feeling today? Earn CARE points for checking in!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canCheckIn && nextCheckIn ? (
                  <div className="text-center p-6 bg-yellow-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="font-medium">You've already checked in!</p>
                    <p className="text-sm text-muted-foreground">
                      Next check-in available at {nextCheckIn.toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mood Selection */}
                    <div className="space-y-3">
                      <Label>How are you feeling right now?</Label>
                      <div className="flex justify-center gap-4">
                        {Object.entries(MOOD_EMOJIS).map(([emoji, { value, label }]) => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedMood(emoji as keyof typeof MOOD_EMOJIS)}
                            className={`text-4xl p-3 rounded-lg transition-all hover:scale-110 ${
                              selectedMood === emoji ? "bg-green-100 ring-2 ring-green-500" : "hover:bg-gray-100"
                            }`}
                            title={label}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {selectedMood && (
                        <p className="text-center text-sm text-muted-foreground">{MOOD_EMOJIS[selectedMood].label}</p>
                      )}
                    </div>

                    {/* Gratitude Note */}
                    <div className="space-y-2">
                      <Label htmlFor="gratitude">What are you grateful for today? (Optional +5 points)</Label>
                      <Textarea
                        id="gratitude"
                        placeholder="I'm grateful for..."
                        value={gratitudeNote}
                        onChange={(e) => setGratitudeNote(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Points Preview */}
                    {selectedMood && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium">Points Preview:</p>
                        <p className="text-xs text-muted-foreground">
                          Base: 10 points + {gratitudeNote ? "5 gratitude bonus" : "0 gratitude bonus"}
                          {userStats?.currentStreak && userStats.currentStreak >= 3 && (
                            <>
                              {" "}
                              × {userStats.currentStreak >= 14 ? "2.0" : userStats.currentStreak >= 7 ? "1.5" : "1.25"}{" "}
                              streak multiplier
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <Button onClick={handleCheckIn} disabled={!selectedMood || isLoading} className="w-full" size="lg">
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="mr-2 h-4 w-4" />
                      )}
                      Record Check-in
                    </Button>
                  </>
                )}

                {/* Current Streak */}
                {userStats && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Current Streak</span>
                    </div>
                    <Badge variant="secondary">{userStats.currentStreak} days</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            {recentCheckIns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Check-ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCheckIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{checkIn.emoji}</span>
                          <div>
                            <p className="font-medium">{new Date(checkIn.timestamp).toLocaleDateString()}</p>
                            {checkIn.gratitudeNote && (
                              <p className="text-sm text-muted-foreground">"{checkIn.gratitudeNote}"</p>
                            )}
                          </div>
                        </div>
                        <Badge>+{checkIn.finalPoints} points</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CARE Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  CARE Community Leaderboard
                </CardTitle>
                <CardDescription>Top 100 community members by CARE points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.userId === user.id ? "bg-green-100 border border-green-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                          <span className="text-sm font-bold">
                            {entry.rank <= 3 ? (entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉") : entry.rank}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{entry.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.totalPoints} points</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Level {entry.level}</span>
                          {entry.currentStreak > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {entry.currentStreak}🔥
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My CARE Tab */}
          <TabsContent value="my-care" className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Wallet Address</Label>
                    <div className="flex items-center gap-2">
                      <Input value={`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`} readOnly />
                      <Button variant="outline" size="sm" onClick={() => copyAddress(user.walletAddress)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Wallet Type</Label>
                    <Input value={user.walletType === "embedded" ? "Embedded (Social)" : "External"} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      placeholder={user.username || "Set your username"}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <Button onClick={handleUpdateUsername} disabled={!newUsername || isLoading}>
                      Update
                    </Button>
                  </div>
                </div>

                {user.walletType === "embedded" && (
                  <Button onClick={handleExportWallet} disabled={isLoading} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export Private Key
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Your CARE Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{userStats?.totalPoints || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{userStats?.currentStreak || 0}</p>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{userStats?.level || 1}</p>
                    <p className="text-sm text-muted-foreground">Level</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{userStats?.totalCheckins || 0}</p>
                    <p className="text-sm text-muted-foreground">Check-ins</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Balances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Token Balances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {tokenBalances.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {token.name} ({token.symbol})
                        </p>
                        {token.contractAddress && (
                          <p className="text-xs text-muted-foreground">
                            {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                          </p>
                        )}
                      </div>
                      <p className="font-bold">{token.balance}</p>
                    </div>
                  ))}
                </div>

                {/* Send Tokens */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Send Tokens</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="sendTo">To Address</Label>
                      <Input
                        id="sendTo"
                        placeholder="0x..."
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sendAmount">Amount</Label>
                      <Input
                        id="sendAmount"
                        placeholder="0.0"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={sendToken === "CARE" ? "default" : "outline"}
                      onClick={() => setSendToken("CARE")}
                      size="sm"
                    >
                      CARE
                    </Button>
                    <Button
                      variant={sendToken === "GCT" ? "default" : "outline"}
                      onClick={() => setSendToken("GCT")}
                      size="sm"
                    >
                      GCT
                    </Button>
                  </div>
                  <Button onClick={handleSendTokens} disabled={!sendTo || !sendAmount || isLoading} className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send {sendToken}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
