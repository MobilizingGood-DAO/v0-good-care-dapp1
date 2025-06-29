import { APICommunityService, type LeaderboardEntry, type UserStats, type CheckInRecord } from "./api-community-service"
import { LocalCheckInService, MOOD_EMOJIS } from "./local-checkin-service"

export class HybridCommunityService {
  // Try API first, fallback to localStorage
  static async recordCheckIn(
    userId: string,
    walletAddress: string,
    emoji: keyof typeof MOOD_EMOJIS,
    gratitudeNote?: string,
  ): Promise<{ success: boolean; points: number; newStreak: number; error?: string }> {
    try {
      // Try API first
      const moodValue = MOOD_EMOJIS[emoji].value
      const moodLabel = MOOD_EMOJIS[emoji].label

      const apiResult = await APICommunityService.recordCheckIn(walletAddress, moodValue, moodLabel, gratitudeNote)

      if (apiResult.success) {
        // Also save to localStorage as backup
        await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)

        return {
          success: true,
          points: apiResult.points || 0,
          newStreak: apiResult.streak || 1,
        }
      } else {
        // If API fails, try localStorage
        const localResult = await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)
        return localResult
      }
    } catch (error) {
      console.warn("API check-in failed, using localStorage:", error)
      // Fallback to localStorage
      return await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)
    }
  }

  static async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    try {
      // Try API first
      const apiLeaderboard = await APICommunityService.getLeaderboard(limit)
      if (apiLeaderboard.length > 0) {
        return apiLeaderboard
      }
    } catch (error) {
      console.warn("API leaderboard failed, using localStorage:", error)
    }

    // Fallback to localStorage (limited to current user)
    const localLeaderboard = await LocalCheckInService.getLeaderboard(limit)
    return localLeaderboard.map((entry) => ({
      userId: entry.userId,
      username: entry.username,
      walletAddress: entry.walletAddress,
      totalPoints: entry.totalPoints,
      currentStreak: entry.currentStreak,
      longestStreak: 0,
      level: entry.level,
      totalCheckins: 0,
      lastCheckin: undefined,
      rank: entry.rank,
    }))
  }

  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      // Try API first
      const { stats } = await APICommunityService.getUserStats(userId)
      if (stats) {
        return stats
      }
    } catch (error) {
      console.warn("API stats failed, using localStorage:", error)
    }

    // Fallback to localStorage
    const localStats = await LocalCheckInService.getUserStats(userId)
    if (!localStats) return null

    return {
      totalPoints: localStats.totalPoints,
      currentStreak: localStats.currentStreak,
      longestStreak: localStats.longestStreak,
      level: localStats.level,
      totalCheckins: localStats.totalCheckins,
      lastCheckin: localStats.lastCheckin,
    }
  }

  static async getRecentCheckIns(userId: string, limit = 10): Promise<CheckInRecord[]> {
    try {
      // Try API first
      const { checkIns } = await APICommunityService.getUserStats(userId)
      if (checkIns.length > 0) {
        return checkIns.slice(0, limit)
      }
    } catch (error) {
      console.warn("API check-ins failed, using localStorage:", error)
    }

    // Fallback to localStorage
    const localCheckIns = await LocalCheckInService.getRecentCheckIns(userId, limit)
    return localCheckIns.map((checkIn) => ({
      id: checkIn.id,
      userId: checkIn.userId,
      date: checkIn.timestamp.split("T")[0],
      mood: checkIn.moodValue,
      moodLabel: checkIn.emoji,
      points: checkIn.finalPoints,
      streak: 1,
      gratitudeNote: checkIn.gratitudeNote,
      createdAt: checkIn.timestamp,
    }))
  }

  static async initializeUser(
    walletAddress: string,
    userData?: {
      username?: string
      email?: string
    },
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Try to create/get user via API
      const result = await APICommunityService.getOrCreateUser(walletAddress, userData?.username)
      if (result.success && result.user) {
        return { success: true, userId: result.user.id }
      }
    } catch (error) {
      console.warn("API user creation failed, using localStorage:", error)
    }

    // Fallback to localStorage user ID
    const userId = `user_${walletAddress.slice(-8)}`
    return { success: true, userId }
  }

  // Helper method to seed demo data
  static async seedDemoData(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/community/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      return { success: response.ok, error: data.error }
    } catch (error) {
      console.error("Error seeding demo data:", error)
      return { success: false, error: "Network error" }
    }
  }
}
