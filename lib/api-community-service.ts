export interface CommunityUser {
  id: string
  walletAddress: string
  username?: string
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
}

export interface CheckInRecord {
  id: string
  userId: string
  date: string
  mood: number
  moodLabel: string
  points: number
  streak: number
  gratitudeNote?: string
  createdAt: string
}

export interface LeaderboardEntry {
  userId: string
  username: string
  walletAddress: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  level: number
  totalCheckins: number
  lastCheckin?: string
  rank: number
}

export class APICommunityService {
  private static baseUrl = "/api/community"

  static async getOrCreateUser(
    walletAddress: string,
    username?: string,
  ): Promise<{ success: boolean; user?: CommunityUser; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, username }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error("Error creating user:", error)
      return { success: false, error: "Network error" }
    }
  }

  static async recordCheckIn(
    walletAddress: string,
    mood: number,
    moodLabel: string,
    gratitudeNote?: string,
  ): Promise<{ success: boolean; points?: number; streak?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, mood, moodLabel, gratitudeNote }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error }
      }

      return {
        success: true,
        points: data.points,
        streak: data.streak,
      }
    } catch (error) {
      console.error("Error recording check-in:", error)
      return { success: false, error: "Network error" }
    }
  }

  static async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`)
      const data = await response.json()

      if (!response.ok) {
        console.error("Error fetching leaderboard:", data.error)
        return []
      }

      return data.leaderboard || []
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }
  }

  static async getUserStats(userId: string): Promise<{ stats: UserStats | null; checkIns: CheckInRecord[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/${userId}`)
      const data = await response.json()

      if (!response.ok) {
        console.error("Error fetching user stats:", data.error)
        return { stats: null, checkIns: [] }
      }

      return {
        stats: data.stats
          ? {
              totalPoints: data.stats.total_points,
              currentStreak: data.stats.current_streak,
              longestStreak: data.stats.longest_streak,
              level: data.stats.level,
              totalCheckins: data.stats.total_checkins,
              lastCheckin: data.stats.last_checkin,
            }
          : null,
        checkIns: (data.checkIns || []).map((checkIn: any) => ({
          id: checkIn.id,
          userId: checkIn.user_id,
          date: checkIn.date,
          mood: checkIn.mood,
          moodLabel: checkIn.mood_label,
          points: checkIn.points,
          streak: checkIn.streak,
          gratitudeNote: checkIn.gratitude_note,
          createdAt: checkIn.created_at,
        })),
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return { stats: null, checkIns: [] }
    }
  }
}
