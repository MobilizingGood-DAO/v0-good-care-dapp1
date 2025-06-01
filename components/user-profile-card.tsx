"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Edit3, Save, X, Star, Trophy, Calendar, Heart } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"
import { CarePointsService, getLevelProgress } from "@/lib/care-points-service"

export function UserProfileCard() {
  const { address, isConnected } = useWallet()
  const [carePointsData, setCarePointsData] = useState({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    lastCheckIn: null as string | null,
    checkInHistory: [],
  })
  const [bio, setBio] = useState("")
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [tempBio, setTempBio] = useState("")

  useEffect(() => {
    if (isConnected && address) {
      const carePointsService = new CarePointsService(address)
      setCarePointsData(carePointsService.loadData())

      // Load bio from localStorage
      const savedBio = localStorage.getItem(`bio_${address}`) || ""
      setBio(savedBio)
      setTempBio(savedBio)
    }
  }, [isConnected, address])

  const handleSaveBio = () => {
    if (address) {
      localStorage.setItem(`bio_${address}`, tempBio)
      setBio(tempBio)
      setIsEditingBio(false)
    }
  }

  const handleCancelEdit = () => {
    setTempBio(bio)
    setIsEditingBio(false)
  }

  const levelProgress = getLevelProgress(carePointsData.totalPoints)
  const recentCheckIns = carePointsData.checkInHistory.slice(-5).reverse()

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
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">User_{address.slice(-6)}</h3>
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
                  <Button size="sm" onClick={handleSaveBio}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground min-h-[60px]">
              {bio || "Share your wellness journey, goals, or what brings you joy..."}
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
              <span className="text-2xl font-bold">{carePointsData.checkInHistory.length}</span>
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
              {recentCheckIns.map((checkIn, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
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
                    <span className="text-sm">{checkIn.date}</span>
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
