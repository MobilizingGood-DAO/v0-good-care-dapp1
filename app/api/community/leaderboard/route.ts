import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Get leaderboard data with a join query
    const { data: leaderboardData, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        wallet_address,
        user_stats (
          total_points,
          current_streak,
          longest_streak,
          level,
          total_checkins,
          last_checkin
        )
      `)
      .not("user_stats", "is", null)
      .order("user_stats.total_points", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // Format the data
    const formattedLeaderboard = (leaderboardData || []).map((entry: any, index: number) => ({
      userId: entry.id,
      username: entry.username || `User_${entry.wallet_address.slice(-6)}`,
      walletAddress: entry.wallet_address,
      totalPoints: entry.user_stats?.total_points || 0,
      currentStreak: entry.user_stats?.current_streak || 0,
      longestStreak: entry.user_stats?.longest_streak || 0,
      level: entry.user_stats?.level || 1,
      totalCheckins: entry.user_stats?.total_checkins || 0,
      lastCheckin: entry.user_stats?.last_checkin,
      rank: index + 1,
    }))

    return NextResponse.json({
      success: true,
      leaderboard: formattedLeaderboard,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
