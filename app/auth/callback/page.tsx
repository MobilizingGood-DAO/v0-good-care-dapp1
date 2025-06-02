"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()

      // Get the user
      const { data: userData } = await supabase.auth.getUser()

      if (error || !userData?.user) {
        console.error("Auth callback error:", error)
        router.push("/login?error=auth-callback-failed")
        return
      }

      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      if (profileError || !profile) {
        // User needs to complete profile
        router.push("/onboarding")
      } else {
        // User already has a profile, redirect to dashboard
        router.push("/dashboard")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="mt-4 text-muted-foreground">Completing authentication...</p>
    </div>
  )
}
