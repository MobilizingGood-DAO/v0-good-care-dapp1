// Hybrid Community Service - Handles online/offline scenarios with sync queue
// NO EventEmitter2 - uses simple polling and local storage

interface SyncQueueItem {
  id: string
  type: "checkin" | "objective_update"
  data: any
  timestamp: number
  retries: number
}

interface CommunityStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalCommunityPoints: number
  totalPoints: number
  averagePointsPerUser: number
  activeUsers: number
}

interface LeaderboardUser {
  id: string
  user_id: string
  username: string
  wallet_address: string
  avatar_url?: string
  self_care_points: number
  community_points: number
  total_points: number
  total_checkins: number
  current_streak: number
  recent_activity: string[]
  rank: number
  joined_at: string
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  stats: CommunityStats
  success: boolean
}

interface CheckinData {
  userId: string
  username: string
  mood: number
  gratitude?: string
  isPublic?: boolean
}

class HybridCommunityService {
  private syncQueue: SyncQueueItem[] = []
  private isOnline = true
  private syncInProgress = false
  private readonly STORAGE_KEY = "goodcare_sync_queue"
  private readonly CACHE_KEY = "goodcare_leaderboard_cache"
  private readonly MAX_RETRIES = 5

  constructor() {
    if (typeof window !== "undefined") {
      // Initialize online status
      this.isOnline = navigator.onLine

      // Listen for online/offline events
      window.addEventListener("online", () => {
        console.log("🌐 Back online - processing sync queue")
        this.isOnline = true
        this.processSyncQueue()
      })

      window.addEventListener("offline", () => {
        console.log("📴 Gone offline - queuing operations")
        this.isOnline = false
      })

      // Load sync queue from localStorage
      this.loadSyncQueue()

      // Process sync queue periodically
      setInterval(() => {
        if (this.isOnline && !this.syncInProgress && this.syncQueue.length > 0) {
          this.processSyncQueue()
        }
      }, 30000) // Every 30 seconds
    }
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.syncQueue = JSON.parse(stored)
        console.log("📦 Loaded sync queue:", this.syncQueue.length, "items")
      }
    } catch (error) {
      console.error("❌ Error loading sync queue:", error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("❌ Error saving sync queue:", error)
    }
  }

  private addToSyncQueue(type: "checkin" | "objective_update", data: any) {
    const item: SyncQueueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    }

    this.syncQueue.push(item)
    this.saveSyncQueue()

    console.log("📝 Added to sync queue:", item.id, type)

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  private async processSyncQueue() {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return
    }

    this.syncInProgress = true
    console.log("🔄 Processing sync queue:", this.syncQueue.length, "items")

    try {
      const itemsToProcess = [...this.syncQueue]

      for (const item of itemsToProcess) {
        try {
          let success = false

          if (item.type === "checkin") {
            success = await this.syncCheckin(item.data)
          } else if (item.type === "objective_update") {
            success = await this.syncObjectiveUpdate(item.data)
          }

          if (success) {
            // Remove from queue
            this.syncQueue = this.syncQueue.filter((queueItem) => queueItem.id !== item.id)
            console.log("✅ Synced:", item.id)
          } else {
            // Increment retry count
            const queueItem = this.syncQueue.find((queueItem) => queueItem.id === item.id)
            if (queueItem) {
              queueItem.retries++
              if (queueItem.retries >= this.MAX_RETRIES) {
                console.error("❌ Max retries reached for:", item.id)
                this.syncQueue = this.syncQueue.filter((queueItem) => queueItem.id !== item.id)
              }
            }
          }
        } catch (error) {
          console.error("💥 Error processing sync item:", item.id, error)
          const queueItem = this.syncQueue.find((queueItem) => queueItem.id === item.id)
          if (queueItem) {
            queueItem.retries++
            if (queueItem.retries >= this.MAX_RETRIES) {
              this.syncQueue = this.syncQueue.filter((queueItem) => queueItem.id !== item.id)
            }
          }
        }
      }

      this.saveSyncQueue()
    } finally {
      this.syncInProgress = false
      console.log("🏁 Sync queue processed. Remaining:", this.syncQueue.length)
    }
  }

  private async syncCheckin(data: CheckinData): Promise<boolean> {
    try {
      const response = await fetch("/api/community/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error("❌ Error syncing checkin:", error)
      return false
    }
  }

  private async syncObjectiveUpdate(data: any): Promise<boolean> {
    try {
      const response = await fetch("/api/community/objectives", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error("❌ Error syncing objective update:", error)
      return false
    }
  }

  // PUBLIC METHODS - These are the methods used by components

  async getLeaderboard(): Promise<LeaderboardData | null> {
    try {
      console.log("🏆 Fetching leaderboard data...")

      if (!this.isOnline) {
        // Return cached data if offline
        const cached = localStorage.getItem(this.CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          // Use cache if less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log("📦 Using cached leaderboard data (offline)")
            return data
          }
        }
        console.log("📴 Offline and no valid cache available")
        return null
      }

      const response = await fetch("/api/community/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error("❌ Leaderboard API error:", response.status, response.statusText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        console.error("❌ API returned error:", result.error)
        throw new Error(result.error)
      }

      // Cache the successful response
      localStorage.setItem(
        this.CACHE_KEY,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        }),
      )

      console.log("✅ Leaderboard data fetched successfully:", {
        users: result.leaderboard?.length || 0,
        stats: result.stats,
        success: result.success,
      })

      return result
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error)

      // Try to return cached data as fallback
      try {
        const cached = localStorage.getItem(this.CACHE_KEY)
        if (cached) {
          const { data } = JSON.parse(cached)
          console.log("📦 Using cached leaderboard data as fallback")
          return data
        }
      } catch (cacheError) {
        console.error("❌ Error reading cache:", cacheError)
      }

      return null
    }
  }

  async submitCheckin(data: CheckinData): Promise<{ success: boolean; message: string; offline?: boolean }> {
    try {
      console.log("📝 Submitting check-in:", data.userId)

      if (!this.isOnline) {
        // Add to sync queue for later
        this.addToSyncQueue("checkin", data)
        return {
          success: true,
          offline: true,
          message: "Check-in saved offline. Will sync when connection is restored.",
        }
      }

      const response = await fetch("/api/community/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Check-in submitted successfully")

      return {
        success: true,
        message: result.message || "Check-in successful!",
      }
    } catch (error) {
      console.error("❌ Error submitting check-in:", error)

      // Add to sync queue as fallback
      this.addToSyncQueue("checkin", data)

      return {
        success: false,
        offline: true,
        message: "Check-in saved offline. Will sync when connection is restored.",
      }
    }
  }

  async updateObjective(
    objectiveId: string,
    updates: any,
  ): Promise<{ success: boolean; message: string; offline?: boolean }> {
    const data = { objectiveId, ...updates }

    try {
      console.log("🎯 Updating objective:", objectiveId)

      if (!this.isOnline) {
        this.addToSyncQueue("objective_update", data)
        return {
          success: true,
          offline: true,
          message: "Update saved offline. Will sync when connection is restored.",
        }
      }

      const response = await fetch("/api/community/objectives", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Objective updated successfully")

      return {
        success: true,
        message: result.message || "Objective updated successfully!",
      }
    } catch (error) {
      console.error("❌ Error updating objective:", error)

      this.addToSyncQueue("objective_update", data)

      return {
        success: false,
        offline: true,
        message: "Update saved offline. Will sync when connection is restored.",
      }
    }
  }

  getSyncQueueStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
    }
  }

  clearSyncQueue() {
    this.syncQueue = []
    this.saveSyncQueue()
    console.log("🗑️ Sync queue cleared")
  }

  // Clear cache (useful for debugging)
  clearCache() {
    localStorage.removeItem(this.CACHE_KEY)
    console.log("🗑️ Cache cleared")
  }
}

// Export singleton instance - THIS IS THE KEY EXPORT!
export const hybridCommunityService = new HybridCommunityService()

// Also export the types for use in components
export type { LeaderboardData, LeaderboardUser, CommunityStats, CheckinData }
