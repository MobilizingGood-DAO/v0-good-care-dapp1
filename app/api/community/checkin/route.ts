import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  console.log("📝 API: Processing check-in...")

  try {
    const body = await request.json()
    const { userId, mood, gratitude, selfCarePoints } = body

    if (!userId || !mood) {
      return NextResponse.json({ error: "Missing required fields: userId, mood" }, { status: 400 })
    }

    // Insert daily check-in
    const { data: checkin, error: checkinError } = await supabase
      .from("daily_checkins")
      .insert({
        user_id: userId,
        mood,
        gratitude: gratitude || null,
        points_earned: selfCarePoints || 10,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (checkinError) {
      console.error("❌ Error inserting check-in:", checkinError)
      throw checkinError
    }

    // Update user's self-care points and streak
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("self_care_points, current_streak, last_checkin_date")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("❌ Error fetching profile:", profileError)
      throw profileError
    }

    // Calculate new streak
    const today = new Date().toDateString()
    const lastCheckin = profile.last_checkin_date ? new Date(profile.last_checkin_date).toDateString() : null
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    let newStreak = profile.current_streak || 0
    if (lastCheckin === yesterday) {
      newStreak += 1
    } else if (lastCheckin !== today) {
      newStreak = 1
    }

    // Update profile with new points and streak
    const newSelfCarePoints = (profile.self_care_points || 0) + (selfCarePoints || 10)

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        self_care_points: newSelfCarePoints,
        current_streak: newStreak,
        last_checkin_date: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("❌ Error updating profile:", updateError)
      throw updateError
    }

    console.log("✅ Check-in processed successfully:", {
      userId,
      pointsEarned: selfCarePoints || 10,
      newStreak,
      totalPoints: newSelfCarePoints,
    })

    return NextResponse.json({
      success: true,
      pointsEarned: selfCarePoints || 10,
      newStreak,
      totalSelfCarePoints: newSelfCarePoints,
    })
  } catch (error) {
    console.error("❌ API: Check-in error:", error)
    return NextResponse.json({ error: "Failed to process check-in" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const username = searchParams.get("username")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let query = supabase.from("daily_checkins").select("*").order("created_at", { ascending: false }).limit(limit)

    if (userId) {
      query = query.eq("user_id", userId)
    } else if (username) {
      query = query.eq("username", username)
    }

    const { data: checkins, error } = await query

    if (error) {
      console.error("Error fetching check-ins:", error)
      throw error
    }

    return NextResponse.json({
      checkins: checkins || [],
      success: true,
    })
  } catch (error) {
    console.error("Error fetching check-ins:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch check-ins",
        checkins: [],
        success: false,
      },
      { status: 500 },
    )
  }
}
