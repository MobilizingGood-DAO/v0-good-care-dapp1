interface User {
  username: string
  selfCarePoints: number
  communityPoints: number
  totalPoints: number
  streak: number
  checkins: number
  lastCheckin: string
  level: number
  rank: number
}

interface CommunityStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalCommunityPoints: number
  totalPoints: number
  averagePointsPerUser: number
}

interface LeaderboardData {
  leaderboard: User[]
  stats: CommunityStats
  success: boolean
}

interface CheckinData {
  username: string
  mood: string
  gratitude: string
  isPublic?: boolean
}

interface CareObjective {
  id: string
  username: string
  title: string
  description: string
  category: "mentorship" | "content" | "support" | "events"
  points: number
  status: "assigned" | "active" | "completed" | "verified"
  evidence_url?: string
  assigned_at: string
  started_at?: string
  completed_at?: string
  verified_at?: string
}

class HybridCommunityService {
  private syncQueue: Array<{ type: string; data: any; timestamp: number }> = []
  private isOnline = true
  private syncInProgress = false

  constructor() {
    if (typeof window !== "undefined") {
      // Monitor online status
      this.isOnline = navigator.onLine

      window.addEventListener("online", () => {
        this.isOnline = true
        this.processSyncQueue()
      })

      window.addEventListener("offline", () => {
        this.isOnline = false
      })

      // Load sync queue from localStorage
      this.loadSyncQueue()
    }
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem("community_sync_queue")
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error loading sync queue:", error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem("community_sync_queue", JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("Error saving sync queue:", error)
    }
  }

  private addToSyncQueue(type: string, data: any) {
    this.syncQueue.push({
      type,
      data,
      timestamp: Date.now(),
    })
    this.saveSyncQueue()
  }

  private async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return
    }

    this.syncInProgress = true

    try {
      const processedItems: number[] = []

      for (let i = 0; i < this.syncQueue.length; i++) {
        const item = this.syncQueue[i]

        try {
          if (item.type === "checkin") {
            await this.submitCheckinOnline(item.data)
          } else if (item.type === "objective_update") {
            await this.updateObjectiveOnline(item.data)
          }

          processedItems.push(i)
        } catch (error) {
          console.error(`Failed to sync ${item.type}:`, error)
          // Keep failed items in queue for retry
        }
      }

      // Remove successfully processed items
      this.syncQueue = this.syncQueue.filter((_, index) => !processedItems.includes(index))
      this.saveSyncQueue()
    } catch (error) {
      console.error("Error processing sync queue:", error)
    } finally {
      this.syncInProgress = false
    }
  }

  async getLeaderboard(): Promise<LeaderboardData> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/leaderboard")
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }
        const data = await response.json()

        // Cache the data locally
        localStorage.setItem(
          "cached_leaderboard",
          JSON.stringify({
            data,
            timestamp: Date.now(),
          }),
        )

        return data
      } catch (error) {
        console.error("Error fetching online leaderboard:", error)
        return this.getCachedLeaderboard()
      }
    } else {
      return this.getCachedLeaderboard()
    }
  }

  private getCachedLeaderboard(): LeaderboardData {
    try {
      const cached = localStorage.getItem("cached_leaderboard")
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Use cached data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data
        }
      }
    } catch (error) {
      console.error("Error loading cached leaderboard:", error)
    }

    // Return default empty leaderboard
    return {
      leaderboard: [],
      stats: {
        totalUsers: 0,
        totalSelfCarePoints: 0,
        totalCommunityPoints: 0,
        totalPoints: 0,
        averagePointsPerUser: 0,
      },
      success: false,
    }
  }

  async submitCheckin(data: CheckinData): Promise<{ success: boolean; message: string }> {
    if (this.isOnline) {
      try {
        return await this.submitCheckinOnline(data)
      } catch (error) {
        console.error("Online checkin failed, queuing for later:", error)
        this.addToSyncQueue("checkin", data)
        return {
          success: true,
          message: "Check-in saved offline. Will sync when online.",
        }
      }
    } else {
      this.addToSyncQueue("checkin", data)
      return {
        success: true,
        message: "Check-in saved offline. Will sync when online.",
      }
    }
  }

  private async submitCheckinOnline(data: CheckinData): Promise<{ success: boolean; message: string }> {
    const response = await fetch("/api/community/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to submit check-in")
    }

    const result = await response.json()
    return result
  }

  async getUserObjectives(username: string): Promise<{ objectives: CareObjective[]; success: boolean }> {
    if (this.isOnline) {
      try {
        const response = await fetch(`/api/community/objectives?username=${encodeURIComponent(username)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch objectives")
        }
        return await response.json()
      } catch (error) {
        console.error("Error fetching user objectives:", error)
        return { objectives: [], success: false }
      }
    } else {
      return { objectives: [], success: false }
    }
  }

  async updateObjective(
    id: string,
    status: string,
    evidence_url?: string,
    username?: string,
  ): Promise<{ success: boolean; message: string }> {
    const data = { id, status, evidence_url, username }

    if (this.isOnline) {
      try {
        return await this.updateObjectiveOnline(data)
      } catch (error) {
        console.error("Online objective update failed, queuing for later:", error)
        this.addToSyncQueue("objective_update", data)
        return {
          success: true,
          message: "Objective update saved offline. Will sync when online.",
        }
      }
    } else {
      this.addToSyncQueue("objective_update", data)
      return {
        success: true,
        message: "Objective update saved offline. Will sync when online.",
      }
    }
  }

  private async updateObjectiveOnline(data: any): Promise<{ success: boolean; message: string }> {
    const response = await fetch("/api/community/objectives", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update objective")
    }

    const result = await response.json()
    return result
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length
  }

  isOffline(): boolean {
    return !this.isOnline
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue()
    }
  }
}

// Export singleton instance
export const hybridCommunityService = new HybridCommunityService()
export default hybridCommunityService
