"use client"

import { Suspense } from "react"
import { EnhancedDailyCheckIn } from "@/components/check-in/enhanced-daily-check-in"
import { CareLeaderboard } from "@/components/care-leaderboard"
import { UserProfileCard } from "@/components/user-profile-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRealAuth } from "@/providers/real-auth-provider"
import { RealAuthForm } from "@/components/real-auth-form"

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

function DashboardContent() {
  const { user, isLoading } = useRealAuth()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <RealAuthForm />
        </div>
      </div>
    )
  }

  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Friend"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground">
          Take a moment each day to reflect, grow, and earn CARE Points for your mental health journey
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Daily Check-in */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <EnhancedDailyCheckIn />
          </Suspense>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Today's Goal</CardDescription>
                <CardTitle className="text-2xl">Daily Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Complete your check-in to maintain your streak</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Community</CardDescription>
                <CardTitle className="text-2xl">Growing Together</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Join others on their wellness journey</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resources</CardDescription>
                <CardTitle className="text-2xl">Mental Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Curated tools and support for your wellbeing</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Profile & Leaderboard */}
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <UserProfileCard />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[500px]" />}>
            <CareLeaderboard />
          </Suspense>
        </div>
      </div>

      {/* Bottom Section - Coming Soon */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🚀 Coming Soon</CardTitle>
          <CardDescription>Exciting features we're building for the GOOD CARE community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-medium">NFT Reflections</h4>
              <p className="text-sm text-muted-foreground">Mint your daily reflections as unique NFTs</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-medium">Achievement Badges</h4>
              <p className="text-sm text-muted-foreground">Earn special badges for milestones</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-medium">Peer Support</h4>
              <p className="text-sm text-muted-foreground">Connect with wellness buddies</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-medium">Resource Library</h4>
              <p className="text-sm text-muted-foreground">Curated mental health resources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
