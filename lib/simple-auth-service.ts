import { supabase } from "./supabase"
import { LocalStorageService } from "./local-storage-service"

export interface AuthUser {
  id: string
  email?: string
  username: string
  walletAddress?: string
  authMethod: "social" | "wallet" | "email" | "demo"
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

export class SimpleAuthService {
  // Check if Supabase is properly configured
  static async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)
      return !error
    } catch (error) {
      console.log("Supabase not configured:", error)
      return false
    }
  }

  // Email/Password signup (works without OAuth)
  static async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      if (data.user) {
        return {
          success: true,
          requiresUsername: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            username: "",
            authMethod: "email",
            isNewUser: true,
          },
        }
      }

      return {
        success: false,
        error: "Failed to create account",
      }
    } catch (error) {
      console.error("Email signup error:", error)
      return {
        success: false,
        error: "Failed to create account. Please try again.",
      }
    }
  }

  // Email/Password login (works without OAuth)
  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      if (data.user) {
        // Check if user profile exists
        const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

        if (profile) {
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email || undefined,
              username: profile.username,
              walletAddress: profile.wallet_address,
              authMethod: "email",
              avatar: profile.avatar,
            },
          }
        } else {
          return {
            success: true,
            requiresUsername: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              username: "",
              authMethod: "email",
              isNewUser: true,
            },
          }
        }
      }

      return {
        success: false,
        error: "Failed to sign in",
      }
    } catch (error) {
      console.error("Email signin error:", error)
      return {
        success: false,
        error: "Failed to sign in. Please try again.",
      }
    }
  }

  // Demo mode login (always works)
  static async signInWithDemo(username?: string): Promise<AuthResult> {
    const demoUserId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const demoUsername = username || `DemoUser${Math.floor(Math.random() * 1000)}`

    const demoUser: AuthUser = {
      id: demoUserId,
      username: demoUsername,
      authMethod: "demo",
      avatar: LocalStorageService.generateAvatar(demoUsername),
    }

    // Save to localStorage
    LocalStorageService.saveUser({
      id: demoUserId,
      username: demoUsername,
      authMethod: "demo",
      avatar: demoUser.avatar,
      createdAt: new Date().toISOString(),
    })

    // Create demo stats
    LocalStorageService.saveUserStats({
      userId: demoUserId,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      totalCheckins: 0,
      lastCheckin: null,
    })

    LocalStorageService.setCurrentUser(demoUserId)

    return {
      success: true,
      user: demoUser,
      isOffline: true,
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthResult> {
    try {
      // First check localStorage for demo users
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
              authMethod: localUser.authMethod as "social" | "wallet" | "email" | "demo",
              socialProvider: localUser.socialProvider,
              avatar: localUser.avatar,
            },
            isOffline: localUser.authMethod === "demo",
          }
        }
      }

      // Check Supabase auth
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData?.user) {
        return {
          success: false,
          error: "No authenticated user",
        }
      }

      // User is authenticated with Supabase
      const user = authData.user

      // Check if user profile exists
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profile) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email || undefined,
            username: profile.username,
            walletAddress: profile.wallet_address,
            authMethod: "email",
            avatar: profile.avatar,
          },
        }
      } else {
        return {
          success: true,
          requiresUsername: true,
          user: {
            id: user.id,
            email: user.email,
            username: "",
            authMethod: "email",
            isNewUser: true,
          },
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

  // Complete user registration
  static async completeRegistration(user: AuthUser, username: string): Promise<AuthResult> {
    try {
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

      const avatar = user.avatar || LocalStorageService.generateAvatar(username)
      const now = new Date().toISOString()

      if (user.authMethod === "demo") {
        // Update demo user
        const localUser = {
          id: user.id,
          username,
          authMethod: "demo" as const,
          avatar,
          createdAt: now,
        }

        LocalStorageService.saveUser(localUser)
        LocalStorageService.setCurrentUser(user.id)

        return {
          success: true,
          user: {
            ...user,
            username,
            avatar,
            isNewUser: false,
          },
          isOffline: true,
        }
      }

      // For real users, save to Supabase
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

      const { error: userError } = await supabase.from("users").insert(userData)

      if (userError) {
        if (userError.code === "23505") {
          return {
            success: false,
            error: "Username is already taken",
          }
        }
        throw userError
      }

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

      await supabase.from("user_stats").insert(statsData)

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

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear localStorage first
      LocalStorageService.clearCurrentUser()

      // Try to sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.log("Supabase signout error (non-critical):", error)
      }

      return { success: true }
    } catch (error) {
      console.error("Sign out error:", error)
      return {
        success: true, // Still return success since we cleared localStorage
      }
    }
  }
}
