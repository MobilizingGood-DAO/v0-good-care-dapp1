import { supabase } from "./supabase"
import { DatabaseService } from "./database-service"
import { LocalStorageService } from "./local-storage-service"

export interface AuthUser {
  id: string
  email?: string
  username: string
  walletAddress?: string
  authMethod: "social" | "wallet" | "email"
  socialProvider?: string
  avatar?: string
  isNewUser?: boolean
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
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
  // Sign in with Google OAuth
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Google login error:", error)
        return {
          success: false,
          error: error.message,
        }
      }

      // This will redirect the user to Google, so we won't actually return anything here
      return {
        success: true,
      }
    } catch (error) {
      console.error("Google login error:", error)
      return {
        success: false,
        error: "Failed to login with Google",
      }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthResult> {
    try {
      // Try to get user from Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData?.user) {
        // If no authenticated user, check localStorage
        const localUserId = LocalStorageService.getCurrentUserId()
        if (localUserId) {
          const localUser = LocalStorageService.getUserById(localUserId)
          if (localUser) {
            return {
              success: true,
              user: {
                id: localUser.id,
                email: localUser.email,
                username: localUser.username,
                walletAddress: localUser.walletAddress,
                authMethod: localUser.authMethod as "social" | "wallet" | "email",
                socialProvider: localUser.socialProvider,
                avatar: localUser.avatar,
              },
              isOffline: true,
            }
          }
        }

        return {
          success: false,
          error: "No authenticated user",
        }
      }

      // User is authenticated with Supabase
      const user = authData.user

      // Check if user profile exists in our database
      const dbResult = await DatabaseService.safeQuery(
        () => supabase.from("users").select("*").eq("id", user.id).single(),
        () => LocalStorageService.getUserById(user.id),
      )

      if (dbResult.success && dbResult.data) {
        // User profile exists
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email || undefined,
            username: dbResult.data.username,
            walletAddress: dbResult.data.wallet_address || dbResult.data.walletAddress,
            authMethod: "social",
            socialProvider: user.app_metadata.provider,
            avatar: dbResult.data.avatar || user.user_metadata.avatar_url,
          },
          isOffline: dbResult.isOffline,
        }
      } else {
        // User is authenticated but needs to create a profile
        return {
          success: true,
          requiresUsername: true,
          user: {
            id: user.id,
            email: user.email || undefined,
            username: "",
            authMethod: "social",
            socialProvider: user.app_metadata.provider,
            avatar: user.user_metadata.avatar_url,
            isNewUser: true,
          },
          isOffline: dbResult.isOffline,
        }
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return {
        success: false,
        error: "Failed to get current user",
      }
    }
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

      // Check if username is taken (database first, then localStorage)
      const usernameCheck = await DatabaseService.safeQuery(
        () => supabase.from("users").select("id").eq("username", username).single(),
        () => LocalStorageService.getUserByUsername(username),
      )

      if (usernameCheck.success && usernameCheck.data) {
        return {
          success: false,
          error: "Username is already taken",
        }
      }

      const avatar = user.avatar || LocalStorageService.generateAvatar(username)
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
      const dbResult = await DatabaseService.safeInsert(() => supabase.from("users").insert(userData).select().single())

      // Always save to localStorage as backup
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

      LocalStorageService.saveUser(localUser)

      // Create user stats
      const statsData = {
        user_id: user.id,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        level: 1,
        total_checkins: 0,
        last_checkin: null,
        updated_at: now,
      }

      // Try to save stats to database
      await DatabaseService.safeInsert(() => supabase.from("user_stats").insert(statsData))

      // Always save stats to localStorage
      const localStats = {
        userId: user.id,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        totalCheckins: 0,
        lastCheckin: null,
      }

      LocalStorageService.saveUserStats(localStats)
      LocalStorageService.setCurrentUser(user.id)

      return {
        success: true,
        user: {
          ...user,
          username,
          avatar,
          isNewUser: false,
        },
        isOffline: !dbResult.success,
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        error: "Failed to complete registration. Please try again.",
      }
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local storage
      LocalStorageService.clearCurrentUser()

      return { success: true }
    } catch (error) {
      console.error("Sign out error:", error)
      return {
        success: false,
        error: "Failed to sign out",
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
    walletAddress,
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
    email,
    username: email?.split("@")[0] || "user",
    walletAddress,
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
