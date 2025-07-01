import { LocalCheckInService } from "./local-checkin-service"

export interface EnhancedLeaderboardEntry {
  userId: string
  username: string
  walletAddress: string
  avatar?: string
  selfCarePoints: number
  careObjectivePoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  rank: number
}

export interface CareObjective {
  id: string
  userId: string
  username: string
  walletAddress: string
  objectiveType: string
  title: string
  description?: string
  points: number
  status: "pending" | "completed" | "verified"
  evidenceUrl?: string
  createdAt: string
}

export class HybridCommunityService {
  private static isOnline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine
  }

  // Enhanced leaderboard with both point types
  static async getEnhancedLeaderboard(limit = 10): Promise<EnhancedLeaderboardEntry[]> {
    if (this.isOnline()) {
      try {
        const response = await fetch(`/api/community/leaderboard?limit=${limit}`)
        const data = await response.json()

        if (data.success) {
          return data.leaderboard
        }
      } catch (error) {
        console.error("Error fetching enhanced leaderboard:", error)
      }
    }

    // Fallback to local data (self-care points only)
    const localLeaderboard = LocalCheckInService.getLeaderboard()
    return localLeaderboard
      .map((entry, index) => ({
        userId: entry.userId,
        username: entry.username,
        walletAddress: entry.walletAddress || "",
        selfCarePoints: entry.totalPoints,
        careObjectivePoints: 0,
        totalPoints: entry.totalPoints,
        currentStreak: entry.currentStreak,
        longestStreak: entry.longestStreak,
        level: entry.level,
        totalCheckins: entry.totalCheckins,
        lastCheckin: entry.lastCheckin,
        rank: index + 1,
      }))
      .slice(0, limit)
  }

  // Get user's care objectives
  static async getUserObjectives(userId: string, status = "completed"): Promise<CareObjective[]> {
    if (!this.isOnline()) {
      return []
    }

    try {
      const response = await fetch(`/api/community/objectives?userId=${userId}&status=${status}`)
      const data = await response.json()

      if (data.success) {
        return data.objectives
      }
    } catch (error) {
      console.error("Error fetching user objectives:", error)
    }

    return []
  }

  // Submit new care objective
  static async submitObjective(objective: {
    userId: string
    username: string
    walletAddress: string
    objectiveType: string
    title: string
    description?: string
    points: number
    evidenceUrl?: string
  }): Promise<{ success: boolean; objective?: CareObjective; error?: string }> {
    if (!this.isOnline()) {
      return { success: false, error: "Offline - cannot submit objectives" }
    }

    try {
      const response = await fetch("/api/community/objectives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objective),
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, objective: data.objective }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Error submitting objective:", error)
      return { success: false, error: "Failed to submit objective" }
    }
  }

  // Get user's total points breakdown
  static async getUserPointsBreakdown(userId: string): Promise<{
    selfCarePoints: number
    careObjectivePoints: number
    totalPoints: number
  }> {
    const objectives = await this.getUserObjectives(userId)
    const careObjectivePoints = objectives.reduce((sum, obj) => sum + obj.points, 0)

    // Get self-care points from local storage or API
    const localStats = LocalCheckInService.getUserStats(userId)
    const selfCarePoints = localStats?.totalPoints || 0

    return {
      selfCarePoints,
      careObjectivePoints,
      totalPoints: selfCarePoints + careObjectivePoints,
    }
  }

  // Enhanced check-in with gratitude privacy option
  static async recordCheckIn(
    userId: string,
    mood: number,
    moodLabel: string,
    gratitudeNote?: string,
    isGratitudePublic = false,
    resourcesViewed: string[] = [],
  ): Promise<{ success: boolean; checkIn?: any; newStats?: any; error?: string }> {
    // Record locally first
    const localResult = LocalCheckInService.recordCheckIn(userId, mood, moodLabel, gratitudeNote, resourcesViewed)

    // Try to sync with Supabase if online
    if (this.isOnline()) {
      try {
        const response = await fetch("/api/community/checkin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            mood,
            moodLabel,
            gratitudeNote,
            isGratitudePublic,
            resourcesViewed,
          }),
        })

        const data = await response.json()

        if (data.success) {
          return { success: true, checkIn: data.checkIn, newStats: data.stats }
        }
      } catch (error) {
        console.error("Error syncing check-in:", error)
      }
    }

    return localResult
  }

  // Subscribe to realtime leaderboard updates
  static subscribeToLeaderboard(callback: (leaderboard: EnhancedLeaderboardEntry[]) => void) {
    if (!this.isOnline()) {
      return { unsubscribe: () => {} }
    }

    // Set up polling for now (could be replaced with WebSocket/SSE)
    const interval = setInterval(async () => {
      const leaderboard = await this.getEnhancedLeaderboard()
      callback(leaderboard)
    }, 30000) // Refresh every 30 seconds

    return {
      unsubscribe: () => clearInterval(interval),
    }
  }
}
