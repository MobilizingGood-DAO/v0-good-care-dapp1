"use client"

import { useState } from "react"
import { OnboardingFlow } from "@/components/auth/onboarding-flow"
import { DemoMode } from "@/components/auth/demo-mode"
import { EnhancedDailyCheckIn } from "@/components/check-in/enhanced-daily-check-in"
import { CareLeaderboard } from "@/components/care-leaderboard"
import { UserProfileCard } from "@/components/user-profile-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AuthUser } from "@/lib/enhanced-auth-service"

export default function HomePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  const handleAuthComplete = (authUser: AuthUser) => {
    setUser(authUser)
  }

  const handleLogout = () => {
    setUser(null)
    setShowDemo(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {!showDemo ? (
            <>
              <OnboardingFlow onAuthComplete={handleAuthComplete} />
              <div className="text-center">
                <Button variant="ghost" onClick={() => setShowDemo(true)} className="text-sm text-muted-foreground">
                  Try Demo Mode Instead
                </Button>
              </div>
            </>
          ) : (
            <>
              <DemoMode onAuthComplete={handleAuthComplete} />
              <div className="text-center">
                <Button variant="ghost" onClick={() => setShowDemo(false)} className="text-sm text-muted-foreground">
                  Back to Login Options
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GOOD CARE</h1>
            <p className="text-gray-600">Welcome back, {user.username}! 👋</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checkin">Daily Check-in</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="checkin" className="space-y-6">
            <EnhancedDailyCheckIn user={user} />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CareLeaderboard currentUser={user} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <UserProfileCard user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
