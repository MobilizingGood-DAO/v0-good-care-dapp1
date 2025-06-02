"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Sparkles, Heart, Trophy, AlertCircle } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await AuthService.signInWithGoogle()

      if (!result.success) {
        setError(result.error || "Failed to login with Google")
        toast({
          title: "Login Failed",
          description: result.error || "Failed to login with Google",
          variant: "destructive",
        })
      }
      // No need to handle success case as it will redirect to Google
    } catch (error) {
      console.error("Google login error:", error)
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

        <div className="space-y-3">
          <Button onClick={handleGoogleLogin} disabled={isLoading} variant="outline" className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Continue with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
