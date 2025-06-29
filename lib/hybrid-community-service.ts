interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  streak: number
  totalPoints: number
  selfCarePoints: number
  objectivePoints: number
  lastCheckin?: string
  joinedAt: string
}

interface CheckinData {
  userId: string
  username: string
  mood: string
  gratitude?: string
  isPublic?: boolean
  timestamp: string
}

interface ObjectiveData {
  id?: string
  userId: string
  username: string
  title: string
  description?: string
  category: "mentorship" | "content" | "support" | "events"
  points: number
  status: "active" | "completed" | "archived"
  completedAt?: string
}

interface LeaderboardEntry {
  username: string
  selfCarePoints: number
  objectivePoints: number
  totalPoints: number
  streak: number
  checkins: number
  objectives: number
  recentDays: boolean[]
}

interface CommunityStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
  averageStreak: number
}

class HybridCommunityService {
  private isOnline = true
  private syncQueue: Array<{ type: string; data: any; timestamp: string }> = []

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      window.addEventListener("online", () => {
        this.isOnline = true
        this.processSyncQueue()
      })
      window.addEventListener("offline", () => {
        this.isOnline = false
      })
    }
  }

  // Check-in methods
  async submitCheckin(data: CheckinData): Promise<{ success: boolean; error?: string }> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Failed to submit check-in")
        }

        return { success: true }
      } catch (error) {
        console.error("Online checkin failed:", error)
        this.queueForSync("checkin", data)
        return { success: false, error: "Saved offline - will sync when online" }
      }
    } else {
      this.queueForSync("checkin", data)
      return { success: false, error: "Offline - saved for later sync" }
    }
  }

  // Objective methods
  async createObjective(data: ObjectiveData): Promise<{ success: boolean; objective?: ObjectiveData; error?: string }> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/objectives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Failed to create objective")
        }

        const result = await response.json()
        return { success: true, objective: result.objective }
      } catch (error) {
        console.error("Online objective creation failed:", error)
        this.queueForSync("objective", data)
        return { success: false, error: "Saved offline - will sync when online" }
      }
    } else {
      this.queueForSync("objective", data)
      return { success: false, error: "Offline - saved for later sync" }
    }
  }

  async updateObjective(
    id: string,
    status: string,
    completedAt?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const updateData = { id, status, completedAt }

    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/objectives", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          throw new Error("Failed to update objective")
        }

        return { success: true }
      } catch (error) {
        console.error("Online objective update failed:", error)
        this.queueForSync("objective_update", updateData)
        return { success: false, error: "Saved offline - will sync when online" }
      }
    } else {
      this.queueForSync("objective_update", updateData)
      return { success: false, error: "Offline - saved for later sync" }
    }
  }

  async getObjectives(userId?: string, status = "active"): Promise<{ objectives: ObjectiveData[]; error?: string }> {
    if (this.isOnline) {
      try {
        const params = new URLSearchParams({ status })
        if (userId) params.append("userId", userId)

        const response = await fetch(`/api/community/objectives?${params}`)
        if (!response.ok) {
          throw new Error("Failed to fetch objectives")
        }

        const result = await response.json()
        return { objectives: result.objectives || [] }
      } catch (error) {
        console.error("Failed to fetch objectives:", error)
        return { objectives: [], error: "Failed to load objectives" }
      }
    } else {
      return { objectives: [], error: "Offline - objectives not available" }
    }
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<{
    leaderboard: LeaderboardEntry[]
    stats: CommunityStats
    lastUpdated: string
    error?: string
  }> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/leaderboard")
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }

        const result = await response.json()
        return {
          leaderboard: result.leaderboard || [],
          stats: result.stats || this.getDefaultStats(),
          lastUpdated: result.lastUpdated || new Date().toISOString(),
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
        return {
          leaderboard: [],
          stats: this.getDefaultStats(),
          lastUpdated: new Date().toISOString(),
          error: "Failed to load leaderboard",
        }
      }
    } else {
      return {
        leaderboard: [],
        stats: this.getDefaultStats(),
        lastUpdated: new Date().toISOString(),
        error: "Offline - leaderboard not available",
      }
    }
  }

  // User methods
  async getUsers(): Promise<{ users: User[]; error?: string }> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const result = await response.json()
        return { users: result.users || [] }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        return { users: [], error: "Failed to load users" }
      }
    } else {
      return { users: [], error: "Offline - users not available" }
    }
  }

  async getUserStats(userId: string): Promise<{ stats: any; error?: string }> {
    if (this.isOnline) {
      try {
        const response = await fetch(`/api/community/stats/${userId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user stats")
        }

        const result = await response.json()
        return { stats: result.stats || {} }
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
        return { stats: {}, error: "Failed to load user stats" }
      }
    } else {
      return { stats: {}, error: "Offline - stats not available" }
    }
  }

  // Sync methods
  private queueForSync(type: string, data: any) {
    this.syncQueue.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    })

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("community_sync_queue", JSON.stringify(this.syncQueue))
    }
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const queue = [...this.syncQueue]
    this.syncQueue = []

    for (const item of queue) {
      try {
        switch (item.type) {
          case "checkin":
            await this.submitCheckin(item.data)
            break
          case "objective":
            await this.createObjective(item.data)
            break
          case "objective_update":
            await this.updateObjective(item.data.id, item.data.status, item.data.completedAt)
            break
        }
      } catch (error) {
        console.error("Failed to sync item:", item, error)
        // Re-queue failed items
        this.syncQueue.push(item)
      }
    }

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("community_sync_queue", JSON.stringify(this.syncQueue))
    }
  }

  private getDefaultStats(): CommunityStats {
    return {
      totalUsers: 0,
      totalSelfCarePoints: 0,
      totalObjectivePoints: 0,
      totalPoints: 0,
      averageStreak: 0,
    }
  }

  // Utility methods
  isOnlineMode(): boolean {
    return this.isOnline
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length
  }

  clearSyncQueue(): void {
    this.syncQueue = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("community_sync_queue")
    }
  }
}

export const hybridCommunityService = new HybridCommunityService()
export default hybridCommunityService
