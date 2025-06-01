"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { User, Edit3, Save, X, Star, Trophy, Calendar, Heart, Sparkles } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { getUserCarePoints, type CarePointsData } from "@/lib/care-points-service"

export function UserProfileCard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [carePointsData, setCarePointsData] = useState<CarePointsData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      const data = await getUserCarePoints(user.id)
      setCarePointsData(data)

      // Load bio from localStorage for now
      const savedBio = localStorage.getItem(`bio_${user.id}`)
      setBio(savedBio || "")
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleSaveBio = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Save bio to localStorage for now
      localStorage.setItem(`bio_${user.id}`, bio)

      toast({
        title: "Profile Updated",
        description: "Your bio has been saved successfully!",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !carePointsData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  const progressToNextLevel = ((carePointsData.totalPoints % 100) / 100) * 100
  const recentCheckIns = carePointsData.checkInHistory.slice(-7).reverse()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-r from-green-400 to-emerald-600 text-white text-lg">
                {user.email?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {user.email || "Anonymous User"}
                <Badge variant="outline">Level {carePointsData.level}</Badge>
              </CardTitle>
              <CardDescription>Member since {new Date().toLocaleDateString()}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bio Section */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            About Me
          </h4>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a bit about yourself and your wellness journey..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveBio}
                  disabled={isLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    // Reset bio to saved value
                    const savedBio = localStorage.getItem(`bio_${user.id}`)
                    setBio(savedBio || "")
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{bio || "No bio added yet. Click edit to share your story!"}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{carePointsData.currentStreak} days</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Points</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{carePointsData.totalPoints}</div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Best Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{carePointsData.longestStreak} days</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Check-ins</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{carePointsData.checkInHistory.length}</div>
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Level Progress</h4>
            <span className="text-sm text-muted-foreground">
              {carePointsData.totalPoints} / {carePointsData.nextLevelPoints}
            </span>
          </div>
          <Progress value={progressToNextLevel} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {carePointsData.nextLevelPoints - carePointsData.totalPoints} points to Level {carePointsData.level + 1}
          </p>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Recent Reflections
          </h4>
          {recentCheckIns.length > 0 ? (
            <div className="space-y-2">
              {recentCheckIns.map((checkIn, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{new Date(checkIn.date).toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-xs">
                      {checkIn.mood}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium text-green-600">+{checkIn.points} points</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No reflections yet. Start your first check-in!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
