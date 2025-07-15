"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"

export function TwitterLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleTwitterLogin = async () => {
    try {
      setIsLoading(true)
      console.log("Initiating Twitter login...")

      // Redirect to Twitter OAuth endpoint
      window.location.href = "/api/auth/twitter"
    } catch (error) {
      console.error("Twitter login error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTwitterLogin}
      disabled={isLoading}
      className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Connecting to Twitter...
        </>
      ) : (
        <>
          <Twitter className="w-5 h-5" />
          Continue with Twitter
        </>
      )}
    </Button>
  )
}
