"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"

export function TwitterLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleTwitterLogin = async () => {
    setIsLoading(true)

    try {
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
      className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
      size="lg"
    >
      <Twitter className="mr-2 h-5 w-5" />
      {isLoading ? "Connecting..." : "Continue with Twitter"}
    </Button>
  )
}
