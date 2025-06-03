"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { RealSupabaseService, type User } from "@/lib/real-supabase-service"
import { useToast } from "@/hooks/use-toast"
import { addUserProfile } from "@/lib/user-profile"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithTwitter: () => Promise<{ success: boolean; error?: string }>
  signInWithWallet: (walletAddress: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function RealAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check initial session
    checkInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event)

      if (event === "SIGNED_IN" && session?.user) {
        await handleUserSignIn(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkInitialSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await handleUserSignIn(session.user)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error checking session:", error)
      setIsLoading(false)
    }
  }

  const handleUserSignIn = async (authUser: any) => {
    try {
      const userProfile = await RealSupabaseService.getOrCreateUser(authUser)
      setUser(userProfile)

      // Connect wallet address to user profile
      if (userProfile.wallet_address) {
        addUserProfile({
          address: userProfile.wallet_address,
          name: userProfile.username || userProfile.name || "User",
          username: userProfile.username || `user_${userProfile.id.slice(-6)}`,
          bio: userProfile.bio || undefined,
          avatar: userProfile.avatar || undefined,
        })
      }

      toast({
        title: "Welcome!",
        description: `Good to see you, ${userProfile.username || "friend"}!`,
      })
    } catch (error) {
      console.error("Error handling user sign in:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Account created!",
        description: "You can now sign in with your credentials.",
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signInWithTwitter = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // The actual sign-in will be handled by the auth state change listener
      return { success: true }
    } catch (error: any) {
      console.error("Twitter sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  const signInWithWallet = async (walletAddress: string) => {
    try {
      // Generate a valid UUID for demo user
      const demoUserId = crypto.randomUUID()

      // Create a demo user
      const demoUser = {
        id: demoUserId,
        email: `demo_${Date.now()}@goodcare.local`,
        user_metadata: {
          wallet_address: walletAddress,
          full_name: `Demo User ${walletAddress.slice(-6)}`,
        },
        app_metadata: {
          provider: "demo",
        },
      }

      const userProfile = await RealSupabaseService.getOrCreateUser(demoUser)
      setUser(userProfile)

      toast({
        title: "Demo mode activated!",
        description: "Welcome to GOOD CARE! Start tracking your wellness.",
      })

      return { success: true }
    } catch (error: any) {
      console.error("Demo login error:", error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)

      toast({
        title: "Signed out",
        description: "Come back soon!",
      })
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signUp,
        signIn,
        signInWithTwitter,
        signInWithWallet,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useRealAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useRealAuth must be used within a RealAuthProvider")
  }
  return context
}
