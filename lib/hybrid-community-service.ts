import { createClient } from "@supabase/supabase-js"

// Types
export interface LeaderboardUser {
  id: string
  username: string
  avatar_url?: string
  selfCarePoints: number
  communityPoints: number
  totalPoints: number
  rank: number
  streak: number
  recentActivity: boolean[]
}

export interface CommunityStats {
  totalUsers: number
  totalPoints: number
  averagePoints: number
  activeToday: number
}

export interface LeaderboardData {
  users: LeaderboardUser[]
  stats: CommunityStats
}

export interface CheckinData {
  userId: string
  mood: string
  gratitude?: string
  selfCarePoints: number
}

// Hybrid Community Service Class
class HybridCommunityService {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  private syncQueue: any[] = []
  private isOnline = true
  private cache = new Map<string, any>()

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeOfflineSupport()
    }
  }

  private initializeOfflineSupport() {
    // Monitor online/offline status
    window.addEventListener("online", () => {
      console.log("🌐 Back online - processing sync queue")
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      console.log("📴 Gone offline - queuing operations")
      this.isOnline = false
    })

    // Load cached data on startup
    this.loadCachedData()
  }

  private loadCachedData() {
    try {
      const cached = localStorage.getItem("goodcare_cache")
      if (cached) {
        const data = JSON.parse(cached)
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value)
        })
        console.log("📦 Loaded cached data:", this.cache.size, "items")
      }
    } catch (error) {
      console.error("❌ Error loading cached data:", error)
    }
  }

  private saveToCache(key: string, data: any) {
    this.cache.set(key, data)
    try {
      const cacheObj = Object.fromEntries(this.cache)
      localStorage.setItem("goodcare_cache", JSON.stringify(cacheObj))
    } catch (error) {
      console.error("❌ Error saving to cache:", error)
    }
  }

  private async processSyncQueue() {
    if (this.syncQueue.length === 0) return

    console.log("🔄 Processing sync queue:", this.syncQueue.length, "items")

    const queue = [...this.syncQueue]
    this.syncQueue = []

    for (const operation of queue) {
      try {
        switch (operation.type) {
          case "checkin":
            await this.submitCheckin(operation.data)
            break
          case "objective":
            await this.updateObjective(operation.data)
            break
        }
      } catch (error) {
        console.error("❌ Sync operation failed:", error)
        // Re-queue failed operations
        this.syncQueue.push(operation)
      }
    }
  }

  async getLeaderboard(): Promise<LeaderboardData> {
    console.log("🏆 Fetching leaderboard data...")

    try {
      const response = await fetch("/api/community/leaderboard")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Leaderboard data received:", data)

      // Cache the successful response
      this.saveToCache("leaderboard", data)

      return data
    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error)

      // Return cached data if available
      const cached = this.cache.get("leaderboard")
      if (cached) {
        console.log("📦 Using cached leaderboard data")
        return cached
      }

      // Return empty data structure as fallback
      return {
        users: [],
        stats: {
          totalUsers: 0,
          totalPoints: 0,
          averagePoints: 0,
          activeToday: 0,
        },
      }
    }
  }

  async submitCheckin(data: CheckinData): Promise<boolean> {
    console.log("📝 Submitting check-in:", data)

    if (!this.isOnline) {
      console.log("📴 Offline - queuing check-in")
      this.syncQueue.push({ type: "checkin", data })
      return true
    }

    try {
      const response = await fetch("/api/community/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      console.log("✅ Check-in submitted successfully")
      return true
    } catch (error) {
      console.error("❌ Error submitting check-in:", error)

      // Queue for later if online but failed
      if (this.isOnline) {
        this.syncQueue.push({ type: "checkin", data })
      }

      return false
    }
  }

  async updateObjective(data: any): Promise<boolean> {
    console.log("🎯 Updating objective:", data)

    if (!this.isOnline) {
      console.log("📴 Offline - queuing objective update")
      this.syncQueue.push({ type: "objective", data })
      return true
    }

    try {
      const response = await fetch("/api/community/objectives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      console.log("✅ Objective updated successfully")
      return true
    } catch (error) {
      console.error("❌ Error updating objective:", error)

      // Queue for later if online but failed
      if (this.isOnline) {
        this.syncQueue.push({ type: "objective", data })
      }

      return false
    }
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      cacheSize: this.cache.size,
    }
  }
}

// Export singleton instance
export const hybridCommunityService = new HybridCommunityService()
export type { LeaderboardData, LeaderboardUser, CommunityStats, CheckinData }
