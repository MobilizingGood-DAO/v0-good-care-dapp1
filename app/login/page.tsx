"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TwitterLoginButton } from "@/components/twitter-login-button"
import { TwitterOnboarding } from "@/components/auth/twitter-onboarding"
import { AlertCircle, Heart, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check for error parameters
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "access_denied":
          setError("Twitter access was denied. Please try again.")
          break
        case "invalid_request":
          setError("Invalid request. Please try again.")
          break
        case "invalid_token":
          setError("Invalid token. Please try again.")
          break
        case "oauth_error":
          setError("Authentication error. Please try again.")
          break
        default:
          setError("An error occurred during login. Please try again.")
      }
    }

    // Check if user is already logged in
    const checkSession = () => {
      try {
        const sessionCookie = document.cookie.split("; ").find((row) => row.startsWith("user_session="))

        if (sessionCookie) {
          const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split("=")[1]))
          if (sessionData.userId) {
            router.push("/dashboard")
            return
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    checkSession()
  }, [searchParams, router])

  if (showOnboarding) {
    return <TwitterOnboarding />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Heart className="w-16 h-16 text-green-600" fill="currentColor" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GOOD CARE</h1>
            <p className="text-gray-600 mt-2">Your passport to a kinder, regenerative crypto experience</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">Welcome Back</CardTitle>
            <CardDescription>Connect with Twitter to access your embedded wallet</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TwitterLoginButton />

            <div className="text-center">
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                New here? See how it works
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-1">🔒 Secure Embedded Wallets</h3>
            <p className="text-sm text-gray-600">No seed phrases to remember</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-1">💚 Earn GOOD Tokens</h3>
            <p className="text-sm text-gray-600">Daily check-ins and community care</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-1">🌟 Collect NFT Badges</h3>
            <p className="text-sm text-gray-600">Milestones and achievements</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
