"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { EnhancedAuthService, type AuthUser } from "@/lib/enhanced-auth-service"
import { OnboardingFlow } from "@/components/auth/onboarding-flow"

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

  const authService = new EnhancedAuthService()

  useEffect(() => {
    checkExistingAuth()
  }, [])

  const checkExistingAuth = async () => {
    try {
      // Check localStorage for existing session
      const savedUser = localStorage.getItem("goodcare_user")
      if (savedUser) {
        const userData = JSON.parse(savedUser) as AuthUser
        setUser(userData)
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

    // Save to localStorage
    localStorage.setItem("goodcare_user", JSON.stringify(authUser))
  }

  const logout = () => {
    setUser(null)
    setShowOnboarding(true)
    localStorage.removeItem("goodcare_user")
  }

  const refreshUser = async () => {
    // Refresh user data from database if needed
    if (user) {
      // Could implement user data refresh here
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
        <OnboardingFlow onAuthComplete={handleAuthComplete} />
      </div>
    )
  }

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>
}

export const useEnhancedAuth = () => useContext(EnhancedAuthContext)
