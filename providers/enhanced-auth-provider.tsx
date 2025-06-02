"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { SimpleAuthService, type AuthUser } from "@/lib/simple-auth-service"
import { WorkingLoginForm } from "@/components/auth/working-login-form"

interface EnhancedAuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
  refreshUser: async () => {},
})

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      const result = await SimpleAuthService.getCurrentUser()

      if (result.success && result.user) {
        if (result.requiresUsername) {
          // User needs to complete onboarding
          setShowOnboarding(true)
        } else {
          setUser(result.user)
        }
      } else {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error("Error checking existing auth:", error)
      setShowOnboarding(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthComplete = (authUser: AuthUser) => {
    setUser(authUser)
    setShowOnboarding(false)
  }

  const logout = async () => {
    await SimpleAuthService.signOut()
    setUser(null)
    setShowOnboarding(true)
  }

  const refreshUser = async () => {
    const result = await SimpleAuthService.getCurrentUser()
    if (result.success && result.user && !result.requiresUsername) {
      setUser(result.user)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-muted-foreground">Loading GOOD CARE...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
        <WorkingLoginForm onAuthComplete={handleAuthComplete} />
      </div>
    )
  }

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>
}

export const useEnhancedAuth = () => useContext(EnhancedAuthContext)
