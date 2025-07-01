import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    console.log("🏆 Fetching leaderboard data...")

    // Get all user profiles with their stats
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("total_points", { ascending: false })

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      return NextResponse.json(
        {
          error: "Failed to fetch profiles",
          leaderboard: [],
          stats: {
            totalUsers: 0,
            totalSelfCarePoints: 0,
            totalCommunityPoints: 0,
            totalPoints: 0,
            averagePointsPerUser: 0,
            activeUsers: 0,
          },
        },
        { status: 500 },
      )
    }

    if (!profiles || profiles.length === 0) {
      console.log("📝 No profiles found")
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
      })
    }

    // Get community points for each user from verified objectives
    const { data: objectives, error: objectivesError } = await supabase
      .from("care_objectives")
      .select("assigned_to, points")
      .eq("status", "verified")

    if (objectivesError) {
      console.error("❌ Error fetching objectives:", objectivesError)
    }

    // Calculate community points per user
    const communityPointsMap = new Map<string, number>()
    if (objectives) {
      objectives.forEach((obj) => {
        if (obj.assigned_to) {
          const current = communityPointsMap.get(obj.assigned_to) || 0
          communityPointsMap.set(obj.assigned_to, current + obj.points)
        }
      })
    }

    // Get recent activity for each user (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const leaderboardData = await Promise.all(
      profiles.map(async (profile) => {
        // Get recent checkins for activity dots
        const { data: recentCheckins } = await supabase
          .from("daily_checkins")
          .select("checkin_date")
          .eq("user_id", profile.user_id)
          .gte("checkin_date", sevenDaysAgo.toISOString().split("T")[0])
          .order("checkin_date", { ascending: false })

        const recentActivity = recentCheckins?.map((c) => c.checkin_date) || []
        const communityPoints = communityPointsMap.get(profile.user_id) || 0
        const selfCarePoints = profile.total_points || 0
        const totalPoints = selfCarePoints + communityPoints

        return {
          id: profile.id,
          user_id: profile.user_id,
          username: profile.username || `User${profile.wallet_address?.slice(-4)}`,
          wallet_address: profile.wallet_address,
          avatar_url: profile.avatar_url,
          self_care_points: selfCarePoints,
          community_points: communityPoints,
          total_points: totalPoints,
          total_checkins: profile.total_checkins || 0,
          current_streak: profile.current_streak || 0,
          recent_activity: recentActivity,
          joined_at: profile.created_at,
        }
      }),
    )

    // Sort by total points and assign ranks
    const sortedLeaderboard = leaderboardData
      .sort((a, b) => b.total_points - a.total_points)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

    // Calculate stats
    const totalUsers = profiles.length
    const totalSelfCarePoints = leaderboardData.reduce((sum, user) => sum + user.self_care_points, 0)
    const totalCommunityPoints = leaderboardData.reduce((sum, user) => sum + user.community_points, 0)
    const totalPoints = totalSelfCarePoints + totalCommunityPoints
    const averagePointsPerUser = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
    const activeUsers = leaderboardData.filter((user) => user.current_streak > 0).length

    const stats = {
      totalUsers,
      totalSelfCarePoints,
      totalCommunityPoints,
      totalPoints,
      averagePointsPerUser,
      activeUsers,
    }

    console.log("✅ Leaderboard generated:", {
      users: totalUsers,
      topUser: sortedLeaderboard[0]?.username,
      topPoints: sortedLeaderboard[0]?.total_points,
    })

    return NextResponse.json({
      leaderboard: sortedLeaderboard,
      stats,
      success: true,
    })
  } catch (error) {
    console.error("💥 Leaderboard API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
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
      },
      { status: 500 },
    )
  }
}
