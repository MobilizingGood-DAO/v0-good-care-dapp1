import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, mood, gratitude, isPublic = false } = body

    if (!userId || !username || !mood) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate points
    const basePoints = 10 // Base check-in points
    const gratitudePoints = gratitude ? 5 : 0 // Bonus for gratitude

    // Get current streak
    const { data: lastCheckin } = await supabase
      .from("daily_checkins")
      .select("created_at, streak")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    let newStreak = 1
    if (lastCheckin) {
      const lastDate = new Date(lastCheckin.created_at).toDateString()
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

      if (lastDate === yesterday) {
        newStreak = (lastCheckin.streak || 0) + 1
      } else if (lastDate === today) {
        // Already checked in today, update existing
        newStreak = lastCheckin.streak || 1
      }
    }

    // Streak bonus (max 10 points)
    const streakBonus = Math.min(newStreak, 10)
    const totalPoints = basePoints + gratitudePoints + streakBonus

    // Insert or update check-in
    const { data: checkinData, error: checkinError } = await supabase
      .from("daily_checkins")
      .upsert(
        {
          user_id: userId,
          username,
          mood,
          gratitude: gratitude || "",
          streak: newStreak,
          points: totalPoints,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,created_at::date",
        },
      )
      .select()

    if (checkinError) {
      console.error("Error saving check-in:", checkinError)
      return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 })
    }

    // If gratitude is public, save to public gratitude table
    if (isPublic && gratitude) {
      const { error: gratitudeError } = await supabase.from("public_gratitude").insert({
        user_id: userId,
        username,
        gratitude,
        mood,
        created_at: new Date().toISOString(),
      })

      if (gratitudeError) {
        console.error("Error saving public gratitude:", gratitudeError)
        // Don't fail the whole request for this
      }
    }

    return NextResponse.json({
      success: true,
      checkin: checkinData,
      points: totalPoints,
      streak: newStreak,
    })
  } catch (error) {
    console.error("Error in checkin API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30) // Last 30 check-ins

    if (error) {
      console.error("Error fetching check-ins:", error)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    return NextResponse.json({ checkins: data || [] })
  } catch (error) {
    console.error("Error in checkin GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
