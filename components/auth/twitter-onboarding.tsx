"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Wallet, Twitter, CheckCircle, Loader2 } from "lucide-react"

interface TwitterOnboardingProps {
  user?: {
    username: string
    name: string
    avatar_url?: string
    wallet_address?: string
  }
}

export function TwitterOnboarding({ user }: TwitterOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    {
      id: 1,
      title: "Twitter Connected",
      description: "Your Twitter account has been successfully linked",
      icon: Twitter,
      status: "completed",
    },
    {
      id: 2,
      title: "Wallet Created",
      description: "Your embedded wallet has been generated",
      icon: Wallet,
      status: user?.wallet_address ? "completed" : "loading",
    },
    {
      id: 3,
      title: "Ready to Care",
      description: "Start your journey on the GOOD CARE Network",
      icon: CheckCircle,
      status: user?.wallet_address ? "completed" : "pending",
    },
  ]

  useEffect(() => {
    if (user?.wallet_address) {
      setCurrentStep(3)
    }
  }, [user])

  const handleContinue = () => {
    setIsLoading(true)
    window.location.href = "/dashboard"
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to GOOD CARE!</CardTitle>
          <CardDescription>
            Your account has been set up with Twitter authentication and an embedded wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Profile */}
          <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Twitter className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon
              const isCompleted = step.status === "completed"
              const isLoading = step.status === "loading"
              const isCurrent = step.id === currentStep

              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : isCurrent
                        ? "bg-blue-50 border-blue-200"
                        : "bg-muted border-muted"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-blue-500 text-white"
                          : "bg-muted-foreground text-muted"
                    }`}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
              )
            })}
          </div>

          {/* Wallet Info */}
          {user.wallet_address && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Your Embedded Wallet</h4>
              <p className="text-sm text-muted-foreground font-mono break-all">{user.wallet_address}</p>
              <p className="text-xs text-muted-foreground mt-2">
                This wallet is securely managed by AvaCloud and tied to your Twitter account
              </p>
            </div>
          )}

          {/* Continue Button */}
          <Button onClick={handleContinue} disabled={!user.wallet_address || isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
