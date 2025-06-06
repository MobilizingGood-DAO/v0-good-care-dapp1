import { supabase } from "./supabase"

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  totalPoints: number
  currentStreak: number
  currentMultiplier: number
  avatarUrl?: string
  isCurrentUser?: boolean
}

export interface LeaderboardStats {
  totalUsers: number
  averagePoints: number
  topStreak: number
}

export class LeaderboardService {
  // Get global leaderboard
  static async getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    try {
      const { data: leaderboardData, error } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          total_points,
          current_streak,
          current_multiplier,
          users!inner(username, avatar_url)
        `)
        .order("total_points", { ascending: false })
        .limit(limit)

      if (error) throw error

      return leaderboardData.map((entry: any, index: number) => ({
        rank: index + 1,
        userId: entry.user_id,
        username: entry.users.username,
        totalPoints: entry.total_points,
        currentStreak: entry.current_streak,
        currentMultiplier: entry.current_multiplier,
        avatarUrl: entry.users.avatar_url,
      }))
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }
  }

  // Get user's rank and nearby users
  static async getUserRankAndNearby(
    userId: string,
    range = 5,
  ): Promise<{
    userRank: number
    userEntry: LeaderboardEntry | null
    nearbyUsers: LeaderboardEntry[]
  }> {
    try {
      // Get user's total points
      const { data: userStats } = await supabase
        .from("user_stats")
        .select("total_points")
        .eq("user_id", userId)
        .single()

      if (!userStats) {
        return { userRank: 0, userEntry: null, nearbyUsers: [] }
      }

      // Count users with higher points to get rank
      const { count: higherRanked } = await supabase
        .from("user_stats")
        .select("*", { count: "exact", head: true })
        .gt("total_points", userStats.total_points)

      const userRank = (higherRanked || 0) + 1

      // Get users around the user's rank
      const startRank = Math.max(1, userRank - range)
      const endRank = userRank + range

      const { data: nearbyData } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          total_points,
          current_streak,
          current_multiplier,
          users!inner(username, avatar_url)
        `)
        .order("total_points", { ascending: false })
        .range(startRank - 1, endRank - 1)

      const nearbyUsers =
        nearbyData?.map((entry: any, index: number) => ({
          rank: startRank + index,
          userId: entry.user_id,
          username: entry.users.username,
          totalPoints: entry.total_points,
          currentStreak: entry.current_streak,
          currentMultiplier: entry.current_multiplier,
          avatarUrl: entry.users.avatar_url,
          isCurrentUser: entry.user_id === userId,
        })) || []

      const userEntry = nearbyUsers.find((user) => user.userId === userId) || null

      return { userRank, userEntry, nearbyUsers }
    } catch (error) {
      console.error("Error fetching user rank:", error)
      return { userRank: 0, userEntry: null, nearbyUsers: [] }
    }
  }

  // Get leaderboard statistics
  static async getLeaderboardStats(): Promise<LeaderboardStats> {
    try {
      const { data: stats } = await supabase.from("user_stats").select("total_points, current_streak")

      if (!stats || stats.length === 0) {
        return { totalUsers: 0, averagePoints: 0, topStreak: 0 }
      }

      const totalUsers = stats.length
      const totalPoints = stats.reduce((sum, user) => sum + user.total_points, 0)
      const averagePoints = Math.round(totalPoints / totalUsers)
      const topStreak = Math.max(...stats.map((user) => user.current_streak))

      return { totalUsers, averagePoints, topStreak }
    } catch (error) {
      console.error("Error fetching leaderboard stats:", error)
      return { totalUsers: 0, averagePoints: 0, topStreak: 0 }
    }
  }

  // Get streak leaderboard
  static async getStreakLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    try {
      const { data: streakData } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          total_points,
          current_streak,
          current_multiplier,
          users!inner(username, avatar_url)
        `)
        .order("current_streak", { ascending: false })
        .order("total_points", { ascending: false })
        .limit(limit)

      return (
        streakData?.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.user_id,
          username: entry.users.username,
          totalPoints: entry.total_points,
          currentStreak: entry.current_streak,
          currentMultiplier: entry.current_multiplier,
          avatarUrl: entry.users.avatar_url,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching streak leaderboard:", error)
      return []
    }
  }
}
