"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AuthService, type AuthUser, type AuthResult } from "@/lib/auth-service"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  needsUsername: boolean
  pendingUserData: Partial<AuthUser> | null
  loginWithSocial: (provider: "google" | "twitter") => Promise<AuthResult>
  connectWallet: (address: string) => Promise<AuthResult>
  completeRegistration: (username: string) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  needsUsername: false,
  pendingUserData: null,
  loginWithSocial: async () => ({ success: false }),
  connectWallet: async () => ({ success: false }),
  completeRegistration: async () => ({ success: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsUsername, setNeedsUsername] = useState(false)
  const [pendingUserData, setPendingUserData] = useState<Partial<AuthUser> | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const existingUser = AuthService.getCurrentUser()
    if (existingUser) {
      setUser(existingUser)
    }
    setIsLoading(false)
  }, [])

  const loginWithSocial = async (provider: "google" | "twitter"): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      const result = await AuthService.loginWithSocial(provider)

      if (result.success && result.user) {
        if (result.needsUsername) {
          setNeedsUsername(true)
          setPendingUserData(result.user)
        } else {
          setUser(result.user)
          AuthService.saveUser(result.user)
          setNeedsUsername(false)
          setPendingUserData(null)
        }
      }

      return result
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async (address: string): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      const result = await AuthService.connectWallet(address)

      if (result.success && result.user) {
        if (result.needsUsername) {
          setNeedsUsername(true)
          setPendingUserData(result.user)
        } else {
          setUser(result.user)
          AuthService.saveUser(result.user)
          setNeedsUsername(false)
          setPendingUserData(null)
        }
      }

      return result
    } finally {
      setIsLoading(false)
    }
  }

  const completeRegistration = async (username: string): Promise<AuthResult> => {
    if (!pendingUserData) {
      return { success: false, error: "No pending user data" }
    }

    setIsLoading(true)
    try {
      const result = await AuthService.completeRegistration(pendingUserData, username)

      if (result.success && result.user) {
        setUser(result.user)
        AuthService.saveUser(result.user)
        setNeedsUsername(false)
        setPendingUserData(null)
      }

      return result
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setNeedsUsername(false)
    setPendingUserData(null)
    AuthService.logout()
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    needsUsername,
    pendingUserData,
    loginWithSocial,
    connectWallet,
    completeRegistration,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
