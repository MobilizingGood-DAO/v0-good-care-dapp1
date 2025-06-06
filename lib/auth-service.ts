import { supabase } from "./supabase"

export interface AuthUser {
  id: string
  email: string
  username?: string
  name?: string
  avatar?: string
  care_points?: number
  wallet_address?: string
  created_at?: string
  social_provider?: string
  authMethod?: "social" | "wallet" | "email"
  socialProvider?: string
  walletAddress?: string
  isNewUser?: boolean
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
  needsUsername?: boolean
  requiresUsername?: boolean
  isOffline?: boolean
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export class AuthService {
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async signInWithTwitter(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async getCurrentUser(): Promise<AuthResult> {
    try {
      const { data } = await supabase.auth.getSession()

      if (!data.session?.user) {
        return { success: false, error: "No active session" }
      }

      const { data: userData } = await supabase.from("users").select("*").eq("id", data.session.user.id).single()

      const user: AuthUser = userData || {
        id: data.session.user.id,
        email: data.session.user.email || "",
        username: data.session.user.user_metadata?.name || data.session.user.email?.split("@")[0],
        care_points: 0,
        created_at: new Date().toISOString(),
      }

      return { success: true, user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static saveUser(user: AuthUser) {
    localStorage.setItem("goodcare_user", JSON.stringify(user))
  }

  static getCurrentUserFromStorage(): AuthUser | null {
    try {
      const stored = localStorage.getItem("goodcare_user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static logout() {
    localStorage.removeItem("goodcare_user")
  }

  // Complete user registration with username
  static async completeRegistration(user: AuthUser, username: string): Promise<AuthResult> {
    try {
      // Validate username
      if (!username || username.length < 3) {
        return {
          success: false,
          error: "Username must be at least 3 characters long",
        }
      }

      if (username.length > 20) {
        return {
          success: false,
          error: "Username must be less than 20 characters",
        }
      }

      const avatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      const now = new Date().toISOString()

      // Create user data
      const userData = {
        id: user.id,
        wallet_address: user.walletAddress || null,
        email: user.email || null,
        username,
        social_provider: user.socialProvider || null,
        avatar,
        created_at: now,
        updated_at: now,
      }

      // Try to save to database
      const { data, error } = await supabase.from("users").insert(userData).select().single()

      if (error) {
        console.error("Database error:", error)
      }

      // Save to localStorage as backup
      const localUser = {
        id: user.id,
        username,
        walletAddress: user.walletAddress,
        email: user.email,
        authMethod: user.authMethod,
        socialProvider: user.socialProvider,
        avatar,
        createdAt: now,
      }

      this.saveUser(localUser)

      return {
        success: true,
        user: {
          ...user,
          username,
          avatar,
          isNewUser: false,
        },
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        error: "Failed to complete registration. Please try again.",
      }
    }
  }
}

// Legacy exports for backward compatibility
export async function createOrGetUserByEmail(email: string, walletAddress: string): Promise<AuthUser> {
  // Mock implementation for backward compatibility
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id: userId,
    email,
    username: email.split("@")[0] || "user",
    wallet_address: walletAddress,
    authMethod: "email",
  }
}

export async function createOrGetUserBySocial(
  provider: string,
  socialId: string,
  email: string | undefined,
  walletAddress: string,
): Promise<AuthUser> {
  // Mock implementation for backward compatibility
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    id: userId,
    email: email || "",
    username: email?.split("@")[0] || "user",
    wallet_address: walletAddress,
    authMethod: "social",
    socialProvider: provider,
  }
}

export async function createSession(user: AuthUser): Promise<AuthSession> {
  // Mock implementation for backward compatibility
  const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
}

export async function getSession(accessToken: string): Promise<AuthSession | null> {
  // Mock implementation for backward compatibility
  return null
}

export async function logout(accessToken: string): Promise<boolean> {
  // Mock implementation for backward compatibility
  return true
}
