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
  reflection?: string
  points: number
}

// Sync queue item for offline support
interface SyncQueueItem {
  id: string
  type: "checkin" | "objective"
  data: any
  timestamp: number
  retries: number
}

class HybridCommunityService {
  private supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  private syncQueue: SyncQueueItem[] = []
  private isOnline = true
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Initialize from localStorage
    if (typeof window !== "undefined") {
      this.loadSyncQueue()
      this.setupOnlineListener()
      this.startSyncProcess()
    }
  }

  private setupOnlineListener() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Back online - processing sync queue")
        this.isOnline = true
        this.processSyncQueue()
      })

      window.addEventListener("offline", () => {
        console.log("📴 Gone offline - queuing operations")
        this.isOnline = false
      })

      this.isOnline = navigator.onLine
    }
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem("goodcare_sync_queue")
      if (stored) {
        this.syncQueue = JSON.parse(stored)
        console.log(`📦 Loaded ${this.syncQueue.length} items from sync queue`)
      }
    } catch (error) {
      console.error("Failed to load sync queue:", error)
      this.syncQueue = []
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem("goodcare_sync_queue", JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("Failed to save sync queue:", error)
    }
  }

  private startSyncProcess() {
    // Process sync queue every 30 seconds
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000)
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    console.log(`🔄 Processing ${this.syncQueue.length} queued operations`)

    const itemsToProcess = [...this.syncQueue]
    this.syncQueue = []

    for (const item of itemsToProcess) {
      try {
        if (item.type === "checkin") {
          await this.submitCheckinToAPI(item.data)
          console.log(`✅ Synced checkin for user ${item.data.userId}`)
        } else if (item.type === "objective") {
          await this.updateObjectiveToAPI(item.data)
          console.log(`✅ Synced objective update ${item.data.objectiveId}`)
        }
      } catch (error) {
        console.error(`❌ Failed to sync ${item.type}:`, error)

        // Retry logic
        if (item.retries < 3) {
          item.retries++
          this.syncQueue.push(item)
          console.log(`🔄 Queued ${item.type} for retry (attempt ${item.retries})`)
        } else {
          console.error(`💀 Giving up on ${item.type} after 3 retries`)
        }
      }
    }

    this.saveSyncQueue()
  }

  // Main leaderboard method
  async getLeaderboard(): Promise<LeaderboardData> {
    console.log("🏆 Fetching leaderboard data...")

    // Check cache first
    const cacheKey = "leaderboard"
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log("📋 Returning cached leaderboard data")
      return cached.data
    }

    try {
      const response = await fetch("/api/community/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: LeaderboardData = await response.json()
      console.log(`✅ Fetched leaderboard: ${data.users.length} users, ${data.stats.totalPoints} total points`)

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      console.error("❌ Failed to fetch leaderboard:", error)

      // Return cached data if available, otherwise empty structure
      if (cached) {
        console.log("📋 Returning stale cached data due to error")
        return cached.data
      }

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

  // Submit check-in
  async submitCheckin(checkinData: CheckinData): Promise<boolean> {
    console.log(`📝 Submitting checkin for user ${checkinData.userId}`)

    if (this.isOnline) {
      try {
        await this.submitCheckinToAPI(checkinData)
        console.log("✅ Checkin submitted successfully")
        return true
      } catch (error) {
        console.error("❌ Failed to submit checkin online, queuing for later:", error)
        this.queueOperation("checkin", checkinData)
        return false
      }
    } else {
      console.log("📴 Offline - queuing checkin for later sync")
      this.queueOperation("checkin", checkinData)
      return false
    }
  }

  private async submitCheckinToAPI(checkinData: CheckinData) {
    const response = await fetch("/api/community/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkinData),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit checkin: ${response.statusText}`)
    }

    return response.json()
  }

  // Update objective
  async updateObjective(objectiveId: string, updates: any): Promise<boolean> {
    console.log(`🎯 Updating objective ${objectiveId}`)

    const updateData = { objectiveId, ...updates }

    if (this.isOnline) {
      try {
        await this.updateObjectiveToAPI(updateData)
        console.log("✅ Objective updated successfully")
        return true
      } catch (error) {
        console.error("❌ Failed to update objective online, queuing for later:", error)
        this.queueOperation("objective", updateData)
        return false
      }
    } else {
      console.log("📴 Offline - queuing objective update for later sync")
      this.queueOperation("objective", updateData)
      return false
    }
  }

  private async updateObjectiveToAPI(updateData: any) {
    const response = await fetch("/api/community/objectives", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update objective: ${response.statusText}`)
    }

    return response.json()
  }

  private queueOperation(type: "checkin" | "objective", data: any) {
    const item: SyncQueueItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    }

    this.syncQueue.push(item)
    this.saveSyncQueue()
    console.log(`📦 Queued ${type} operation (${this.syncQueue.length} total in queue)`)
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      lastSync: this.syncQueue.length > 0 ? Math.max(...this.syncQueue.map((item) => item.timestamp)) : Date.now(),
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
    console.log("🗑️ Cache cleared")
  }
}

// Export singleton instance
export const hybridCommunityService = new HybridCommunityService()

// Export types for use in components
export type { LeaderboardData, LeaderboardUser, CommunityStats, CheckinData }
