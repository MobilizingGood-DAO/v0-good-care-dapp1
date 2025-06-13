"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWallet } from "@/providers/wallet-provider"
import { getUserProfile, saveUserProfile, type UserProfile } from "@/lib/user-profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export function ProfileSettings() {
  const { address } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "",
    username: "",
    bio: "",
    email: "",
  })

  // Load existing profile on mount
  useEffect(() => {
    if (address) {
      const existingProfile = getUserProfile(address)
      if (existingProfile) {
        setProfile(existingProfile)
      }
    }
  }, [address])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    setIsLoading(true)

    // Create or update profile
    const userProfile: UserProfile = {
      address,
      name: profile.name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      email: profile.email,
      createdAt: profile.createdAt || new Date().toISOString().split("T")[0],
    }

    saveUserProfile(userProfile)

    setIsLoading(false)
    setShowSuccess(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  if (!address) {
    return (
      <div className="text-center py-6">
        <p>Connect your wallet to manage your profile</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-600">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your profile has been updated successfully.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
          <AvatarFallback className="text-2xl">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Change Avatar
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Remove Avatar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              placeholder="Your Name"
              value={profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={profile.username}
              onChange={(e) => updateProfile("username", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={profile.email || ""}
            onChange={(e) => updateProfile("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself"
            value={profile.bio}
            onChange={(e) => updateProfile("bio", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Wallet Address</Label>
          <div className="p-2 bg-muted rounded-md">
            <code className="text-sm">{address}</code>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
