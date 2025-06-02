"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { User, Edit3, Save, X, Star, Trophy, Calendar, Heart, Loader2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { SupabaseCareService, getLevelProgress, type CarePointsData } from "@/lib/supabase-care-service"

export function UserProfileCard() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()

  const [careService, setCareService] = useState<SupabaseCareService | null>(null)
  const [carePointsData, setCarePointsData] = useState<CarePointsData>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    lastCheckIn: null,
    checkInHistory: [],
    totalCheckIns: 0,
  })
  const [profile, setProfile] = useState({ username: "", bio: "", avatar: "" })
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [tempBio, setTempBio] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      initializeData()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])

  const initializeData = async () => {
    if (!address) return

    try {
      setIsLoading(true)
      const service = new SupabaseCareService(address)

      // Initialize user if needed
      await service.initializeUser(address)

      setCareService(service)

      // Load care points data
      const careData = await service.loadData()
      setCarePointsData(careData)

      // Load profile data
      const profileData = await service.getProfile()
      if (profileData) {
        setProfile({
          username: profileData.username || `User_${address.slice(-6)}`,
          bio: profileData.bio || "",
          avatar: profileData.avatar || "",
        })
        setTempBio(profileData.bio || "")
      } else {
        setProfile({
          username: `User_${address.slice(-6)}`,
          bio: "",
          avatar: "",
        })
      }
    } catch (error) {
      console.error("Error loading profile data:", error)
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBio = async () => {
    if (!careService) return

    setIsSaving(true)
    try {
      const success = await careService.updateProfile({ bio: tempBio })

      if (success) {
        setProfile((prev) => ({ ...prev, bio: tempBio }))
        setIsEditingBio(false)
        toast({
          title: "Profile updated",
          description: "Your bio has been saved successfully!",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setTempBio(profile.bio)
    setIsEditingBio(false)
  }

  const levelProgress = getLevelProgress(carePointsData.totalPoints)
  const recentCheckIns = carePointsData.checkInHistory.slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
          <CardDescription>Connect your wallet to view your profile</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-muted-foreground">Connect your wallet to access your wellness profile</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Wellness Profile
            </CardTitle>
            <CardDescription>Track your journey and share your story</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Level {carePointsData.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.avatar || address.slice(2, 4).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{profile.username}</h3>
            <p className="text-sm text-muted-foreground">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">About Me</h4>
            {!isEditingBio && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(true)} className="h-8 w-8 p-0">
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>

          {isEditingBio ? (
            <div className="space-y-3">
              <Textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                placeholder="Share your wellness journey, goals, or what brings you joy..."
                className="min-h-[100px] resize-none"
                maxLength={300}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{tempBio.length}/300 characters</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveBio} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving}>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground min-h-[60px]">
              {profile.bio || "Share your wellness journey, goals, or what brings you joy..."}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
              <Star className="h-4 w-4" />
              <span className="text-2xl font-bold">{carePointsData.totalPoints}</span>
            </div>
            <span className="text-sm text-muted-foreground">CARE Points</span>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-2xl font-bold">{carePointsData.currentStreak}</span>
            </div>
            <span className="text-sm text-muted-foreground">Day Streak</span>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-2xl font-bold">{carePointsData.longestStreak}</span>
            </div>
            <span className="text-sm text-muted-foreground">Best Streak</span>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-2xl font-bold">{carePointsData.totalCheckIns}</span>
            </div>
            <span className="text-sm text-muted-foreground">Total Check-ins</span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Level Progress</h4>
            <span className="text-sm text-muted-foreground">
              Level {levelProgress.current} → {levelProgress.next}
            </span>
          </div>
          <Progress value={levelProgress.progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(levelProgress.progress)}% to next level
          </p>
        </div>

        {/* Recent Activity */}
        {recentCheckIns.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Recent Check-ins</h4>
            <div className="space-y-2">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {checkIn.mood === 5
                        ? "😄"
                        : checkIn.mood === 4
                          ? "🙂"
                          : checkIn.mood === 3
                            ? "😐"
                            : checkIn.mood === 2
                              ? "😕"
                              : "😢"}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{checkIn.date}</span>
                      <p className="text-xs text-muted-foreground">{checkIn.moodLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-3 w-3" />
                    <span className="text-sm font-medium">+{checkIn.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
