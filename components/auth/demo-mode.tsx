"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User, Sparkles, AlertCircle } from "lucide-react"
import type { AuthUser } from "@/lib/enhanced-auth-service"

interface DemoModeProps {
  onAuthComplete: (user: AuthUser) => void
}

export function DemoMode({ onAuthComplete }: DemoModeProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDemoLogin = async () => {
    if (!username.trim() || username.length < 3) {
      toast({
        title: "Username Required",
        description: "Please enter a username (at least 3 characters)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const demoUser: AuthUser = {
      id: `demo_${Date.now()}`,
      username: username.trim(),
      walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      authMethod: "wallet",
      avatar: "🌟",
      isNewUser: true,
    }

    toast({
      title: "Welcome to GOOD CARE! 🎉",
      description: "You're now in demo mode. Your progress will be saved locally.",
    })

    onAuthComplete(demoUser)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🚀</div>
        <CardTitle>Try Demo Mode</CardTitle>
        <CardDescription>
          Experience GOOD CARE without creating an account. Your progress will be saved locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-blue-600">Demo mode - data saved locally only</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-username">Choose a Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="demo-username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              maxLength={20}
              onKeyPress={(e) => e.key === "Enter" && handleDemoLogin()}
            />
          </div>
          <p className="text-xs text-muted-foreground">3-20 characters. This will be used for your local profile.</p>
        </div>

        <Button
          onClick={handleDemoLogin}
          disabled={isLoading || !username.trim() || username.length < 3}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isLoading ? <Sparkles className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Start Demo
        </Button>
      </CardContent>
    </Card>
  )
}
