import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🏆 Fetching enhanced leaderboard with dual points...")

    // Get all users with their profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: true })

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      console.log("📝 No profiles found, returning empty leaderboard")
      return NextResponse.json({
        leaderboard: [],
        stats: {
          totalUsers: 0,
          totalSelfCarePoints: 0,
          totalCommunityPoints: 0,
          averagePoints: 0,
        },
      })
    }

    // Get self-care points from check-ins
    const { data: checkInStats, error: checkInError } = await supabase.from("user_checkins").select("user_id, points")

    if (checkInError) {
      console.error("❌ Error fetching check-in stats:", checkInError)
    }

    // Get community points from verified objectives
    const { data: objectiveStats, error: objectiveError } = await supabase
      .from("user_objectives")
      .select(`
        user_id,
        care_objectives!inner(points)
      `)
      .eq("status", "verified")

    if (objectiveError) {
      console.error("❌ Error fetching objective stats:", objectiveError)
    }

    // Calculate points for each user
    const userPointsMap = new Map()

    // Initialize all users with zero points
    profiles.forEach((profile) => {
      userPointsMap.set(profile.user_id, {
        user_id: profile.user_id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        selfCarePoints: 0,
        communityPoints: 0,
        totalPoints: 0,
        checkInCount: 0,
        objectiveCount: 0,
        lastActivity: profile.last_checkin_date,
      })
    })

    // Add self-care points from check-ins
    if (checkInStats) {
      checkInStats.forEach((checkin) => {
        const user = userPointsMap.get(checkin.user_id)
        if (user) {
          user.selfCarePoints += checkin.points || 0
          user.checkInCount += 1
        }
      })
    }

    // Add community points from verified objectives
    if (objectiveStats) {
      objectiveStats.forEach((objective) => {
        const user = userPointsMap.get(objective.user_id)
        if (user && objective.care_objectives) {
          user.communityPoints += objective.care_objectives.points || 0
          user.objectiveCount += 1
        }
      })
    }

    // Calculate total points and create leaderboard
    const leaderboard = Array.from(userPointsMap.values())
      .map((user) => ({
        ...user,
        totalPoints: user.selfCarePoints + user.communityPoints,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))

    // Calculate stats
    const stats = {
      totalUsers: leaderboard.length,
      totalSelfCarePoints: leaderboard.reduce((sum, user) => sum + user.selfCarePoints, 0),
      totalCommunityPoints: leaderboard.reduce((sum, user) => sum + user.communityPoints, 0),
      averagePoints:
        leaderboard.length > 0
          ? Math.round(leaderboard.reduce((sum, user) => sum + user.totalPoints, 0) / leaderboard.length)
          : 0,
    }

    console.log("✅ Enhanced leaderboard generated:", {
      userCount: leaderboard.length,
      topUser: leaderboard[0]?.username,
      topPoints: leaderboard[0]?.totalPoints,
      stats,
    })

    return NextResponse.json({
      leaderboard,
      stats,
    })
  } catch (error) {
    console.error("💥 Leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
