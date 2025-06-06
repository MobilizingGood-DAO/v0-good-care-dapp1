"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EnhancedCheckIn } from "@/components/enhanced-check-in"
import { EnhancedWallet } from "@/components/enhanced-wallet"
import { RealLeaderboard } from "@/components/real-leaderboard"
import { UsernameSetup } from "@/components/username-setup"
import { WalletService } from "@/lib/wallet-service"
import { RealLeaderboardService } from "@/lib/real-leaderboard-service"
import { UsernameService } from "@/lib/username-service"
import { Users, Wallet, CheckCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

// Add imports
import { SupabaseAuthService, type AuthUser } from "@/lib/supabase-auth-service"

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [userRank, setUserRank] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [demoWallet, setDemoWallet] = useState<any>(null)
  const [needsUsername, setNeedsUsername] = useState(false)
  const [showUsernameSetup, setShowUsernameSetup] = useState(false)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Get current authenticated user
      const user = await SupabaseAuthService.getCurrentUser()
      setAuthUser(user)

      if (user) {
        await initializeDashboard(user)
        await checkUsernameStatus(user.id)
      }
    } catch (error) {
      console.error("Error initializing auth:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkUsernameStatus = async (userId: string) => {
    try {
      const profile = await UsernameService.getUserProfile(userId)
      if (!profile?.username || profile.username.startsWith("user_")) {
        setNeedsUsername(true)
        setShowUsernameSetup(true)
      }
    } catch (error) {
      console.error("Error checking username status:", error)
    }
  }

  const initializeDashboard = async (user: AuthUser) => {
    try {
      // Generate wallet for user
      const wallet = WalletService.generateDemoWallet(user.id)
      setDemoWallet(wallet)

      // Load user rank
      const userRankData = await RealLeaderboardService.getUserRankAndNearby(user.id, 3)
      setUserRank(userRankData.userRank)
    } catch (error) {
      console.error("Error initializing dashboard:", error)
    }
  }

  const handleUsernameComplete = (username: string) => {
    setShowUsernameSetup(false)
    setNeedsUsername(false)
    if (authUser) {
      setAuthUser({ ...authUser, username })
    }
  }

  const handleUsernameSkip = () => {
    setShowUsernameSetup(false)
    // Don't set needsUsername to false, so we can show the prompt again later
  }

  // Add loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Add auth check
  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to access the dashboard</p>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show username setup if needed
  if (showUsernameSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <UsernameSetup
          userId={authUser.id}
          currentUsername={authUser.username}
          onComplete={handleUsernameComplete}
          onSkip={handleUsernameSkip}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, @{authUser.username || "User"}!</h1>
          <p className="text-muted-foreground">Ready to continue your wellness journey?</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Rank #{userRank || "Unranked"}
          </Badge>
          {needsUsername && (
            <Button variant="outline" size="sm" onClick={() => setShowUsernameSetup(true)}>
              Set Username
            </Button>
          )}
        </div>
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
          <EnhancedCheckIn />
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
          <RealLeaderboard currentUserId={authUser.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
