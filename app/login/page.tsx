"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TwitterLoginButton } from "@/components/twitter-login-button"
import { TwitterOnboarding } from "@/components/auth/twitter-onboarding"
import { Heart, AlertCircle } from "lucide-react"

function LoginContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "twitter_oauth_failed":
          setError("Failed to connect to Twitter. Please try again.")
          break
        case "twitter_denied":
          setError("Twitter authorization was denied. Please try again to continue.")
          break
        case "missing_oauth_params":
          setError("Invalid Twitter response. Please try again.")
          break
        case "missing_token_secret":
          setError("Session expired. Please try again.")
          break
        case "twitter_callback_failed":
          setError("Failed to complete Twitter login. Please try again.")
          break
        default:
          setError("An error occurred during login. Please try again.")
      }
    }

    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    checkSession()
  }, [searchParams])

  if (user) {
    return <TwitterOnboarding user={user} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GOOD CARE</h1>
          <p className="text-gray-600">Your journey to better mental health starts here</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in with Twitter to access your embedded wallet and continue your care journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TwitterLoginButton />

            <div className="text-center text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>New to GOOD CARE? Your account will be created automatically.</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
