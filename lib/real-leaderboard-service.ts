import { supabase } from "./supabase"

export interface LeaderboardEntry {
  userId: string
  username: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  rank: number
}

export interface UserRankInfo {
  userRank: number
  totalUsers: number
  nearbyUsers: LeaderboardEntry[]
}

export class RealLeaderboardService {
  // Get global leaderboard from user_stats table
  static async getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select(`
          total_points,
          current_streak,
          longest_streak,
          user_id,
          users!inner(username, id)
        `)
        .order("total_points", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching leaderboard:", error)
        return []
      }

      return (data || []).map((entry, index) => ({
        userId: entry.user_id,
        username: entry.users.username || `User_${entry.user_id.slice(-6)}`,
        totalPoints: entry.total_points,
        currentStreak: entry.current_streak,
        longestStreak: entry.longest_streak,
        rank: index + 1,
      }))
    } catch (error) {
      console.error("Error in getGlobalLeaderboard:", error)
      return []
    }
  }

  // Get user's rank and nearby users
  static async getUserRankAndNearby(userId: string, nearbyCount = 3): Promise<UserRankInfo> {
    try {
      // First get all users ordered by points to calculate rank
      const { data: allUsers, error: rankError } = await supabase
        .from("user_stats")
        .select("user_id, total_points")
        .order("total_points", { ascending: false })

      if (rankError) {
        console.error("Error fetching user ranks:", rankError)
        return { userRank: 0, totalUsers: 0, nearbyUsers: [] }
      }

      const userIndex = allUsers.findIndex((user) => user.user_id === userId)
      const userRank = userIndex >= 0 ? userIndex + 1 : 0
      const totalUsers = allUsers.length

      // Get nearby users (users around the current user's rank)
      const startIndex = Math.max(0, userIndex - nearbyCount)
      const endIndex = Math.min(allUsers.length - 1, userIndex + nearbyCount)

      const nearbyUserIds = allUsers.slice(startIndex, endIndex + 1).map((user) => user.user_id)

      const { data: nearbyData, error: nearbyError } = await supabase
        .from("user_stats")
        .select(`
          total_points,
          current_streak,
          longest_streak,
          user_id,
          users!inner(username, id)
        `)
        .in("user_id", nearbyUserIds)
        .order("total_points", { ascending: false })

      if (nearbyError) {
        console.error("Error fetching nearby users:", nearbyError)
        return { userRank, totalUsers, nearbyUsers: [] }
      }

      const nearbyUsers = (nearbyData || []).map((entry, index) => ({
        userId: entry.user_id,
        username: entry.users.username || `User_${entry.user_id.slice(-6)}`,
        totalPoints: entry.total_points,
        currentStreak: entry.current_streak,
        longestStreak: entry.longest_streak,
        rank: startIndex + index + 1,
      }))

      return { userRank, totalUsers, nearbyUsers }
    } catch (error) {
      console.error("Error in getUserRankAndNearby:", error)
      return { userRank: 0, totalUsers: 0, nearbyUsers: [] }
    }
  }

  // Get user's personal stats
  static async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("Error fetching user stats:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getUserStats:", error)
      return null
    }
  }
}
