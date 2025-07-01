import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("🏆 Leaderboard API: Starting data fetch...")

    // Fetch user profiles with their points and stats
    const { data: profiles, error: profilesError } = await supabase
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

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      throw profilesError
    }

    console.log(`📊 Found ${profiles?.length || 0} user profiles`)

    // Calculate total points and add rank
    const leaderboard = (profiles || []).map((profile, index) => {
      const totalPoints = (profile.self_care_points || 0) + (profile.community_points || 0)

      // Generate recent activity (last 7 days) - simplified simulation
      const recentActivity = Array.from({ length: 7 }, (_, i) => {
        const daysSinceLastCheckin = profile.current_streak || 0
        return i < daysSinceLastCheckin ? "✅" : "⭕"
      }).reverse()

      return {
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username || `User${profile.id.slice(-4)}`,
        wallet_address: profile.wallet_address || "",
        avatar_url: profile.avatar_url,
        self_care_points: profile.self_care_points || 0,
        community_points: profile.community_points || 0,
        total_points: totalPoints,
        total_checkins: profile.total_checkins || 0,
        current_streak: profile.current_streak || 0,
        recent_activity: recentActivity,
        rank: index + 1,
        joined_at: profile.created_at || new Date().toISOString(),
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

    console.log("✅ Leaderboard data prepared:", {
      users: leaderboard.length,
      stats,
    })

    return NextResponse.json({
      success: true,
      leaderboard,
      stats,
    })
  } catch (error) {
    console.error("❌ Leaderboard API error:", error)

    // Return empty structure instead of error to prevent crashes
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      leaderboard: [],
      stats: {
        totalUsers: 0,
        totalSelfCarePoints: 0,
        totalCommunityPoints: 0,
        totalPoints: 0,
        averagePointsPerUser: 0,
        activeUsers: 0,
      },
    })
  }
}
