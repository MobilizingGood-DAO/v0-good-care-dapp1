"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"

interface TwitterLoginButtonProps {
  className?: string
}

export function TwitterLoginButton({ className }: TwitterLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTwitterLogin = async () => {
    try {
      setIsLoading(true)
      console.log("Initiating Twitter login...")

      // Redirect to Twitter OAuth endpoint
      window.location.href = "/api/auth/twitter"
    } catch (error) {
      console.error("Error initiating Twitter login:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTwitterLogin}
      disabled={isLoading}
      className={`w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white ${className}`}
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Twitter className="w-5 h-5" />
          <span>Continue with Twitter</span>
        </div>
      )}
    </Button>
  )
}
