import { supabase } from "./supabase"

export interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: string
  isOffline?: boolean
}

export class DatabaseService {
  private static isOnline: boolean | null = null
  private static lastCheck = 0
  private static CHECK_INTERVAL = 30000 // 30 seconds

  // Check if database is available
  static async checkConnection(): Promise<boolean> {
    const now = Date.now()

    // Use cached result if recent
    if (this.isOnline !== null && now - this.lastCheck < this.CHECK_INTERVAL) {
      return this.isOnline
    }

    try {
      // Simple query to test connection
      const { error } = await supabase.from("users").select("id").limit(1)
      this.isOnline = !error
      this.lastCheck = now
      return this.isOnline
    } catch (error) {
      console.log("Database offline, using local storage")
      this.isOnline = false
      this.lastCheck = now
      return false
    }
  }

  // Safe database query with fallback
  static async safeQuery<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    fallback?: () => T | null,
  ): Promise<DatabaseResult<T>> {
    try {
      const isOnline = await this.checkConnection()

      if (!isOnline) {
        return {
          success: false,
          data: fallback ? fallback() : null,
          isOffline: true,
          error: "Database unavailable - using local storage",
        }
      }

      const { data, error } = await operation()

      if (error) {
        console.error("Database error:", error)
        return {
          success: false,
          data: fallback ? fallback() : null,
          error: error.message || "Database error",
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("Database operation failed:", error)
      return {
        success: false,
        data: fallback ? fallback() : null,
        error: "Database operation failed",
      }
    }
  }

  // Safe database insert with fallback
  static async safeInsert<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    fallback?: (data: any) => void,
  ): Promise<DatabaseResult<T>> {
    try {
      const isOnline = await this.checkConnection()

      if (!isOnline) {
        return {
          success: false,
          isOffline: true,
          error: "Database unavailable - data saved locally",
        }
      }

      const { data, error } = await operation()

      if (error) {
        console.error("Database insert error:", error)
        return {
          success: false,
          error: error.message || "Failed to save to database",
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("Database insert failed:", error)
      return {
        success: false,
        error: "Failed to save data",
      }
    }
  }
}
