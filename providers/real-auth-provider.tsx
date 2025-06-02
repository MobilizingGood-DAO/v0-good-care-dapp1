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
      const userProfile = await RealSupabaseService.getOrCreateUser(authUser)
      setUser(userProfile)
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
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link to complete your registration.",
        })
      }

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

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
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
      }
      return success
    } catch (error) {
      console.error("Error updating profile:", error)
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
