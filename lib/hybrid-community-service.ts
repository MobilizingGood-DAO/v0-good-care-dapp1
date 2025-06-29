import { LocalCheckInService, MOOD_EMOJIS } from "./local-checkin-service"
import { supabase } from "./supabase"
import { LocalStorageService } from "./local-storage-service"

export interface EnhancedLeaderboardEntry {
  userId: string
  username: string
  walletAddress: string
  selfCarePoints: number
  careObjectivePoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  rank: number
  objectives: Array<{
    title: string
    points: number
    category: string
  }>
}

export interface CareObjective {
  id: string
  userId: string
  username: string
  walletAddress?: string
  objectiveType: string
  title: string
  description?: string
  points: number
  category: string
  status: "pending" | "approved" | "completed" | "rejected"
  evidenceUrl?: string
  createdAt: string
}

export interface CommunityUser {
  id: string
  username: string
  avatar?: string
  selfCarePoints: number
  objectivePoints: number
  totalPoints: number
  currentStreak: number
  totalCheckins: number
  rank: number
  lastCheckin?: string
}

export interface CommunityStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
  averagePointsPerUser: number
}

export interface CommunityObjective {
  id: string
  userId: string
  username: string
  title: string
  description?: string
  category: "mentorship" | "content" | "support" | "events"
  points: number
  status: "pending" | "completed" | "verified"
  createdAt: string
  completedAt?: string
}

export interface CheckinData {
  userId: string
  username: string
  mood: string
  gratitude?: string
  isPublic?: boolean
  points: number
}

export class HybridCommunityService {
  private static instance: HybridCommunityService
  private syncQueue: Array<{ type: string; data: any }> = []
  private isOnline = true

  static getInstance(): HybridCommunityService {
    if (!HybridCommunityService.instance) {
      HybridCommunityService.instance = new HybridCommunityService()
    }
    return HybridCommunityService.instance
  }

  constructor() {
    this.checkOnlineStatus()
    this.startPeriodicSync()
  }

  private checkOnlineStatus() {
    this.isOnline = navigator.onLine
    window.addEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
    })
    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000) // Sync every 30 seconds
  }

  private async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue.shift()
      if (item) {
        try {
          await this.syncToDatabase(item)
        } catch (error) {
          console.error("Sync error:", error)
          // Re-add to queue if sync fails
          this.syncQueue.unshift(item)
          break
        }
      }
    }
  }

  private async syncToDatabase(item: { type: string; data: any }) {
    switch (item.type) {
      case "checkin":
        await this.syncCheckin(item.data)
        break
      case "objective":
        await this.syncObjective(item.data)
        break
    }
  }

  private async syncCheckin(data: CheckinData) {
    const { error } = await supabase.from("daily_checkins").insert({
      user_id: data.userId,
      mood: data.mood,
      gratitude: data.gratitude,
      is_public: data.isPublic || false,
      points: data.points,
      created_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }
  }

  private async syncObjective(data: Partial<CommunityObjective>) {
    const { error } = await supabase.from("care_objectives").insert({
      user_id: data.userId,
      username: data.username,
      title: data.title,
      description: data.description,
      category: data.category,
      points: data.points,
      status: data.status || "completed",
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }
  }

  async getLeaderboard(): Promise<{ users: CommunityUser[]; stats: CommunityStats }> {
    try {
      if (this.isOnline) {
        const response = await fetch("/api/community/leaderboard")
        const data = await response.json()

        if (data.success) {
          // Cache the data locally
          LocalStorageService.setItem("leaderboard_cache", {
            users: data.leaderboard,
            stats: data.stats,
            timestamp: Date.now(),
          })

          return {
            users: data.leaderboard || [],
            stats: data.stats || this.getDefaultStats(),
          }
        }
      }

      // Fallback to local cache
      const cached = LocalStorageService.getItem("leaderboard_cache")
      if (cached && Date.now() - cached.timestamp < 300000) {
        // Use cache if less than 5 minutes old
        return {
          users: cached.users || [],
          stats: cached.stats || this.getDefaultStats(),
        }
      }

      // Return mock data if no cache
      return this.getMockLeaderboard()
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return this.getMockLeaderboard()
    }
  }

  async submitCheckin(data: CheckinData): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isOnline) {
        const response = await fetch("/api/community/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const result = await response.json()
        if (result.success) {
          return { success: true }
        } else {
          // Add to sync queue for later
          this.syncQueue.push({ type: "checkin", data })
          return { success: true }
        }
      } else {
        // Add to sync queue for when online
        this.syncQueue.push({ type: "checkin", data })

        // Save locally
        LocalStorageService.saveCheckin({
          userId: data.userId,
          mood: data.mood,
          gratitude: data.gratitude,
          isPublic: data.isPublic,
          points: data.points,
          timestamp: Date.now(),
        })

        return { success: true }
      }
    } catch (error) {
      console.error("Error submitting checkin:", error)

      // Add to sync queue as fallback
      this.syncQueue.push({ type: "checkin", data })

      return { success: true }
    }
  }

  async submitObjective(data: Partial<CommunityObjective>): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isOnline) {
        const response = await fetch("/api/community/objectives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const result = await response.json()
        if (result.success) {
          return { success: true }
        } else {
          this.syncQueue.push({ type: "objective", data })
          return { success: true }
        }
      } else {
        this.syncQueue.push({ type: "objective", data })
        return { success: true }
      }
    } catch (error) {
      console.error("Error submitting objective:", error)
      this.syncQueue.push({ type: "objective", data })
      return { success: true }
    }
  }

  private getDefaultStats(): CommunityStats {
    return {
      totalUsers: 0,
      totalSelfCarePoints: 0,
      totalObjectivePoints: 0,
      totalPoints: 0,
      averagePointsPerUser: 0,
    }
  }

  private getMockLeaderboard(): { users: CommunityUser[]; stats: CommunityStats } {
    const mockUsers: CommunityUser[] = [
      {
        id: "1",
        username: "alice_wellness",
        avatar: "",
        selfCarePoints: 450,
        objectivePoints: 200,
        totalPoints: 650,
        currentStreak: 12,
        totalCheckins: 45,
        rank: 1,
        lastCheckin: new Date().toISOString(),
      },
      {
        id: "2",
        username: "bob_mindful",
        avatar: "",
        selfCarePoints: 380,
        objectivePoints: 150,
        totalPoints: 530,
        currentStreak: 8,
        totalCheckins: 38,
        rank: 2,
        lastCheckin: new Date().toISOString(),
      },
      {
        id: "3",
        username: "charlie_care",
        avatar: "",
        selfCarePoints: 320,
        objectivePoints: 100,
        totalPoints: 420,
        currentStreak: 6,
        totalCheckins: 32,
        rank: 3,
        lastCheckin: new Date().toISOString(),
      },
    ]

    const stats: CommunityStats = {
      totalUsers: mockUsers.length,
      totalSelfCarePoints: mockUsers.reduce((sum, user) => sum + user.selfCarePoints, 0),
      totalObjectivePoints: mockUsers.reduce((sum, user) => sum + user.objectivePoints, 0),
      totalPoints: mockUsers.reduce((sum, user) => sum + user.totalPoints, 0),
      averagePointsPerUser: Math.round(mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) / mockUsers.length),
    }

    return { users: mockUsers, stats }
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length
  }

  isOffline(): boolean {
    return !this.isOnline
  }

  // Enhanced leaderboard with both point types
  static async getEnhancedLeaderboard(limit = 10): Promise<EnhancedLeaderboardEntry[]> {
    const service = HybridCommunityService.getInstance()
    const { users } = await service.getLeaderboard()

    return users
      .map((entry, index) => ({
        userId: entry.id,
        username: entry.username,
        walletAddress: entry.avatar || "",
        selfCarePoints: entry.selfCarePoints,
        careObjectivePoints: entry.objectivePoints,
        totalPoints: entry.totalPoints,
        currentStreak: entry.currentStreak,
        longestStreak: entry.totalCheckins, // Assuming longestStreak is the same as totalCheckins for simplicity
        level: Math.floor(entry.totalPoints / 100), // Simple level calculation
        totalCheckins: entry.totalCheckins,
        lastCheckin: entry.lastCheckin,
        rank: index + 1,
        objectives: [], // Objectives are not included in the leaderboard response
      }))
      .slice(0, limit)
  }

  // Get user's care objectives
  static async getUserObjectives(userId: string, status = "completed"): Promise<CareObjective[]> {
    if (!HybridCommunityService.getInstance().isOnline()) {
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
    walletAddress?: string
    objectiveType: string
    title: string
    description?: string
    points: number
    category?: string
    evidenceUrl?: string
  }): Promise<{ success: boolean; objective?: CareObjective; error?: string }> {
    const service = HybridCommunityService.getInstance()
    if (!service.isOnline()) {
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
    const objectives = await HybridCommunityService.getUserObjectives(userId)
    const careObjectivePoints = objectives.reduce((sum, obj) => sum + obj.points, 0)

    // Get self-care points from local storage
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
    walletAddress: string,
    emoji: keyof typeof MOOD_EMOJIS,
    gratitudeNote?: string,
    isGratitudePublic = false,
  ): Promise<{ success: boolean; points: number; newStreak: number; error?: string }> {
    const service = HybridCommunityService.getInstance()
    try {
      // Try API first
      const moodValue = MOOD_EMOJIS[emoji].value
      const moodLabel = MOOD_EMOJIS[emoji].label

      if (service.isOnline()) {
        const response = await fetch("/api/community/checkin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress,
            mood: moodValue,
            moodLabel,
            gratitudeNote,
            isGratitudePublic,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Also save to localStorage as backup
          await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)

          return {
            success: true,
            points: data.points || 0,
            newStreak: data.streak || 1,
          }
        }
      }

      // Fallback to localStorage
      const localResult = await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)
      return localResult
    } catch (error) {
      console.warn("API check-in failed, using localStorage:", error)
      // Fallback to localStorage
      return await LocalCheckInService.recordCheckIn(userId, emoji, gratitudeNote)
    }
  }

  // Subscribe to leaderboard updates (simple polling without EventEmitter2)
  static subscribeToLeaderboard(callback: (leaderboard: EnhancedLeaderboardEntry[]) => void) {
    const service = HybridCommunityService.getInstance()
    if (!service.isOnline()) {
      return { unsubscribe: () => {} }
    }

    // Set up polling for updates
    const interval = setInterval(async () => {
      const leaderboard = await HybridCommunityService.getEnhancedLeaderboard()
      callback(leaderboard)
    }, 30000) // Refresh every 30 seconds

    return {
      unsubscribe: () => clearInterval(interval),
    }
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

export const communityService = HybridCommunityService.getInstance()
