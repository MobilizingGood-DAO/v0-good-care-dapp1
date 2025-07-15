"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TwitterLoginButton } from "@/components/twitter-login-button"
import { Heart, Shield, Zap } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "access_denied":
          setError("Twitter access was denied. Please try again.")
          break
        case "missing_params":
          setError("Authentication failed. Please try again.")
          break
        case "missing_token_secret":
          setError("Session expired. Please try again.")
          break
        case "auth_failed":
          setError("Authentication failed. Please try again.")
          break
        default:
          setError("An error occurred during authentication.")
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">GOOD CARE</h1>
          </div>
          <p className="text-gray-600">Join the regenerative crypto experience</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in with Twitter to access your GOOD Passport and embedded wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TwitterLoginButton />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                New to GOOD CARE? Signing in will create your account automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-sm">Secure Embedded Wallet</h3>
              <p className="text-xs text-muted-foreground">Powered by AvaCloud WaaS technology</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <Zap className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-sm">Instant Access</h3>
              <p className="text-xs text-muted-foreground">One-click login with your Twitter account</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <Heart className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-sm">Care-Focused Network</h3>
              <p className="text-xs text-muted-foreground">Earn rewards for self-care and community support</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  )
}
