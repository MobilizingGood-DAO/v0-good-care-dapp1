"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Calendar, Award, Heart, LogOut } from "lucide-react"
import { useRealAuth } from "@/providers/real-auth-provider"

export function UserProfileCard() {
  const { user, signOut } = useRealAuth()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to view your profile</p>
        </CardContent>
      </Card>
    )
  }

  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Wellness Warrior"
  const userAvatar = user.user_metadata?.avatar_url || "🌱"
  const joinDate = new Date(user.created_at || "").toLocaleDateString()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Profile
        </CardTitle>
        <CardDescription>Your wellness journey at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Info */}
        <div className="text-center space-y-3">
          <div className="text-4xl">
            {typeof userAvatar === "string" && userAvatar.startsWith("http") ? "🌱" : userAvatar}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{userName}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">1,850</p>
            <p className="text-xs text-muted-foreground">CARE Points</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Award className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">7</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              🔥 Week Warrior
            </Badge>
            <Badge variant="secondary" className="text-xs">
              💝 Gratitude Master
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🌱 New Member
            </Badge>
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Member since {joinDate}</span>
        </div>

        {/* Sign Out Button */}
        <Button variant="outline" onClick={signOut} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
