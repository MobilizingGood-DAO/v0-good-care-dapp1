import {
  SupabaseCommunityService,
  type LeaderboardEntry,
  type UserStats,
  type CheckInRecord,
} from "./supabase-community-service"
import { LocalCheckInService, MOOD_EMOJIS } from "./local-checkin-service"

export class HybridCommunityService {
  // Try Supabase first, fallback to localStorage
  static async recordCheckIn(
    userId: string,
    walletAddress: string,
    emoji: keyof typeof MOOD_EMOJIS,
    gratitudeNote?: string,
  ): Promise<{ success: boolean; points: number; newStreak: number; error?: string }> {
    try {
      // Try Supabase first
      const moodValue = MOOD_EMOJIS[emoji].value
      const moodLabel = MOOD_EMOJIS[emoji].label

      const supabaseResult = await SupabaseCommunityService.recordCheckIn(userId, moodValue, moodLabel, gratitudeNote)

      if (supabaseResult.success) {
        // Also save to localStorage as backup
        await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)

        return {
          success: true,
          points: supabaseResult.checkIn?.points || 0,
          newStreak: supabaseResult.checkIn?.streak || 1,
        }
      }
    } catch (error) {
      console.warn("Supabase check-in failed, using localStorage:", error)
    }

    // Fallback to localStorage
    return await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)
  }

  static async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    try {
      // Try Supabase first
      const supabaseLeaderboard = await SupabaseCommunityService.getLeaderboard(limit)
      if (supabaseLeaderboard.length > 0) {
        return supabaseLeaderboard
      }
    } catch (error) {
      console.warn("Supabase leaderboard failed, using localStorage:", error)
    }

    // Fallback to localStorage (limited to current user)
    const localLeaderboard = await LocalCheckInService.getLeaderboard(limit)
    return localLeaderboard.map((entry) => ({
      userId: entry.userId,
      username: entry.username,
      walletAddress: entry.walletAddress,
      totalPoints: entry.totalPoints,
      currentStreak: entry.currentStreak,
      longestStreak: 0, // Not tracked in local service
      level: entry.level,
      totalCheckins: 0, // Not tracked in local service
      rank: entry.rank,
    }))
  }

  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      // Try Supabase first
      const supabaseStats = await SupabaseCommunityService.getUserStats(userId)
      if (supabaseStats) {
        return supabaseStats
      }
    } catch (error) {
      console.warn("Supabase stats failed, using localStorage:", error)
    }

    // Fallback to localStorage
    const localStats = await LocalCheckInService.getUserStats(userId)
    if (!localStats) return null

    return {
      id: `local_${userId}`,
      userId,
      totalPoints: localStats.totalPoints,
      currentStreak: localStats.currentStreak,
      longestStreak: localStats.longestStreak,
      level: localStats.level,
      totalCheckins: localStats.totalCheckins,
      lastCheckin: localStats.lastCheckin,
      updatedAt: new Date().toISOString(),
    }
  }

  static async getRecentCheckIns(userId: string, limit = 10): Promise<CheckInRecord[]> {
    try {
      // Try Supabase first
      const supabaseCheckIns = await SupabaseCommunityService.getRecentCheckIns(userId, limit)
      if (supabaseCheckIns.length > 0) {
        return supabaseCheckIns
      }
    } catch (error) {
      console.warn("Supabase check-ins failed, using localStorage:", error)
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
      streak: 1, // Not properly tracked in local service
      gratitudeNote: checkIn.gratitudeNote,
      resourcesViewed: [],
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
      // Try to create/get user in Supabase
      const result = await SupabaseCommunityService.getOrCreateUser(walletAddress, userData)
      if (result.success && result.user) {
        return { success: true, userId: result.user.id }
      }
    } catch (error) {
      console.warn("Supabase user creation failed, using localStorage:", error)
    }

    // Fallback to localStorage user ID
    const userId = `user_${walletAddress.slice(-8)}`
    return { success: true, userId }
  }
}
