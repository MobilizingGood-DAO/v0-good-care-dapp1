"use client"

import { RealAuthForm } from "@/components/real-auth-form"
import { RealDailyCheckIn } from "@/components/real-daily-checkin"
import { RealLeaderboard } from "@/components/real-leaderboard"
import { WalletInfo } from "@/components/wallet-info"
import { SendForm } from "@/components/send-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRealAuth } from "@/providers/real-auth-provider"
import { useWallet } from "@/providers/wallet-provider"
import { Loader2, Heart, Users, Trophy, TrendingUp, Wallet, Send } from "lucide-react"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center space-y-4">
        <div className="text-6xl">🌱</div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-lg">Loading GOOD CARE...</span>
        </div>
      </div>
    </div>
  )
}

function UserDashboard() {
  const { user, signOut } = useRealAuth()
  const { address, isConnected, connectWallet } = useWallet()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">🌱 GOOD CARE</h1>
            <p className="text-gray-600">Welcome back, {user.username || user.name}! 👋</p>
            {user.wallet_address && (
              <p className="text-sm text-gray-500">
                Wallet: {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isConnected && (
              <Button variant="outline" onClick={connectWallet}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">CARE Points</p>
                  <p className="text-2xl font-bold">{user.care_points || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">{Math.floor((user.care_points || 0) / 100) + 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Community</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-2xl font-bold">#--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checkin">Daily Check-in</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="space-y-6">
            <RealDailyCheckIn />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <WalletInfo />
          </TabsContent>

          <TabsContent value="send" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send Tokens
                  </CardTitle>
                  <CardDescription>Send GCT or CARE tokens to other users</CardDescription>
                </CardHeader>
                <CardContent>
                  <SendForm type="token" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send NFTs
                  </CardTitle>
                  <CardDescription>Share your reflections and badges</CardDescription>
                </CardHeader>
                <CardContent>
                  <SendForm type="nft" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <RealLeaderboard />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your GOOD CARE profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-lg">{user.username || user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Wallet Address</label>
                    <p className="text-lg font-mono text-sm">
                      {user.wallet_address
                        ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                        : "Not connected"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-lg">{new Date(user.created_at || "").toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Points</label>
                    <p className="text-lg">{user.care_points || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Social Provider</label>
                    <p className="text-lg capitalize">{user.social_provider || "email"}</p>
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

export default function HomePage() {
  const { isAuthenticated, isLoading } = useRealAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <RealAuthForm />
  }

  return <UserDashboard />
}
