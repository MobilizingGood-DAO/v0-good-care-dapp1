import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, mood, gratitude, isPublic = false } = body

    if (!username || !mood) {
      return NextResponse.json({ error: "Missing required fields: username, mood" }, { status: 400 })
    }

    // Get user's current streak
    const { data: existingCheckins, error: streakError } = await supabase
      .from("daily_checkins")
      .select("created_at, streak")
      .eq("username", username)
      .order("created_at", { ascending: false })
      .limit(1)

    if (streakError) {
      console.error("Error fetching streak:", streakError)
    }

    // Calculate new streak
    let newStreak = 1
    if (existingCheckins && existingCheckins.length > 0) {
      const lastCheckin = new Date(existingCheckins[0].created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Check if last check-in was yesterday
      const lastCheckinDate = lastCheckin.toDateString()
      const yesterdayDate = yesterday.toDateString()
      const todayDate = today.toDateString()

      if (lastCheckinDate === yesterdayDate) {
        // Continue streak
        newStreak = (existingCheckins[0].streak || 0) + 1
      } else if (lastCheckinDate === todayDate) {
        // Already checked in today, update existing
        newStreak = existingCheckins[0].streak || 1
      }
      // If last check-in was more than 1 day ago, streak resets to 1
    }

    // Calculate points
    let points = 10 // Base points for check-in
    if (gratitude && gratitude.trim().length > 0) {
      points += 5 // Bonus for gratitude
    }

    // Streak bonus (up to 10 extra points)
    const streakBonus = Math.min(newStreak, 10)
    points += streakBonus

    // Check if user already checked in today
    const today = new Date().toISOString().split("T")[0]
    const { data: todayCheckin, error: todayError } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("username", username)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`)
      .single()

    if (todayError && todayError.code !== "PGRST116") {
      console.error("Error checking today's checkin:", todayError)
    }

    let result
    if (todayCheckin) {
      // Update existing check-in
      const { data, error } = await supabase
        .from("daily_checkins")
        .update({
          mood,
          gratitude: gratitude || "",
          is_public: isPublic,
          points,
          streak: newStreak,
          updated_at: new Date().toISOString(),
        })
        .eq("id", todayCheckin.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating check-in:", error)
        return NextResponse.json({ error: "Failed to update check-in" }, { status: 500 })
      }

      result = data
    } else {
      // Create new check-in
      const { data, error } = await supabase
        .from("daily_checkins")
        .insert({
          username,
          mood,
          gratitude: gratitude || "",
          is_public: isPublic,
          points,
          streak: newStreak,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating check-in:", error)
        return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({
      checkin: result,
      points,
      streak: newStreak,
      message: `Check-in successful! Earned ${points} points. Current streak: ${newStreak} days.`,
      success: true,
    })
  } catch (error) {
    console.error("Check-in API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const publicOnly = searchParams.get("public") === "true"

    let query = supabase.from("daily_checkins").select("*").order("created_at", { ascending: false })

    if (username) {
      query = query.eq("username", username)
    }

    if (publicOnly) {
      query = query.eq("is_public", true)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error("Error fetching check-ins:", error)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    return NextResponse.json({ checkins: data, success: true })
  } catch (error) {
    console.error("Check-ins GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
