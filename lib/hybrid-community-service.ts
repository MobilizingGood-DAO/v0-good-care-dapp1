interface User {
  id: string
  username: string
  email?: string
  selfCarePoints: number
  objectivePoints: number
  totalPoints: number
  streak: number
  lastCheckin?: string
  checkins: number
  objectives: number
}

interface CheckinData {
  userId: string
  username: string
  mood: string
  gratitude: string
  isPublic?: boolean
  timestamp: string
}

interface ObjectiveData {
  userId: string
  username: string
  title: string
  description: string
  category: string
  points: number
}

interface LeaderboardStats {
  totalUsers: number
  totalSelfCarePoints: number
  totalObjectivePoints: number
  totalPoints: number
}

class HybridCommunityService {
  private isOnline = true
  private syncQueue: Array<{ type: string; data: any }> = []

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

  async getLeaderboard(): Promise<{ leaderboard: User[]; stats: LeaderboardStats }> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/leaderboard")
        if (response.ok) {
          const data = await response.json()
          // Cache the data locally
          if (typeof window !== "undefined") {
            localStorage.setItem("leaderboard_cache", JSON.stringify(data))
            localStorage.setItem("leaderboard_cache_time", Date.now().toString())
          }
          return data
        }
      } catch (error) {
        console.error("Error fetching online leaderboard:", error)
      }
    }

    // Fallback to cached data
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("leaderboard_cache")
      const cacheTime = localStorage.getItem("leaderboard_cache_time")

      if (cached && cacheTime) {
        const age = Date.now() - Number.parseInt(cacheTime)
        if (age < 5 * 60 * 1000) {
          // 5 minutes
          return JSON.parse(cached)
        }
      }
    }

    // Return demo data if no cache
    return this.getDemoLeaderboard()
  }

  async submitCheckin(data: CheckinData): Promise<boolean> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          return true
        }
      } catch (error) {
        console.error("Error submitting online checkin:", error)
      }
    }

    // Queue for later sync
    this.syncQueue.push({ type: "checkin", data })
    this.saveToLocalStorage("checkin", data)
    return true
  }

  async submitObjective(data: ObjectiveData): Promise<boolean> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/community/objectives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          return true
        }
      } catch (error) {
        console.error("Error submitting online objective:", error)
      }
    }

    // Queue for later sync
    this.syncQueue.push({ type: "objective", data })
    this.saveToLocalStorage("objective", data)
    return true
  }

  async getUserObjectives(userId: string): Promise<any[]> {
    if (this.isOnline) {
      try {
        const response = await fetch(`/api/community/objectives?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          return data.objectives || []
        }
      } catch (error) {
        console.error("Error fetching user objectives:", error)
      }
    }

    // Return local objectives
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`objectives_${userId}`)
      return stored ? JSON.parse(stored) : []
    }

    return []
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const queue = [...this.syncQueue]
    this.syncQueue = []

    for (const item of queue) {
      try {
        if (item.type === "checkin") {
          await this.submitCheckin(item.data)
        } else if (item.type === "objective") {
          await this.submitObjective(item.data)
        }
      } catch (error) {
        console.error("Error syncing item:", error)
        // Re-queue failed items
        this.syncQueue.push(item)
      }
    }
  }

  private saveToLocalStorage(type: string, data: any) {
    if (typeof window === "undefined") return

    const key = `${type}_queue`
    const existing = JSON.parse(localStorage.getItem(key) || "[]")
    existing.push({ ...data, timestamp: Date.now() })
    localStorage.setItem(key, JSON.stringify(existing))
  }

  private getDemoLeaderboard(): { leaderboard: User[]; stats: LeaderboardStats } {
    const demoUsers: User[] = [
      {
        id: "1",
        username: "alice_care",
        selfCarePoints: 245,
        objectivePoints: 175,
        totalPoints: 420,
        streak: 12,
        checkins: 15,
        objectives: 2,
      },
      {
        id: "2",
        username: "bob_wellness",
        selfCarePoints: 180,
        objectivePoints: 150,
        totalPoints: 330,
        streak: 8,
        checkins: 12,
        objectives: 2,
      },
      {
        id: "3",
        username: "carol_support",
        selfCarePoints: 165,
        objectivePoints: 100,
        totalPoints: 265,
        streak: 6,
        checkins: 11,
        objectives: 1,
      },
    ]

    const stats: LeaderboardStats = {
      totalUsers: demoUsers.length,
      totalSelfCarePoints: demoUsers.reduce((sum, user) => sum + user.selfCarePoints, 0),
      totalObjectivePoints: demoUsers.reduce((sum, user) => sum + user.objectivePoints, 0),
      totalPoints: demoUsers.reduce((sum, user) => sum + user.totalPoints, 0),
    }

    return { leaderboard: demoUsers, stats }
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length
  }

  isOffline(): boolean {
    return !this.isOnline
  }
}

export const hybridCommunityService = new HybridCommunityService()
