"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, AlertCircle } from "lucide-react"
import { AuthService, type AuthUser } from "@/lib/auth-service"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null)
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const result = await AuthService.getCurrentUser()

      if (result.success && result.user) {
        if (result.requiresUsername) {
          setPendingUser(result.user)
          setIsLoading(false)
        } else {
          // User already has a profile, redirect to dashboard
          router.push("/dashboard")
        }
      } else {
        // No authenticated user, redirect to login
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleUsernameSubmit = async () => {
    if (!pendingUser || !username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to continue",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await AuthService.completeRegistration(pendingUser, username.trim())

      if (result.success && result.user) {
        toast({
          title: "Welcome to GOOD CARE! 🎉",
          description: result.isOffline
            ? "Account created successfully (offline mode)"
            : "Your account has been created successfully",
        })
        router.push("/dashboard")
      } else {
        setError(result.error || "Failed to create account")
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Something went wrong. Please try again.")
      toast({
        title: "Registration Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">👋</div>
          <CardTitle>Choose Your Username</CardTitle>
          <CardDescription>
            This will be displayed on the community leaderboard and used to identify you in the GOOD CARE community.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                maxLength={20}
                onKeyPress={(e) => e.key === "Enter" && handleUsernameSubmit()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              3-20 characters. This will be visible to other community members.
            </p>
          </div>

          {pendingUser && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Account Details:</p>
              <p className="text-xs text-muted-foreground">
                {pendingUser.socialProvider ? `${pendingUser.socialProvider} account` : "Email account"} •{" "}
                {pendingUser.email}
              </p>
            </div>
          )}

          <Button
            onClick={handleUsernameSubmit}
            disabled={isSubmitting || !username.trim() || username.length < 3}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
