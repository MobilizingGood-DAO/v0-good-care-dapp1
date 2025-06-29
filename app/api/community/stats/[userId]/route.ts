import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user stats
    const { data: stats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }

    // Get recent check-ins
    const { data: checkIns, error: checkInsError } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(10)

    if (checkInsError) {
      console.error("Error fetching check-ins:", checkInsError)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stats,
      checkIns: checkIns || [],
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
