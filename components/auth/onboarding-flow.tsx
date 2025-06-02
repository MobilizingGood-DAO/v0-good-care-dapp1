"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Twitter, Wallet, User, Sparkles, Heart, Trophy, AlertCircle, WifiOff } from "lucide-react"
import { EnhancedAuthService, type AuthUser } from "@/lib/enhanced-auth-service"
import { useWallet } from "@/providers/wallet-provider"

interface OnboardingFlowProps {
  onAuthComplete: (user: AuthUser) => void
}

export function OnboardingFlow({ onAuthComplete }: OnboardingFlowProps) {
  const { connectWallet, address } = useWallet()
  const { toast } = useToast()

  const [step, setStep] = useState<"welcome" | "auth" | "username">("welcome")
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null)
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  const authService = new EnhancedAuthService()

  // Handle social login
  const handleSocialLogin = async (provider: "google" | "twitter") => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authService.loginWithSocial(provider)

      if (result.success && result.user) {
        setIsOffline(result.isOffline || false)

        if (result.requiresUsername) {
          setPendingUser(result.user)
          setStep("username")
          toast({
            title: "Almost there! 🎉",
            description: result.isOffline
              ? "Please choose a username. Working offline - data saved locally."
              : "Please choose a username to complete your account setup.",
          })
        } else {
          toast({
            title: "Welcome back! 👋",
            description: result.isOffline
              ? `Logged in with ${provider} (offline mode)`
              : `Logged in successfully with ${provider}`,
          })
          onAuthComplete(result.user)
        }
      } else {
        setError(result.error || "Failed to login with social provider")
        toast({
          title: "Login Failed",
          description: result.error || "Failed to login with social provider",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Social login error:", error)
      setError("Something went wrong. Please try again.")
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle wallet connection
  const handleWalletConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let walletAddress = address

      // If no address, generate a mock one for demo
      if (!walletAddress) {
        walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`
        toast({
          title: "Demo Wallet Connected",
          description: "Using a demo wallet address for testing",
        })
      }

      const result = await authService.connectWallet(walletAddress)

      if (result.success && result.user) {
        setIsOffline(result.isOffline || false)

        if (result.requiresUsername) {
          setPendingUser(result.user)
          setStep("username")
          toast({
            title: "Wallet Connected! 🎉",
            description: result.isOffline
              ? "Please choose a username. Working offline - data saved locally."
              : "Please choose a username to complete your account setup.",
          })
        } else {
          toast({
            title: "Welcome back! 👋",
            description: result.isOffline ? "Wallet connected (offline mode)" : "Wallet connected successfully",
          })
          onAuthComplete(result.user)
        }
      } else {
        setError(result.error || "Failed to connect wallet")
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect wallet",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      setError("Failed to connect wallet. Please try again.")
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle username submission
  const handleUsernameSubmit = async () => {
    if (!pendingUser || !username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to continue",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await authService.completeRegistration(pendingUser, username.trim())

      if (result.success && result.user) {
        toast({
          title: "Welcome to GOOD CARE! 🎉",
          description: result.isOffline
            ? "Account created successfully (offline mode)"
            : "Your account has been created successfully",
        })
        onAuthComplete(result.user)
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
      setIsLoading(false)
    }
  }

  if (step === "welcome") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <CardTitle className="text-2xl">Welcome to GOOD CARE</CardTitle>
          <CardDescription>
            Your daily wellness companion. Track your mood, earn CARE Points, and join a supportive community.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Daily Reflections</p>
                <p className="text-xs text-muted-foreground">Check in with your mood and feelings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Earn CARE Points</p>
                <p className="text-xs text-muted-foreground">Build streaks and level up your wellness</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Community Support</p>
                <p className="text-xs text-muted-foreground">Connect with others on their journey</p>
              </div>
            </div>
          </div>

          <Button onClick={() => setStep("auth")} className="w-full" size="lg">
            Get Started
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "auth") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Choose Your Login Method</CardTitle>
          <CardDescription>How would you like to access your GOOD CARE account?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isOffline && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-600">Working offline - data saved locally</p>
            </div>
          )}

          {/* Social Login Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Quick & Easy (Embedded Wallet)</p>
            <Button
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Continue with Google
            </Button>
            <Button
              onClick={() => handleSocialLogin("twitter")}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Twitter className="h-4 w-4 mr-2" />}
              Continue with Twitter
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Use Your Own Wallet</p>
            <Button
              onClick={handleWalletConnect}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wallet className="h-4 w-4 mr-2" />}
              Connect Wallet
            </Button>
          </div>

          <Button variant="ghost" onClick={() => setStep("welcome")} className="w-full">
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "username") {
    return (
      <Card className="w-full max-w-md mx-auto">
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

          {isOffline && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <WifiOff className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-600">Offline mode - your data will be saved locally</p>
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
                {pendingUser.authMethod === "social" ? `${pendingUser.socialProvider} account` : "External wallet"} •{" "}
                {pendingUser.walletAddress.slice(0, 6)}...{pendingUser.walletAddress.slice(-4)}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleUsernameSubmit}
              disabled={isLoading || !username.trim() || username.length < 3}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Create Account
            </Button>
            <Button variant="ghost" onClick={() => setStep("auth")} className="w-full">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
