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
  averagePoints: number
}

interface LeaderboardUser {
  user_id: string
  username: string
  avatar_url?: string
  selfCarePoints: number
  communityPoints: number
  totalPoints: number
  checkInCount: number
  objectiveCount: number
  rank: number
  lastActivity?: string
}

class HybridCommunityService {
  private syncQueue: SyncQueueItem[] = []
  private isOnline = true
  private syncInProgress = false
  private readonly STORAGE_KEY = "goodcare_sync_queue"
  private readonly CACHE_KEY = "goodcare_leaderboard_cache"
  private readonly MAX_RETRIES = 3

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    // Load sync queue from localStorage
    this.loadSyncQueue()

    // Monitor online status
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine

      window.addEventListener("online", () => {
        console.log("🌐 Back online - processing sync queue")
        this.isOnline = true
        this.processSyncQueue()
      })

      window.addEventListener("offline", () => {
        console.log("📴 Gone offline - queuing operations")
        this.isOnline = false
      })

      // Process sync queue periodically
      setInterval(() => {
        if (this.isOnline && this.syncQueue.length > 0) {
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

  private addToSyncQueue(type: SyncQueueItem["type"], data: any) {
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

    // Try to process immediately if online
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

    const itemsToProcess = [...this.syncQueue]

    for (const item of itemsToProcess) {
      try {
        let success = false

        switch (item.type) {
          case "checkin":
            success = await this.syncCheckin(item.data)
            break
          case "objective_update":
            success = await this.syncObjectiveUpdate(item.data)
            break
        }

        if (success) {
          // Remove from queue
          this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id)
          console.log("✅ Synced:", item.id)
        } else {
          // Increment retry count
          item.retries++
          if (item.retries >= this.MAX_RETRIES) {
            console.error("❌ Max retries reached for:", item.id)
            this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id)
          }
        }
      } catch (error) {
        console.error("💥 Error processing sync item:", item.id, error)
        item.retries++
        if (item.retries >= this.MAX_RETRIES) {
          this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id)
        }
      }
    }

    this.saveSyncQueue()
    this.syncInProgress = false

    console.log("🏁 Sync queue processed. Remaining:", this.syncQueue.length)
  }

  private async syncCheckin(data: any): Promise<boolean> {
    try {
      const response = await fetch("/api/community/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.ok
    } catch (error) {
      console.error("❌ Error syncing check-in:", error)
      return false
    }
  }

  private async syncObjectiveUpdate(data: any): Promise<boolean> {
    try {
      const response = await fetch("/api/community/objectives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.ok
    } catch (error) {
      console.error("❌ Error syncing objective update:", error)
      return false
    }
  }

  // Public methods
  async submitCheckin(userId: string, mood: number, gratitude?: string, isPublic = false) {
    const data = { userId, mood, gratitude, isPublic }

    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          const result = await response.json()
          console.log("✅ Check-in submitted online:", result)
          return result
        } else {
          throw new Error("Network request failed")
        }
      } catch (error) {
        console.log("📴 Check-in failed, adding to queue:", error)
        this.addToSyncQueue("checkin", data)
        return {
          success: true,
          offline: true,
          message: "Check-in saved offline. Will sync when online.",
        }
      }
    } else {
      this.addToSyncQueue("checkin", data)
      return {
        success: true,
        offline: true,
        message: "Check-in saved offline. Will sync when online.",
      }
    }
  }

  async updateObjective(objectiveId: string, userId: string, status?: string, evidence?: string) {
    const data = { objectiveId, userId, status, evidence }

    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/objectives", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          const result = await response.json()
          console.log("✅ Objective updated online:", result)
          return result
        } else {
          throw new Error("Network request failed")
        }
      } catch (error) {
        console.log("📴 Objective update failed, adding to queue:", error)
        this.addToSyncQueue("objective_update", data)
        return {
          success: true,
          offline: true,
          message: "Update saved offline. Will sync when online.",
        }
      }
    } else {
      this.addToSyncQueue("objective_update", data)
      return {
        success: true,
        offline: true,
        message: "Update saved offline. Will sync when online.",
      }
    }
  }

  async getLeaderboard(): Promise<{ leaderboard: LeaderboardUser[]; stats: CommunityStats }> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/leaderboard")
        if (response.ok) {
          const data = await response.json()
          // Cache the result
          localStorage.setItem(
            this.CACHE_KEY,
            JSON.stringify({
              data,
              timestamp: Date.now(),
            }),
          )
          return data
        }
      } catch (error) {
        console.error("❌ Error fetching leaderboard:", error)
      }
    }

    // Fallback to cached data
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp

        // Use cached data if less than 5 minutes old
        if (age < 5 * 60 * 1000) {
          console.log("📦 Using cached leaderboard data")
          return data
        }
      }
    } catch (error) {
      console.error("❌ Error loading cached leaderboard:", error)
    }

    // Return empty data if no cache available
    return {
      leaderboard: [],
      stats: {
        totalUsers: 0,
        totalSelfCarePoints: 0,
        totalCommunityPoints: 0,
        averagePoints: 0,
      },
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
}

// Export singleton instance
export const hybridCommunityService = new HybridCommunityService()
