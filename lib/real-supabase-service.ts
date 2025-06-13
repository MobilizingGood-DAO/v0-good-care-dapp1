import { supabase } from "./supabase"

export interface User {
  id: string
  email?: string
  username?: string
  wallet_address?: string
  bio?: string
  avatar?: string
  social_provider?: string
  created_at?: string
  updated_at?: string
}

export interface UserStats {
  id: string
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
  level: number
  total_checkins: number
  last_checkin?: string
  updated_at?: string
}

export interface CheckIn {
  id: string
  user_id: string
  date: string
  mood: number
  mood_label: string
  points: number
  streak: number
  gratitude_note?: string
  resources_viewed: string[]
  created_at: string
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  total_points: number
  current_streak: number
  level: number
  rank: number
}

export class RealSupabaseService {
  // Get or create user profile
  static async getOrCreateUser(authUser: any): Promise<User> {
    try {
      console.log("Getting/creating user:", authUser.id)

      // First, try to get existing user
      const { data: existingUser, error: getUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (existingUser && !getUserError) {
        console.log("Found existing user:", existingUser.id)
        return existingUser
      }

      console.log("Creating new user...")

      // Create new user if doesn't exist
      const walletAddress = authUser.user_metadata?.wallet_address || `0x${authUser.id.replace(/-/g, "").slice(0, 40)}`

      const newUser = {
        id: authUser.id,
        email: authUser.email,
        wallet_address: walletAddress,
        username:
          authUser.user_metadata?.user_name || // Twitter username
          authUser.user_metadata?.preferred_username || // Other providers
          authUser.user_metadata?.full_name?.replace(/\s+/g, "_").toLowerCase() ||
          authUser.email?.split("@")[0] ||
          `user_${authUser.id.slice(-6)}`,
        avatar:
          authUser.user_metadata?.avatar_url || // Twitter avatar
          authUser.user_metadata?.picture || // Other providers
          null,
        social_provider: authUser.app_metadata?.provider || "email",
        bio: authUser.user_metadata?.description || null, // Twitter bio
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdUser, error: createError } = await supabase.from("users").insert(newUser).select().single()

      if (createError) {
        console.error("Error creating user:", createError)
        throw createError
      }

      console.log("Created user:", createdUser.id)

      // Create user stats
      await this.initializeUserStats(authUser.id)

      return createdUser
    } catch (error) {
      console.error("Error getting/creating user:", error)
      throw error
    }
  }

  // Initialize user stats
  static async initializeUserStats(userId: string): Promise<void> {
    try {
      console.log("Initializing user stats for:", userId)

      const { error } = await supabase.from("user_stats").insert({
        user_id: userId,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        level: 1,
        total_checkins: 0,
        updated_at: new Date().toISOString(),
      })

      if (error && !error.message.includes("duplicate")) {
        console.error("Error initializing user stats:", error)
        throw error
      }

      console.log("User stats initialized")
    } catch (error) {
      console.error("Error initializing user stats:", error)
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("Error getting user stats:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error getting user stats:", error)
      return null
    }
  }

  // Check if user can check in today
  static async canCheckInToday(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("id")
        .eq("user_id", userId)
        .eq("date", today)
        .single()

      return !data // Can check in if no record exists for today
    } catch (error) {
      return true // If error, assume they can check in
    }
  }

  // Record daily check-in
  static async recordCheckIn(
    userId: string,
    mood: number,
    moodLabel: string,
    gratitudeNote?: string,
    resourcesViewed: string[] = [],
  ): Promise<{ success: boolean; points: number; newStreak: number; error?: string }> {
    try {
      console.log("Recording check-in for user:", userId)

      const today = new Date().toISOString().split("T")[0]

      // Check if already checked in today
      const canCheckIn = await this.canCheckInToday(userId)
      if (!canCheckIn) {
        return { success: false, points: 0, newStreak: 0, error: "Already checked in today" }
      }

      // Get current stats
      let stats = await this.getUserStats(userId)
      if (!stats) {
        await this.initializeUserStats(userId)
        stats = await this.getUserStats(userId)
      }

      // Calculate streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split("T")[0]

      let newStreak = 1
      if (stats?.last_checkin === yesterdayString) {
        newStreak = (stats.current_streak || 0) + 1
      }

      // Calculate points
      const basePoints = 10
      const streakBonus = Math.min(newStreak * 2, 20)
      const moodBonus = mood >= 4 ? 5 : 0
      const gratitudeBonus = gratitudeNote ? 3 : 0
      const points = basePoints + streakBonus + moodBonus + gratitudeBonus

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
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (checkInError) {
        console.error("Error inserting check-in:", checkInError)
        throw checkInError
      }

      console.log("Check-in recorded:", checkIn.id)

      // Update user stats
      const newTotalPoints = (stats?.total_points || 0) + points
      const newLevel = Math.floor(newTotalPoints / 100) + 1

      const { error: statsError } = await supabase
        .from("user_stats")
        .update({
          total_points: newTotalPoints,
          current_streak: newStreak,
          longest_streak: Math.max(stats?.longest_streak || 0, newStreak),
          level: newLevel,
          total_checkins: (stats?.total_checkins || 0) + 1,
          last_checkin: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (statsError) {
        console.error("Error updating user stats:", statsError)
        throw statsError
      }

      console.log("User stats updated")

      return { success: true, points, newStreak }
    } catch (error) {
      console.error("Error recording check-in:", error)
      return { success: false, points: 0, newStreak: 0, error: "Failed to record check-in" }
    }
  }

  // Get user's recent check-ins
  static async getUserCheckIns(userId: string, limit = 30): Promise<CheckIn[]> {
    try {
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting check-ins:", error)
      return []
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          total_points,
          current_streak,
          level,
          users!inner(username, wallet_address)
        `)
        .order("total_points", { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((entry, index) => ({
        user_id: entry.user_id,
        username:
          entry.users.username ||
          `${entry.users.wallet_address?.slice(0, 6)}...${entry.users.wallet_address?.slice(-4)}` ||
          `User_${entry.user_id.slice(-6)}`,
        total_points: entry.total_points,
        current_streak: entry.current_streak,
        level: entry.level,
        rank: index + 1,
      }))
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      return !error
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }
}
