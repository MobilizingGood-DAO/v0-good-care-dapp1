"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealAuthProvider, useAuth } from "@/providers/real-auth-provider"
import { WalletProvider } from "@/providers/wallet-provider"
import { RealAuthForm } from "@/components/real-auth-form"
import { RealDailyCheckin } from "@/components/real-daily-checkin"
import { RealLeaderboard } from "@/components/real-leaderboard"
import { UserProfileCard } from "@/components/user-profile-card"
import { WalletInfo } from "@/components/wallet-info"
import { SendForm } from "@/components/send-form"
import { Heart, Users, Wallet, Send, User } from "lucide-react"

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your GOOD Passport...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GOOD Passport</h1>
            <p className="text-gray-600">Your gateway to the GOOD CARE ecosystem</p>
          </div>
          <RealAuthForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.name || user.email?.split("@")[0] || "Friend"}! 👋
          </h1>
          <p className="text-gray-600">Track your wellness journey and earn CARE Points</p>
        </div>

        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checkin" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkin">
            <RealDailyCheckin />
          </TabsContent>

          <TabsContent value="leaderboard">
            <RealLeaderboard />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletInfo />
          </TabsContent>

          <TabsContent value="send">
            <div className="max-w-md mx-auto">
              <SendForm type="token" />
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-md mx-auto">
              <UserProfileCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <RealAuthProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </RealAuthProvider>
  )
}
