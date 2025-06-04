import { supabase } from "./supabase"

export interface CheckInData {
  emoji: string
  prompt?: string
  timestamp: string
}

export interface CheckInResult {
  success: boolean
  data?: {
    streakDays: number
    basePoints: number
    bonusPoints: number
    multiplier: number
    totalPoints: number
    canCheckInAgain: string // ISO timestamp
  }
  error?: string
}

export interface UserStreak {
  currentStreak: number
  longestStreak: number
  lastCheckIn: string | null
  totalPoints: number
  currentMultiplier: number
}

export class EnhancedCheckInService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Check if user can check in (8-hour cooldown)
  async canCheckIn(): Promise<{ canCheckIn: boolean; nextCheckIn?: string }> {
    try {
      const { data: lastCheckIn } = await supabase
        .from("checkins")
        .select("timestamp")
        .eq("user_id", this.userId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (!lastCheckIn) {
        return { canCheckIn: true }
      }

      const lastCheckInTime = new Date(lastCheckIn.timestamp)
      const now = new Date()
      const timeDiff = now.getTime() - lastCheckInTime.getTime()
      const eightHours = 8 * 60 * 60 * 1000

      if (timeDiff < eightHours) {
        const nextCheckIn = new Date(lastCheckInTime.getTime() + eightHours)
        return {
          canCheckIn: false,
          nextCheckIn: nextCheckIn.toISOString(),
        }
      }

      return { canCheckIn: true }
    } catch (error) {
      console.error("Error checking check-in eligibility:", error)
      return { canCheckIn: true } // Allow check-in on error
    }
  }

  // Perform check-in with streak calculation
  async checkIn(data: CheckInData): Promise<CheckInResult> {
    try {
      // First check if user can check in
      const eligibility = await this.canCheckIn()
      if (!eligibility.canCheckIn) {
        return {
          success: false,
          error: `You can check in again at ${new Date(eligibility.nextCheckIn!).toLocaleTimeString()}`,
        }
      }

      // Calculate streak
      const streakData = await this.calculateStreak()

      // Calculate points
      const basePoints = 10 // Base points for emoji selection
      const bonusPoints = data.prompt ? 5 : 0 // Bonus for reflection prompt
      const multiplier = this.getMultiplier(streakData.newStreak)
      const totalPoints = Math.floor((basePoints + bonusPoints) * multiplier)

      // Insert check-in record
      const { data: checkInRecord, error: checkInError } = await supabase
        .from("checkins")
        .insert({
          user_id: this.userId,
          emoji: data.emoji,
          prompt: data.prompt,
          streak_days: streakData.newStreak,
          base_points: basePoints,
          bonus_points: bonusPoints,
          multiplier: multiplier,
          timestamp: data.timestamp,
        })
        .select()
        .single()

      if (checkInError) {
        throw checkInError
      }

      // Calculate next check-in time
      const nextCheckIn = new Date(new Date(data.timestamp).getTime() + 8 * 60 * 60 * 1000)

      return {
        success: true,
        data: {
          streakDays: streakData.newStreak,
          basePoints,
          bonusPoints,
          multiplier,
          totalPoints,
          canCheckInAgain: nextCheckIn.toISOString(),
        },
      }
    } catch (error) {
      console.error("Error during check-in:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Check-in failed",
      }
    }
  }

  // Calculate user's current streak
  private async calculateStreak(): Promise<{ currentStreak: number; newStreak: number }> {
    try {
      // Get user's current stats
      const { data: userStats } = await supabase
        .from("user_stats")
        .select("current_streak, last_checkin_date")
        .eq("user_id", this.userId)
        .single()

      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      if (!userStats || !userStats.last_checkin_date) {
        // First check-in ever
        return { currentStreak: 0, newStreak: 1 }
      }

      const lastCheckInDate = userStats.last_checkin_date

      if (lastCheckInDate === today) {
        // Already checked in today (shouldn't happen due to 8-hour rule, but just in case)
        return { currentStreak: userStats.current_streak, newStreak: userStats.current_streak }
      } else if (lastCheckInDate === yesterday) {
        // Continuing streak
        return { currentStreak: userStats.current_streak, newStreak: userStats.current_streak + 1 }
      } else {
        // Streak broken, starting new
        return { currentStreak: userStats.current_streak, newStreak: 1 }
      }
    } catch (error) {
      console.error("Error calculating streak:", error)
      return { currentStreak: 0, newStreak: 1 }
    }
  }

  // Get multiplier based on streak
  private getMultiplier(streakDays: number): number {
    if (streakDays >= 14) return 2.0
    if (streakDays >= 7) return 1.5
    if (streakDays >= 3) return 1.25
    return 1.0
  }

  // Get user's streak information
  async getUserStreak(): Promise<UserStreak> {
    try {
      const { data: userStats } = await supabase.from("user_stats").select("*").eq("user_id", this.userId).single()

      if (!userStats) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastCheckIn: null,
          totalPoints: 0,
          currentMultiplier: 1.0,
        }
      }

      return {
        currentStreak: userStats.current_streak || 0,
        longestStreak: userStats.longest_streak || 0,
        lastCheckIn: userStats.last_checkin_date,
        totalPoints: userStats.total_points || 0,
        currentMultiplier: userStats.current_multiplier || 1.0,
      }
    } catch (error) {
      console.error("Error fetching user streak:", error)
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        totalPoints: 0,
        currentMultiplier: 1.0,
      }
    }
  }

  // Get check-in history
  async getCheckInHistory(limit = 30): Promise<any[]> {
    try {
      const { data: checkIns } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", this.userId)
        .order("timestamp", { ascending: false })
        .limit(limit)

      return checkIns || []
    } catch (error) {
      console.error("Error fetching check-in history:", error)
      return []
    }
  }
}
