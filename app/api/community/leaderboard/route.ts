import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("🏆 API: Fetching leaderboard data...")

    // Fetch user profiles with their points
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select(`
        id,
        user_id,
        username,
        wallet_address,
        avatar_url,
        self_care_points,
        community_points,
        total_checkins,
        current_streak,
        created_at
      `)
      .order("self_care_points", { ascending: false })

    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
      throw usersError
    }

    console.log(`📊 Found ${users?.length || 0} users`)

    // Calculate total points and add rankings
    const leaderboard = (users || []).map((user, index) => {
      const totalPoints = (user.self_care_points || 0) + (user.community_points || 0)

      // Generate recent activity (last 7 days) - simplified simulation
      const recentActivity = Array.from({ length: 7 }, (_, i) => {
        const daysSinceLastCheckin = user.current_streak > 0 ? 0 : Math.floor(Math.random() * 3)
        return i < daysSinceLastCheckin ? false : Math.random() > 0.3
      }).reverse()

      return {
        id: user.id,
        user_id: user.user_id,
        username: user.username || `User${user.id.slice(-4)}`,
        wallet_address: user.wallet_address,
        avatar_url: user.avatar_url,
        self_care_points: user.self_care_points || 0,
        community_points: user.community_points || 0,
        total_points: totalPoints,
        total_checkins: user.total_checkins || 0,
        current_streak: user.current_streak || 0,
        recent_activity: recentActivity,
        rank: index + 1,
        joined_at: user.created_at,
      }
    })

    // Sort by total points (descending)
    leaderboard.sort((a, b) => b.total_points - a.total_points)

    // Update ranks after sorting
    leaderboard.forEach((user, index) => {
      user.rank = index + 1
    })

    // Calculate community stats
    const totalUsers = leaderboard.length
    const totalSelfCarePoints = leaderboard.reduce((sum, user) => sum + user.self_care_points, 0)
    const totalCommunityPoints = leaderboard.reduce((sum, user) => sum + user.community_points, 0)
    const totalPoints = totalSelfCarePoints + totalCommunityPoints
    const averagePointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
    const activeUsers = leaderboard.filter((user) => user.current_streak > 0).length

    const stats = {
      totalUsers,
      totalSelfCarePoints,
      totalCommunityPoints,
      totalPoints,
      averagePointsPerUser,
      activeUsers,
    }

    console.log("✅ API: Leaderboard data prepared:", {
      users: leaderboard.length,
      totalPoints,
      activeUsers,
    })

    return NextResponse.json({
      leaderboard,
      stats,
      success: true,
    })
  } catch (error) {
    console.error("❌ API: Error in leaderboard route:", error)

    // Return empty structure instead of error to prevent frontend crashes
    return NextResponse.json({
      leaderboard: [],
      stats: {
        totalUsers: 0,
        totalSelfCarePoints: 0,
        totalCommunityPoints: 0,
        totalPoints: 0,
        averagePointsPerUser: 0,
        activeUsers: 0,
      },
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
