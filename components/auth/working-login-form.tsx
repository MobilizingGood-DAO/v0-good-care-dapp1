"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, User, Heart, Trophy, Sparkles, AlertCircle, Play } from "lucide-react"
import { SimpleAuthService } from "@/lib/simple-auth-service"
import { useRouter } from "next/navigation"

interface WorkingLoginFormProps {
  onAuthComplete?: (user: any) => void
}

export function WorkingLoginForm({ onAuthComplete }: WorkingLoginFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await SimpleAuthService.signInWithEmail(email, password)

      if (result.success && result.user) {
        if (result.requiresUsername) {
          // Redirect to onboarding
          router.push("/onboarding")
        } else {
          toast({
            title: "Welcome back! 🎉",
            description: "You've successfully signed in",
          })
          if (onAuthComplete) {
            onAuthComplete(result.user)
          } else {
            router.push("/dashboard")
          }
        }
      } else {
        setError(result.error || "Failed to sign in")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await SimpleAuthService.signUpWithEmail(email, password)

      if (result.success) {
        toast({
          title: "Account created! 🎉",
          description: "Please check your email to verify your account",
        })
        // Redirect to onboarding
        router.push("/onboarding")
      } else {
        setError(result.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Sign up error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await SimpleAuthService.signInWithDemo()

      if (result.success && result.user) {
        toast({
          title: "Welcome to Demo Mode! 🚀",
          description: "Explore GOOD CARE with full functionality",
        })
        if (onAuthComplete) {
          onAuthComplete(result.user)
        } else {
          router.push("/dashboard")
        }
      } else {
        setError("Failed to start demo mode")
      }
    } catch (error) {
      console.error("Demo mode error:", error)
      setError("Failed to start demo mode")
    } finally {
      setIsLoading(false)
    }
  }

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
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Try GOOD CARE instantly with full functionality. No account required!
              </p>
              <Button
                onClick={handleDemoMode}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Start Demo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleEmailSignIn()}
              />
            </div>
            <Button onClick={handleEmailSignIn} disabled={isLoading} variant="outline" className="w-full" size="lg">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Sign In
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleEmailSignUp()}
              />
            </div>
            <Button
              onClick={handleEmailSignUp}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <User className="h-4 w-4 mr-2" />}
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
