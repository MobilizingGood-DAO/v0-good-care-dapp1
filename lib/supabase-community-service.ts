import { supabase } from "./supabase"

export interface CommunityUser {
  id: string
  walletAddress: string
  username?: string
  email?: string
  avatar?: string
  socialProvider?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface CheckInRecord {
  id: string
  userId: string
  date: string
  mood: number
  moodLabel: string
  points: number
  streak: number
  gratitudeNote?: string
  resourcesViewed: string[]
  createdAt: string
}

export interface UserStats {
  id: string
  userId: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  updatedAt: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  walletAddress: string
  avatar?: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  rank: number
}

export class SupabaseCommunityService {
  // 1. User Management
  static async getOrCreateUser(
    walletAddress: string,
    userData?: {
      username?: string
      email?: string
      avatar?: string
      socialProvider?: string
    },
  ): Promise<{ success: boolean; user?: CommunityUser; error?: string }> {
    try {
      // Try to get existing user
      const { data: existingUser, error: getUserError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single()

      if (existingUser && !getUserError) {
        return { success: true, user: this.mapUser(existingUser) }
      }

      // Create new user
      const newUser = {
        wallet_address: walletAddress,
        username: userData?.username || `User_${walletAddress.slice(-6)}`,
        email: userData?.email,
        avatar: userData?.avatar,
        social_provider: userData?.socialProvider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdUser, error: createError } = await supabase.from("users").insert(newUser).select().single()

      if (createError) {
        return { success: false, error: createError.message }
      }

      return { success: true, user: this.mapUser(createdUser) }
    } catch (error) {
      console.error("Error getting/creating user:", error)
      return { success: false, error: "Failed to get/create user" }
    }
  }

  static async updateUserProfile(
    userId: string,
    updates: {
      username?: string
      avatar?: string
      bio?: string
    },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      return { success: !error, error: error?.message }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: "Failed to update profile" }
    }
  }

  // 2. Check-in Management
  static async canCheckInToday(userId: string): Promise<{ canCheckIn: boolean; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("id")
        .eq("user_id", userId)
        .eq("date", today)
        .single()

      return { canCheckIn: !data }
    } catch (error) {
      return { canCheckIn: true } // If error, assume they can check in
    }
  }

  static async recordCheckIn(
    userId: string,
    mood: number,
    moodLabel: string,
    gratitudeNote?: string,
    resourcesViewed: string[] = [],
  ): Promise<{ success: boolean; checkIn?: CheckInRecord; newStats?: UserStats; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if already checked in today
      const { canCheckIn } = await this.canCheckInToday(userId)
      if (!canCheckIn) {
        return { success: false, error: "Already checked in today" }
      }

      // Calculate streak
      const streak = await this.calculateStreak(userId)
      const newStreak = streak + 1

      // Calculate points
      const basePoints = 10
      const gratitudeBonus = gratitudeNote ? 5 : 0
      const streakMultiplier = this.getStreakMultiplier(newStreak)
      const points = Math.floor((basePoints + gratitudeBonus) * streakMultiplier)

      // Insert check-in
      const { data: checkIn, error: checkInError } = await supabase
        .from("daily_checkins")
        .insert({
          user_id: userId,
          date: today,
          mood,
          mood_label: moodLabel,
          points,
          streak: newStreak,
          gratitude_note: gratitudeNote,
          resources_viewed: resourcesViewed,
        })
        .select()
        .single()

      if (checkInError) {
        return { success: false, error: checkInError.message }
      }

      // Get updated stats (trigger will have updated them)
      const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      return {
        success: true,
        checkIn: this.mapCheckIn(checkIn),
        newStats: stats ? this.mapUserStats(stats) : undefined,
      }
    } catch (error) {
      console.error("Error recording check-in:", error)
      return { success: false, error: "Failed to record check-in" }
    }
  }

  // 3. Stats and Leaderboard
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      if (error || !data) return null
      return this.mapUserStats(data)
    } catch (error) {
      console.error("Error getting user stats:", error)
      return null
    }
  }

  static async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase.from("leaderboard").select("*").limit(limit)

      if (error || !data) return []

      return data.map((entry: any) => ({
        userId: entry.user_id,
        username: entry.username || `User_${entry.wallet_address.slice(-6)}`,
        walletAddress: entry.wallet_address,
        avatar: entry.avatar,
        totalPoints: entry.total_points,
        currentStreak: entry.current_streak,
        longestStreak: entry.longest_streak,
        level: entry.level,
        totalCheckins: entry.total_checkins,
        lastCheckin: entry.last_checkin,
        rank: entry.rank,
      }))
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }

  static async getRecentCheckIns(userId: string, limit = 10): Promise<CheckInRecord[]> {
    try {
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(limit)

      if (error || !data) return []
      return data.map(this.mapCheckIn)
    } catch (error) {
      console.error("Error getting recent check-ins:", error)
      return []
    }
  }

  // 4. Real-time Updates
  static subscribeToLeaderboard(callback: (leaderboard: LeaderboardEntry[]) => void) {
    return supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_stats",
        },
        async () => {
          // Refresh leaderboard when stats change
          const leaderboard = await this.getLeaderboard()
          callback(leaderboard)
        },
      )
      .subscribe()
  }

  // Helper methods
  private static calculateStreak(userId: string): Promise<number> {
    // Implementation similar to LocalCheckInService
    return Promise.resolve(0) // Simplified for now
  }

  private static getStreakMultiplier(streak: number): number {
    if (streak >= 14) return 2.0
    if (streak >= 7) return 1.5
    if (streak >= 3) return 1.25
    return 1.0
  }

  private static mapUser(data: any): CommunityUser {
    return {
      id: data.id,
      walletAddress: data.wallet_address,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      socialProvider: data.social_provider,
      bio: data.bio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  private static mapCheckIn(data: any): CheckInRecord {
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      mood: data.mood,
      moodLabel: data.mood_label,
      points: data.points,
      streak: data.streak,
      gratitudeNote: data.gratitude_note,
      resourcesViewed: data.resources_viewed || [],
      createdAt: data.created_at,
    }
  }

  private static mapUserStats(data: any): UserStats {
    return {
      id: data.id,
      userId: data.user_id,
      totalPoints: data.total_points,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      level: data.level,
      totalCheckins: data.total_checkins,
      lastCheckin: data.last_checkin,
      updatedAt: data.updated_at,
    }
  }
}
