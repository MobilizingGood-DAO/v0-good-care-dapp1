"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TwitterLoginButton } from "@/components/twitter-login-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Wallet, Twitter, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface TwitterOnboardingProps {
  onComplete?: (user: any) => void
}

export function TwitterOnboarding({ onComplete }: TwitterOnboardingProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error from callback
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "access_denied":
          setError("You denied access to Twitter. Please try again to continue.")
          break
        case "invalid_request":
          setError("Invalid request. Please try again.")
          break
        case "invalid_state":
          setError("Security error. Please try again.")
          break
        case "auth_failed":
          setError("Authentication failed. Please try again.")
          break
        case "server_error":
          setError("Server error. Please try again later.")
          break
        default:
          setError("An error occurred during authentication. Please try again.")
      }
    }
  }, [searchParams])

  const handleTwitterSuccess = (user: any) => {
    console.log("Twitter login successful:", user)
    onComplete?.(user)
  }

  const handleTwitterError = (error: string) => {
    setError(error)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">🌱</div>
        <CardTitle className="text-2xl">Welcome to GOOD CARE</CardTitle>
        <CardDescription>
          Connect with Twitter to create your embedded wallet and start your wellness journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Benefits */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Twitter className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-sm">Twitter Integration</p>
              <p className="text-xs text-muted-foreground">Login with your Twitter account</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Wallet className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Embedded Wallet</p>
              <p className="text-xs text-muted-foreground">Automatic wallet creation via AvaCloud</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-sm">GOOD CARE Network</p>
              <p className="text-xs text-muted-foreground">Join the wellness community</p>
            </div>
          </div>
        </div>

        {/* Twitter Login */}
        <div className="space-y-4">
          <TwitterLoginButton onSuccess={handleTwitterSuccess} onError={handleTwitterError} disabled={isLoading} />

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to create an embedded wallet and join the GOOD CARE community
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">How it works:</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Connect your Twitter account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>AvaCloud creates your embedded wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Start earning CARE points and NFTs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
