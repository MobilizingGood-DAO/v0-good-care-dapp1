"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Wallet, Twitter, CheckCircle, ArrowRight } from "lucide-react"

interface TwitterOnboardingProps {
  user?: {
    id: string
    username: string
    name: string
    profile_image_url?: string
    wallet_address?: string
  }
}

export function TwitterOnboarding({ user }: TwitterOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (user) {
      // Simulate onboarding steps
      const timer1 = setTimeout(() => setCurrentStep(2), 1000)
      const timer2 = setTimeout(() => setCurrentStep(3), 2000)
      const timer3 = setTimeout(() => setIsComplete(true), 3000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [user])

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
            Welcome to GOOD CARE
          </CardTitle>
          <CardDescription>Connect your Twitter account to get started with your embedded wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">Loading your account...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Welcome to GOOD CARE!</CardTitle>
          <CardDescription>Your account and embedded wallet are ready</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profile_image_url || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">@{user.username}</div>
            </div>
            <Badge variant="secondary">Connected</Badge>
          </div>

          {user.wallet_address && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Embedded Wallet</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                </div>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </div>
          )}

          <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>
            Enter GOOD CARE
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Setting up your account...</CardTitle>
        <CardDescription>We're creating your embedded wallet and setting up your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.profile_image_url || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep >= 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            <span className={currentStep >= 1 ? "text-foreground" : "text-muted-foreground"}>
              Twitter account connected
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep >= 2 ? <CheckCircle className="w-4 h-4" /> : "2"}
            </div>
            <span className={currentStep >= 2 ? "text-foreground" : "text-muted-foreground"}>
              Creating embedded wallet
            </span>
            {currentStep === 2 && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep >= 3 ? <CheckCircle className="w-4 h-4" /> : "3"}
            </div>
            <span className={currentStep >= 3 ? "text-foreground" : "text-muted-foreground"}>
              Setting up your profile
            </span>
            {currentStep === 3 && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
