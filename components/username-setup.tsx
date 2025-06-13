"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UsernameService } from "@/lib/username-service"
import { CheckCircle, AlertCircle, User } from "lucide-react"

interface UsernameSetupProps {
  userId: string
  currentUsername?: string
  onComplete: (username: string) => void
  onSkip?: () => void
}

export function UsernameSetup({ userId, currentUsername, onComplete, onSkip }: UsernameSetupProps) {
  const [username, setUsername] = useState(currentUsername || "")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    const available = await UsernameService.isUsernameAvailable(value)
    setIsAvailable(available)
    setIsChecking(false)
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    setIsAvailable(null)

    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async () => {
    if (!username || username.length < 3) {
      toast({
        title: "Invalid username",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      })
      return
    }

    if (isAvailable === false) {
      toast({
        title: "Username unavailable",
        description: "Please choose a different username",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const result = await UsernameService.updateUsername(userId, username)

      if (result.success) {
        toast({
          title: "Username set!",
          description: `Your username is now @${username}`,
        })
        onComplete(username)
      } else {
        toast({
          title: "Failed to set username",
          description: result.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })
    }

    setIsUpdating(false)
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
    }
    if (isAvailable === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (isAvailable === false) {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getStatusText = () => {
    if (isChecking) return "Checking availability..."
    if (isAvailable === true) return "Username available!"
    if (isAvailable === false) return "Username taken"
    return ""
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Choose Your Username</CardTitle>
        <CardDescription>Pick a unique username that represents you in the GOOD CARE community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="your_username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getStatusIcon()}</div>
          </div>
          {getStatusText() && (
            <p
              className={`text-sm ${
                isAvailable === true ? "text-green-600" : isAvailable === false ? "text-red-600" : "text-gray-600"
              }`}
            >
              {getStatusText()}
            </p>
          )}
          <p className="text-xs text-muted-foreground">3-20 characters, letters, numbers, and underscores only</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!username || isAvailable !== true || isUpdating} className="flex-1">
            {isUpdating ? "Setting username..." : "Set Username"}
          </Button>
          {onSkip && (
            <Button variant="outline" onClick={onSkip} disabled={isUpdating}>
              Skip
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
