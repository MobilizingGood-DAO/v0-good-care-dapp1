import { supabase } from "./supabase"
import { createWalletWithEmail, createWalletWithSocial, connectExternalWallet } from "./avacloud-waas"

export interface User {
  id: string
  walletAddress: string
  email?: string
  username?: string
  socialProvider?: string
  walletType: "embedded" | "external"
  walletId?: string
}

export class AuthService {
  // Sign in with email (creates embedded wallet)
  static async signInWithEmail(email: string): Promise<{
    success: boolean
    user?: User
    error?: string
  }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single()

      if (existingUser) {
        return {
          success: true,
          user: {
            id: existingUser.id,
            walletAddress: existingUser.wallet_address,
            email: existingUser.email,
            username: existingUser.username,
            socialProvider: existingUser.social_provider,
            walletType: existingUser.wallet_type,
            walletId: existingUser.wallet_id,
          },
        }
      }

      // Create new embedded wallet
      const walletResult = await createWalletWithEmail(email)
      if (!walletResult.success) {
        return {
          success: false,
          error: walletResult.error || "Failed to create wallet",
        }
      }

      // Create user in database
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          wallet_address: walletResult.address,
          email,
          wallet_type: "embedded",
          wallet_id: walletResult.walletId,
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      // Save session to localStorage
      const user = {
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        email: newUser.email,
        username: newUser.username,
        walletType: newUser.wallet_type,
        walletId: newUser.wallet_id,
      }

      localStorage.setItem("goodcare_current_user", JSON.stringify(user))

      return {
        success: true,
        user,
      }
    } catch (error) {
      console.error("Email sign in error:", error)
      return {
        success: false,
        error: "Sign in failed",
      }
    }
  }

  // Sign in with social provider (creates embedded wallet)
  static async signInWithSocial(provider: "twitter" | "google"): Promise<{
    success: boolean
    user?: User
    error?: string
  }> {
    try {
      // Create embedded wallet with social login
      const walletResult = await createWalletWithSocial(provider)
      if (!walletResult.success) {
        return {
          success: false,
          error: walletResult.error || "Failed to create wallet",
        }
      }

      // Check if user already exists by social ID
      if (walletResult.socialId) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("social_id", walletResult.socialId)
          .single()

        if (existingUser) {
          return {
            success: true,
            user: {
              id: existingUser.id,
              walletAddress: existingUser.wallet_address,
              email: existingUser.email,
              username: existingUser.username,
              socialProvider: existingUser.social_provider,
              walletType: existingUser.wallet_type,
              walletId: existingUser.wallet_id,
            },
          }
        }
      }

      // Create new user in database
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          wallet_address: walletResult.address,
          email: walletResult.email,
          social_provider: provider,
          social_id: walletResult.socialId,
          wallet_type: "embedded",
          wallet_id: walletResult.walletId,
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      // Save session to localStorage
      const user = {
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        email: newUser.email,
        username: newUser.username,
        socialProvider: newUser.social_provider,
        walletType: newUser.wallet_type,
        walletId: newUser.wallet_id,
      }

      localStorage.setItem("goodcare_current_user", JSON.stringify(user))

      return {
        success: true,
        user,
      }
    } catch (error) {
      console.error("Social sign in error:", error)
      return {
        success: false,
        error: "Sign in failed",
      }
    }
  }

  // Connect external wallet
  static async connectWallet(): Promise<{
    success: boolean
    user?: User
    error?: string
  }> {
    try {
      const walletResult = await connectExternalWallet()
      if (!walletResult.success) {
        return {
          success: false,
          error: walletResult.error || "Failed to connect wallet",
        }
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletResult.address)
        .single()

      if (existingUser) {
        return {
          success: true,
          user: {
            id: existingUser.id,
            walletAddress: existingUser.wallet_address,
            email: existingUser.email,
            username: existingUser.username,
            socialProvider: existingUser.social_provider,
            walletType: existingUser.wallet_type,
            walletId: existingUser.wallet_id,
          },
        }
      }

      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          wallet_address: walletResult.address,
          wallet_type: "external",
        })
        .select()
        .single()

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      // Save session to localStorage
      const user = {
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        email: newUser.email,
        username: newUser.username,
        walletType: newUser.wallet_type,
      }

      localStorage.setItem("goodcare_current_user", JSON.stringify(user))

      return {
        success: true,
        user,
      }
    } catch (error) {
      console.error("Wallet connect error:", error)
      return {
        success: false,
        error: "Connection failed",
      }
    }
  }

  // Update username
  static async updateUsername(
    userId: string,
    username: string,
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase
        .from("users")
        .update({ username, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Update username error:", error)
      return {
        success: false,
        error: "Update failed",
      }
    }
  }

  // Get user by ID
  static async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error || !data) return null

      return {
        id: data.id,
        walletAddress: data.wallet_address,
        email: data.email,
        username: data.username,
        socialProvider: data.social_provider,
        walletType: data.wallet_type,
        walletId: data.wallet_id,
      }
    } catch (error) {
      console.error("Get user error:", error)
      return null
    }
  }

  // Get current session
  static async getSession(): Promise<{
    success: boolean
    user?: User
    error?: string
  }> {
    try {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem("goodcare_current_user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        return {
          success: true,
          user,
        }
      }

      return {
        success: false,
        error: "No active session",
      }
    } catch (error) {
      console.error("Get session error:", error)
      return {
        success: false,
        error: "Session check failed",
      }
    }
  }

  // Logout user
  static async logout(): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      localStorage.removeItem("goodcare_current_user")
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      return {
        success: false,
        error: "Logout failed",
      }
    }
  }
}

// Export getSession as a standalone function for compatibility
export async function getSession(): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  return AuthService.getSession()
}

// Export logout as a standalone function for compatibility
export async function logout(): Promise<{
  success: boolean
  error?: string
}> {
  return AuthService.logout()
}
