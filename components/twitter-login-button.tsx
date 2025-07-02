"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Twitter, Loader2, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TwitterLoginButtonProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export function TwitterLoginButton({ onSuccess, onError, disabled }: TwitterLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTwitterLogin = async () => {
    try {
      setIsLoading(true)

      toast({
        title: "Connecting to Twitter...",
        description: "You'll be redirected to Twitter to authorize access",
      })

      // Redirect to Twitter OAuth
      window.location.href = "/api/auth/twitter"
    } catch (error) {
      console.error("Twitter login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to Twitter"

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTwitterLogin}
      disabled={disabled || isLoading}
      variant="outline"
      className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Twitter className="h-4 w-4 mr-2 text-blue-500" />
      )}
      <span className="flex items-center gap-2">
        Continue with Twitter
        <Wallet className="h-3 w-3 text-green-600" />
      </span>
    </Button>
  )
}
