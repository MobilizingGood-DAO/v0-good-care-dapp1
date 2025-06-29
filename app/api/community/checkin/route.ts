import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, mood, gratitude, isPublic, points } = body

    if (!userId || !username || !mood) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Calculate points based on check-in completeness
    let calculatedPoints = 10 // Base points
    if (gratitude && gratitude.trim().length > 0) {
      calculatedPoints += 5 // Bonus for gratitude
    }

    const checkinData = {
      user_id: userId,
      mood,
      gratitude: gratitude || null,
      is_public: isPublic || false,
      points: points || calculatedPoints,
      created_at: new Date().toISOString(),
    }

    // Insert the check-in
    const { data, error } = await supabase.from("daily_checkins").insert(checkinData).select().single()

    if (error) {
      console.error("Error inserting check-in:", error)
      return NextResponse.json({ success: false, error: "Failed to save check-in" }, { status: 500 })
    }

    // Update user stats
    const { error: statsError } = await supabase.from("user_stats").upsert({
      user_id: userId,
      total_points: supabase.raw("COALESCE(total_points, 0) + ?", [calculatedPoints]),
      total_checkins: supabase.raw("COALESCE(total_checkins, 0) + 1"),
      last_checkin: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (statsError) {
      console.error("Error updating user stats:", statsError)
      // Don't fail the request if stats update fails
    }

    return NextResponse.json({
      success: true,
      checkin: data,
      points: calculatedPoints,
    })
  } catch (error) {
    console.error("Check-in API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const isPublic = searchParams.get("public") === "true"

    let query = supabase
      .from("daily_checkins")
      .select(`
        *,
        users!inner(username, avatar)
      `)
      .order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (isPublic) {
      query = query.eq("is_public", true)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error("Error fetching check-ins:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch check-ins" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkins: data || [],
    })
  } catch (error) {
    console.error("Check-ins GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
