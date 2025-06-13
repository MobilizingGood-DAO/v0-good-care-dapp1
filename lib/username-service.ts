import { supabase } from "./supabase"

export class UsernameService {
  // Check if username is available
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      if (!username || username.length < 3) {
        return false
      }

      const { data, error } = await supabase.from("users").select("id").eq("username", username).single()

      // If no data found, username is available
      return !data && error?.code === "PGRST116"
    } catch (error) {
      console.error("Error checking username availability:", error)
      return false
    }
  }

  // Update user's username
  static async updateUsername(userId: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate username format
      if (!username || username.length < 3 || username.length > 20) {
        return { success: false, error: "Username must be 3-20 characters long" }
      }

      // Check for valid characters (alphanumeric and underscores only)
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { success: false, error: "Username can only contain letters, numbers, and underscores" }
      }

      // Check if username is available
      const isAvailable = await this.isUsernameAvailable(username)
      if (!isAvailable) {
        return { success: false, error: "Username is already taken" }
      }

      // Update username
      const { error } = await supabase
        .from("users")
        .update({ username, updated_at: new Date().toISOString() })
        .eq("id", userId)

      if (error) {
        console.error("Error updating username:", error)
        return { success: false, error: "Failed to update username" }
      }

      return { success: true }
    } catch (error) {
      console.error("Error in updateUsername:", error)
      return { success: false, error: "Something went wrong" }
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getUserProfile:", error)
      return null
    }
  }
}
