import { DatabaseService } from "./database-service"
import { LocalStorageService, type LocalUser, type LocalUserStats } from "./local-storage-service"
import { supabase } from "./supabase"

export interface AuthUser {
  id: string
  email?: string
  username: string
  walletAddress: string
  authMethod: "social" | "wallet"
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

export class EnhancedAuthService {
  // Social login with embedded wallet
  async loginWithSocial(provider: "google" | "twitter"): Promise<AuthResult> {
    try {
      // Generate mock social user data
      const mockSocialUser = {
        id: `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: `user_${Date.now()}@${provider}.com`,
        provider,
      }

      // Generate embedded wallet address
      const walletAddress = this.generateEmbeddedWalletAddress(mockSocialUser.id)

      // Try database first, fallback to localStorage
      const dbResult = await DatabaseService.safeQuery(
        () => supabase.from("users").select("*").eq("wallet_address", walletAddress).single(),
        () => LocalStorageService.getUserByWallet(walletAddress),
      )

      if (dbResult.success && dbResult.data) {
        // Existing user found
        return {
          success: true,
          user: {
            id: dbResult.data.id,
            email: dbResult.data.email,
            username: dbResult.data.username,
            walletAddress: dbResult.data.wallet_address || dbResult.data.walletAddress,
            authMethod: "social",
            socialProvider: dbResult.data.social_provider || dbResult.data.socialProvider,
            avatar: dbResult.data.avatar,
          },
          isOffline: dbResult.isOffline,
        }
      } else {
        // New user - needs username
        return {
          success: true,
          requiresUsername: true,
          user: {
            id: mockSocialUser.id,
            email: mockSocialUser.email,
            username: "",
            walletAddress,
            authMethod: "social",
            socialProvider: provider,
            isNewUser: true,
          },
          isOffline: dbResult.isOffline,
        }
      }
    } catch (error) {
      console.error("Social login error:", error)
      return {
        success: false,
        error: "Failed to login with social provider",
      }
    }
  }

  // Wallet connection
  async connectWallet(walletAddress: string): Promise<AuthResult> {
    try {
      if (!walletAddress) {
        return {
          success: false,
          error: "No wallet address provided",
        }
      }

      // Try database first, fallback to localStorage
      const dbResult = await DatabaseService.safeQuery(
        () => supabase.from("users").select("*").eq("wallet_address", walletAddress).single(),
        () => LocalStorageService.getUserByWallet(walletAddress),
      )

      if (dbResult.success && dbResult.data) {
        // Existing user found
        return {
          success: true,
          user: {
            id: dbResult.data.id,
            email: dbResult.data.email,
            username: dbResult.data.username,
            walletAddress: dbResult.data.wallet_address || dbResult.data.walletAddress,
            authMethod: "wallet",
            avatar: dbResult.data.avatar,
          },
          isOffline: dbResult.isOffline,
        }
      } else {
        // New user - needs username
        return {
          success: true,
          requiresUsername: true,
          user: {
            id: walletAddress,
            username: "",
            walletAddress,
            authMethod: "wallet",
            isNewUser: true,
          },
          isOffline: dbResult.isOffline,
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      return {
        success: false,
        error: "Failed to connect wallet",
      }
    }
  }

  // Complete user registration with username
  async completeRegistration(user: AuthUser, username: string): Promise<AuthResult> {
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

      const avatar = LocalStorageService.generateAvatar(username)
      const now = new Date().toISOString()

      // Create user data
      const userData = {
        id: user.id,
        wallet_address: user.walletAddress,
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
      const localUser: LocalUser = {
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
      const localStats: LocalUserStats = {
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

  // Generate embedded wallet address (deterministic)
  private generateEmbeddedWalletAddress(socialId: string): string {
    const hash = this.simpleHash(socialId)
    return `0x${hash.substring(0, 40)}`
  }

  // Simple hash function
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(40, "0")
  }
}
