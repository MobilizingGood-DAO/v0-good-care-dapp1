import { supabase } from "./supabase"

export interface CarePointsData {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  lastCheckIn: string | null
  checkInHistory: CheckInRecord[]
  totalCheckIns: number
}

export interface CheckInRecord {
  id: string
  date: string
  mood: number
  moodLabel: string
  points: number
  streak: number
  gratitudeNote?: string
  resourcesViewed: string[]
  timestamp: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  totalPoints: number
  currentStreak: number
  level: number
  avatar?: string
  rank: number
}

// Calculate level based on total points
export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1
  if (totalPoints < 300) return 2
  if (totalPoints < 600) return 3
  if (totalPoints < 1000) return 4
  if (totalPoints < 1500) return 5
  return Math.floor(totalPoints / 300) + 1
}

// Calculate points for a check-in
export function calculateCheckInPoints(streak: number, mood: number, hasGratitude: boolean): number {
  const basePoints = 10
  const streakBonus = Math.min(streak * 2, 20) // Max 20 bonus points
  const moodBonus = mood >= 4 ? 5 : 0 // Bonus for positive mood
  const gratitudeBonus = hasGratitude ? 3 : 0
  return basePoints + streakBonus + moodBonus + gratitudeBonus
}

// Get level progress (0-100%)
export function getLevelProgress(totalPoints: number): { current: number; next: number; progress: number } {
  const currentLevel = calculateLevel(totalPoints)
  const currentLevelThreshold = getLevelThreshold(currentLevel)
  const nextLevelThreshold = getLevelThreshold(currentLevel + 1)

  const progress = ((totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100

  return {
    current: currentLevel,
    next: currentLevel + 1,
    progress: Math.min(Math.max(progress, 0), 100),
  }
}

function getLevelThreshold(level: number): number {
  if (level <= 1) return 0
  if (level === 2) return 100
  if (level === 3) return 300
  if (level === 4) return 600
  if (level === 5) return 1000
  if (level === 6) return 1500
  return 1500 + (level - 6) * 300
}

// CARE Points service class with Supabase
export class SupabaseCareService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Initialize user in database if not exists
  async initializeUser(walletAddress: string, email?: string): Promise<void> {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("id", this.userId).single()

      if (!existingUser) {
        // Create user
        const { error: userError } = await supabase.from("users").insert({
          id: this.userId,
          wallet_address: walletAddress,
          email,
          username: `User_${walletAddress.slice(-6)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (userError) throw userError

        // Create user stats
        const { error: statsError } = await supabase.from("user_stats").insert({
          user_id: this.userId,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          level: 1,
          total_checkins: 0,
          last_checkin: null,
          updated_at: new Date().toISOString(),
        })

        if (statsError) throw statsError
      }
    } catch (error) {
      console.error("Error initializing user:", error)
      throw error
    }
  }

  // Load user's CARE Points data
  async loadData(): Promise<CarePointsData> {
    try {
      // Get user stats
      const { data: stats, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", this.userId)
        .single()

      if (statsError) throw statsError

      // Get recent check-ins (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: checkIns, error: checkInsError } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", this.userId)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false })

      if (checkInsError) throw checkInsError

      const checkInHistory: CheckInRecord[] = (checkIns || []).map((checkIn) => ({
        id: checkIn.id,
        date: checkIn.date,
        mood: checkIn.mood,
        moodLabel: checkIn.mood_label,
        points: checkIn.points,
        streak: checkIn.streak,
        gratitudeNote: checkIn.gratitude_note,
        resourcesViewed: checkIn.resources_viewed || [],
        timestamp: checkIn.created_at,
      }))

      return {
        totalPoints: stats?.total_points || 0,
        currentStreak: stats?.current_streak || 0,
        longestStreak: stats?.longest_streak || 0,
        level: stats?.level || 1,
        lastCheckIn: stats?.last_checkin,
        checkInHistory,
        totalCheckIns: stats?.total_checkins || 0,
      }
    } catch (error) {
      console.error("Error loading CARE Points data:", error)
      // Return default data on error
      return {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        lastCheckIn: null,
        checkInHistory: [],
        totalCheckIns: 0,
      }
    }
  }

  // Record a daily check-in
  async recordCheckIn(
    mood: number,
    moodLabel: string,
    gratitudeNote?: string,
    resourcesViewed: string[] = [],
  ): Promise<{ success: boolean; points: number; newStreak: number; error?: string }> {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if already checked in today
      const { data: existingCheckIn } = await supabase
        .from("checkins")
        .select("id")
        .eq("user_id", this.userId)
        .eq("date", today)
        .single()

      if (existingCheckIn) {
        return { success: false, points: 0, newStreak: 0, error: "Already checked in today" }
      }

      // Get current stats
      const { data: currentStats } = await supabase.from("user_stats").select("*").eq("user_id", this.userId).single()

      if (!currentStats) {
        return { success: false, points: 0, newStreak: 0, error: "User stats not found" }
      }

      // Calculate new streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split("T")[0]

      let newStreak = 1
      if (currentStats.last_checkin === yesterdayString) {
        newStreak = currentStats.current_streak + 1
      }

      // Calculate points
      const points = calculateCheckInPoints(newStreak, mood, !!gratitudeNote)

      // Insert check-in record
      const { error: checkInError } = await supabase.from("checkins").insert({
        user_id: this.userId,
        date: today,
        mood,
        mood_label: moodLabel,
        points,
        streak: newStreak,
        gratitude_note: gratitudeNote,
        resources_viewed: resourcesViewed,
        created_at: new Date().toISOString(),
      })

      if (checkInError) throw checkInError

      // Update user stats
      const newTotalPoints = currentStats.total_points + points
      const newLevel = calculateLevel(newTotalPoints)

      const { error: statsError } = await supabase
        .from("user_stats")
        .update({
          total_points: newTotalPoints,
          current_streak: newStreak,
          longest_streak: Math.max(currentStats.longest_streak, newStreak),
          level: newLevel,
          total_checkins: currentStats.total_checkins + 1,
          last_checkin: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", this.userId)

      if (statsError) throw statsError

      return { success: true, points, newStreak }
    } catch (error) {
      console.error("Error recording check-in:", error)
      return { success: false, points: 0, newStreak: 0, error: "Failed to record check-in" }
    }
  }

  // Check if user can check in today
  async canCheckInToday(): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data: checkIn } = await supabase
        .from("checkins")
        .select("id")
        .eq("user_id", this.userId)
        .eq("date", today)
        .single()

      return !checkIn
    } catch (error) {
      // If no check-in found, user can check in
      return true
    }
  }

  // Update user profile
  async updateProfile(updates: { username?: string; bio?: string; avatar?: string }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.userId)

      return !error
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  // Get user profile
  async getProfile(): Promise<{ username?: string; bio?: string; avatar?: string } | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username, bio, avatar")
        .eq("id", this.userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting profile:", error)
      return null
    }
  }
}

// Get community leaderboard
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .select(`
        user_id,
        total_points,
        current_streak,
        level,
        users!inner(username, avatar)
      `)
      .order("total_points", { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((entry, index) => ({
      userId: entry.user_id,
      username: entry.users.username || `User_${entry.user_id.slice(-6)}`,
      totalPoints: entry.total_points,
      currentStreak: entry.current_streak,
      level: entry.level,
      avatar: entry.users.avatar,
      rank: index + 1,
    }))
  } catch (error) {
    console.error("Error getting leaderboard:", error)
    return []
  }
}
