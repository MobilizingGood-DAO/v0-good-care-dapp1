import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, mood, moodLabel, gratitudeNote, isGratitudePublic = false, resourcesViewed = [] } = body

    if (!userId || mood === undefined || !moodLabel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Check if already checked in today
    const { data: existingCheckIn } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .single()

    if (existingCheckIn) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    // Get user info
    const { data: user } = await supabase.from("users").select("username, wallet_address").eq("id", userId).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate streak and points (simplified)
    const basePoints = 10
    const gratitudeBonus = gratitudeNote ? 5 : 0
    const points = basePoints + gratitudeBonus

    // Insert check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: userId,
        date: today,
        mood,
        mood_label: moodLabel,
        points,
        streak: 1, // Simplified - would calculate actual streak
        gratitude_note: gratitudeNote,
        is_gratitude_public: isGratitudePublic,
        resources_viewed: resourcesViewed,
      })
      .select()
      .single()

    if (checkInError) {
      console.error("Error creating check-in:", checkInError)
      return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 })
    }

    // Get updated stats
    const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

    return NextResponse.json({
      success: true,
      checkIn,
      stats,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
