"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { RealSupabaseService, type User } from "@/lib/real-supabase-service"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithWallet: (walletAddress: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function RealAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session?.user) {
        await handleUserSignIn(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getInitialSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("Initial session:", session?.user?.id)

      if (session?.user) {
        await handleUserSignIn(session.user)
      }
    } catch (error) {
      console.error("Error getting initial session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSignIn = async (authUser: any) => {
    try {
      console.log("Handling user sign in:", authUser.id)
      const userProfile = await RealSupabaseService.getOrCreateUser(authUser)
      setUser(userProfile)

      toast({
        title: "Welcome!",
        description: `Good to see you, ${userProfile.username || userProfile.name || "friend"}!`,
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
      // Sign up without email confirmation for demo purposes
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirm: false, // Skip email confirmation for demo
          },
        },
      })

      if (error) throw error

      // For demo purposes, automatically confirm the user
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        })

        // Automatically sign them in
        return await signIn(email, password)
      }

      return { success: true }
    } catch (error: any) {
      console.error("Sign up error:", error)
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

      console.log("Sign in successful:", data.user?.id)
      return { success: true }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { success: false, error: error.message }
    }
  }

  const signInWithWallet = async (walletAddress: string) => {
    try {
      // Create a temporary user with wallet address
      const tempUser = {
        id: `wallet_${walletAddress.slice(-8)}`,
        email: `${walletAddress.slice(-8)}@wallet.local`,
        user_metadata: {
          wallet_address: walletAddress,
          full_name: `User ${walletAddress.slice(-6)}`,
        },
        app_metadata: {
          provider: "wallet",
        },
      }

      const userProfile = await RealSupabaseService.getOrCreateUser(tempUser)
      setUser(userProfile)

      toast({
        title: "Wallet Connected!",
        description: `Welcome, ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      })

      return { success: true }
    } catch (error: any) {
      console.error("Wallet sign in error:", error)
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

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return false

    try {
      const success = await RealSupabaseService.updateUserProfile(user.id, updates)
      if (success) {
        setUser({ ...user, ...updates })
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        })
      }
      return success
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to save your changes.",
        variant: "destructive",
      })
      return false
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
        signInWithWallet,
        signOut,
        updateProfile,
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
