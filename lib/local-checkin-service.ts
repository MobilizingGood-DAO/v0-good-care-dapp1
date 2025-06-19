// Temporary localStorage-based check-in service for MVP
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

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export class LocalCheckInService {
  private static getStorageKey(userId: string, type: "checkins" | "stats"): string {
    return `goodcare_${type}_${userId}`
  }

  // Get user's check-ins from localStorage
  private static getCheckIns(userId: string): CheckIn[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId, "checkins"))
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error loading check-ins:", error)
      return []
    }
  }

  // Save check-ins to localStorage
  private static saveCheckIns(userId: string, checkIns: CheckIn[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId, "checkins"), JSON.stringify(checkIns))
    } catch (error) {
      console.error("Error saving check-ins:", error)
    }
  }

  // Get user stats from localStorage
  private static getUserStatsFromStorage(userId: string): UserStats | null {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId, "stats"))
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error loading user stats:", error)
      return null
    }
  }

  // Save user stats to localStorage
  private static saveUserStats(userId: string, stats: UserStats): void {
    try {
      localStorage.setItem(this.getStorageKey(userId, "stats"), JSON.stringify(stats))
    } catch (error) {
      console.error("Error saving user stats:", error)
    }
  }

  // Check if user can check in (8-hour cooldown)
  static async canCheckIn(userId: string): Promise<{
    canCheckIn: boolean
    nextCheckIn?: Date
    error?: string
  }> {
    try {
      const checkIns = this.getCheckIns(userId)

      if (checkIns.length === 0) {
        return { canCheckIn: true }
      }

      const lastCheckIn = checkIns[checkIns.length - 1]
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
  static calculateStreak(userId: string): number {
    try {
      const checkIns = this.getCheckIns(userId)

      if (checkIns.length === 0) return 0

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Sort check-ins by date (most recent first)
      const sortedCheckIns = checkIns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      for (let i = 0; i < sortedCheckIns.length; i++) {
        const checkInDate = new Date(sortedCheckIns[i].timestamp)
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
      const currentStreak = this.calculateStreak(userId)
      const newStreak = currentStreak + 1

      // Calculate points
      const basePoints = 10
      const gratitudeBonus = gratitudeNote ? 5 : 0
      const points = basePoints + gratitudeBonus

      // Calculate multiplier and final points
      const multiplier = getStreakMultiplier(newStreak)
      const finalPoints = Math.floor(points * multiplier)

      // Create new check-in
      const newCheckIn: CheckIn = {
        id: generateId(),
        userId,
        timestamp: new Date().toISOString(),
        emoji,
        moodValue: MOOD_EMOJIS[emoji].value,
        gratitudeNote,
        points,
        streakMultiplier: multiplier,
        finalPoints,
      }

      // Save check-in
      const checkIns = this.getCheckIns(userId)
      checkIns.push(newCheckIn)
      this.saveCheckIns(userId, checkIns)

      // Update user stats
      const existingStats = this.getUserStatsFromStorage(userId)
      const newStats: UserStats = {
        totalPoints: (existingStats?.totalPoints || 0) + finalPoints,
        currentStreak: newStreak,
        longestStreak: Math.max(existingStats?.longestStreak || 0, newStreak),
        lastCheckin: new Date().toISOString().split("T")[0],
        totalCheckins: (existingStats?.totalCheckins || 0) + 1,
        level: calculateLevel((existingStats?.totalPoints || 0) + finalPoints),
      }

      this.saveUserStats(userId, newStats)

      return {
        success: true,
        checkIn: newCheckIn,
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
      const stats = this.getUserStatsFromStorage(userId)
      if (!stats) {
        // Return default stats for new users
        return {
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastCheckin: null,
          totalCheckins: 0,
          level: 1,
        }
      }
      return stats
    } catch (error) {
      console.error("Error getting user stats:", error)
      return null
    }
  }

  // Get recent check-ins
  static async getRecentCheckIns(userId: string, limit = 10): Promise<CheckIn[]> {
    try {
      const checkIns = this.getCheckIns(userId)
      return checkIns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)
    } catch (error) {
      console.error("Error getting recent check-ins:", error)
      return []
    }
  }

  // Get leaderboard (from all users' localStorage data)
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
      const leaderboard: Array<{
        userId: string
        username: string
        walletAddress: string
        totalPoints: number
        currentStreak: number
        level: number
        rank: number
      }> = []

      // This is a simplified version - in a real app you'd need a shared backend
      // For now, we'll just show the current user
      const currentUser = localStorage.getItem("goodcare_current_user")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const stats = this.getUserStatsFromStorage(user.id)

        if (stats) {
          leaderboard.push({
            userId: user.id,
            username: user.username || `User_${user.walletAddress.slice(-6)}`,
            walletAddress: user.walletAddress,
            totalPoints: stats.totalPoints,
            currentStreak: stats.currentStreak,
            level: stats.level,
            rank: 1,
          })
        }
      }

      return leaderboard.slice(0, limit)
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }

  // Clear all data (for testing)
  static clearAllData(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId, "checkins"))
      localStorage.removeItem(this.getStorageKey(userId, "stats"))
    } catch (error) {
      console.error("Error clearing data:", error)
    }
  }
}
