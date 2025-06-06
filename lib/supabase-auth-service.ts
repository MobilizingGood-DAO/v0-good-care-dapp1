import { supabase } from "./supabase"
import { RealSupabaseService } from "./real-supabase-service"

export interface AuthUser {
  id: string
  email?: string
  username?: string
  wallet_address?: string
  avatar?: string
  social_provider?: string
}

export class SupabaseAuthService {
  // Get current authenticated user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.log("No authenticated user found")
        return null
      }

      // Get or create user profile
      const profile = await RealSupabaseService.getOrCreateUser(user)

      return {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        wallet_address: profile.wallet_address,
        avatar: profile.avatar,
        social_provider: profile.social_provider,
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  // Sign in with email
  static async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Sign in failed" }
    }
  }

  // Sign up with email
  static async signUpWithEmail(
    email: string,
    password: string,
    username?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split("@")[0],
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Sign up failed" }
    }
  }

  // Sign in with OAuth (Twitter, Google, etc.)
  static async signInWithOAuth(provider: "twitter" | "google"): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "OAuth sign in failed" }
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Sign out failed" }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await RealSupabaseService.getOrCreateUser(session.user)
        callback({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          wallet_address: profile.wallet_address,
          avatar: profile.avatar,
          social_provider: profile.social_provider,
        })
      } else {
        callback(null)
      }
    })
  }
}
