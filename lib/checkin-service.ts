import { supabase } from "./supabase"

export interface CheckIn {
  id: string
  userId: string
  timestamp: string
  emoji: string
  moodValue: number
  gratitudeNote?: string
  points: number
  streakMultiplier: number
  finalPoints: number
}

export interface UserStats {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  lastCheckin: string | null
  totalCheckins: number
  level: number
}

// Emoji to mood value mapping
export const MOOD_EMOJIS = {
  "😢": { value: 1, label: "Very Sad" },
  "😕": { value: 2, label: "Sad" },
  "😐": { value: 3, label: "Neutral" },
  "🙂": { value: 4, label: "Happy" },
  "😄": { value: 5, label: "Very Happy" },
}

// Calculate streak multiplier
function getStreakMultiplier(streak: number): number {
  if (streak >= 14) return 2.0
  if (streak >= 7) return 1.5
  if (streak >= 3) return 1.25
  return 1.0
}

// Calculate level from total points
function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / 100) + 1
}

export class CheckInService {
  // Check if user can check in (8-hour cooldown)
  static async canCheckIn(userId: string): Promise<{
    canCheckIn: boolean
    nextCheckIn?: Date
    error?: string
  }> {
    try {
      const { data: lastCheckIn } = await supabase
        .from("checkins")
        .select("timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (!lastCheckIn) {
        return { canCheckIn: true }
      }

      const lastCheckInTime = new Date(lastCheckIn.timestamp)
      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000)

      if (lastCheckInTime > eightHoursAgo) {
        const nextCheckIn = new Date(lastCheckInTime.getTime() + 8 * 60 * 60 * 1000)
        return {
          canCheckIn: false,
          nextCheckIn,
        }
      }

      return { canCheckIn: true }
    } catch (error) {
      console.error("Error checking check-in eligibility:", error)
      return {
        canCheckIn: false,
        error: "Failed to check eligibility",
      }
    }
  }

  // Calculate current streak
  static async calculateStreak(userId: string): Promise<number> {
    try {
      const { data: checkIns } = await supabase
        .from("checkins")
        .select("timestamp")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(30) // Check last 30 days

      if (!checkIns || checkIns.length === 0) return 0

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < checkIns.length; i++) {
        const checkInDate = new Date(checkIns[i].timestamp)
        checkInDate.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)

        // Allow for same day or previous day
        const daysDiff = Math.floor((expectedDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) {
          streak++
        } else if (daysDiff === 1 && i === 0) {
          // If first check-in was yesterday, start counting from yesterday
          streak++
        } else {
          break
        }
      }

      return streak
    } catch (error) {
      console.error("Error calculating streak:", error)
      return 0
    }
  }

  // Record a check-in
  static async recordCheckIn(
    userId: string,
    emoji: keyof typeof MOOD_EMOJIS,
    gratitudeNote?: string,
  ): Promise<{
    success: boolean
    checkIn?: CheckIn
    newStats?: UserStats
    error?: string
  }> {
    try {
      // Check if user can check in
      const eligibility = await this.canCheckIn(userId)
      if (!eligibility.canCheckIn) {
        return {
          success: false,
          error: "Must wait 8 hours between check-ins",
        }
      }

      // Calculate current streak
      const currentStreak = await this.calculateStreak(userId)
      const newStreak = currentStreak + 1

      // Calculate points
      const basePoints = 10
      const gratitudeBonus = gratitudeNote ? 5 : 0
      const points = basePoints + gratitudeBonus

      // Calculate multiplier and final points
      const multiplier = getStreakMultiplier(newStreak)
      const finalPoints = Math.floor(points * multiplier)

      // Record check-in
      const { data: checkIn, error: checkInError } = await supabase
        .from("checkins")
        .insert({
          user_id: userId,
          emoji,
          mood_value: MOOD_EMOJIS[emoji].value,
          gratitude_note: gratitudeNote,
          points,
          streak_multiplier: multiplier,
          final_points: finalPoints,
        })
        .select()
        .single()

      if (checkInError) {
        return {
          success: false,
          error: checkInError.message,
        }
      }

      // Get updated user stats
      const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      const newStats: UserStats = {
        totalPoints: stats?.total_points || finalPoints,
        currentStreak: newStreak,
        longestStreak: Math.max(stats?.longest_streak || 0, newStreak),
        lastCheckin: new Date().toISOString().split("T")[0],
        totalCheckins: stats?.total_checkins || 1,
        level: calculateLevel(stats?.total_points || finalPoints),
      }

      // Update current streak in user_stats
      await supabase
        .from("user_stats")
        .update({
          current_streak: newStreak,
          longest_streak: newStats.longestStreak,
        })
        .eq("user_id", userId)

      return {
        success: true,
        checkIn: {
          id: checkIn.id,
          userId: checkIn.user_id,
          timestamp: checkIn.timestamp,
          emoji: checkIn.emoji,
          moodValue: checkIn.mood_value,
          gratitudeNote: checkIn.gratitude_note,
          points: checkIn.points,
          streakMultiplier: checkIn.streak_multiplier,
          finalPoints: checkIn.final_points,
        },
        newStats,
      }
    } catch (error) {
      console.error("Error recording check-in:", error)
      return {
        success: false,
        error: "Failed to record check-in",
      }
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      if (!stats) return null

      return {
        totalPoints: stats.total_points,
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak,
        lastCheckin: stats.last_checkin,
        totalCheckins: stats.total_checkins,
        level: stats.level,
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return null
    }
  }

  // Get recent check-ins
  static async getRecentCheckIns(userId: string, limit = 10): Promise<CheckIn[]> {
    try {
      const { data: checkIns } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (!checkIns) return []

      return checkIns.map((checkIn) => ({
        id: checkIn.id,
        userId: checkIn.user_id,
        timestamp: checkIn.timestamp,
        emoji: checkIn.emoji,
        moodValue: checkIn.mood_value,
        gratitudeNote: checkIn.gratitude_note,
        points: checkIn.points,
        streakMultiplier: checkIn.streak_multiplier,
        finalPoints: checkIn.final_points,
      }))
    } catch (error) {
      console.error("Error getting recent check-ins:", error)
      return []
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit = 100): Promise<
    Array<{
      userId: string
      username: string
      walletAddress: string
      totalPoints: number
      currentStreak: number
      level: number
      rank: number
    }>
  > {
    try {
      const { data: leaderboard } = await supabase
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

      if (!leaderboard) return []

      return leaderboard.map((entry, index) => ({
        userId: entry.user_id,
        username: entry.users.username || `User_${entry.users.wallet_address.slice(-6)}`,
        walletAddress: entry.users.wallet_address,
        totalPoints: entry.total_points,
        currentStreak: entry.current_streak,
        level: entry.level,
        rank: index + 1,
      }))
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }
}
