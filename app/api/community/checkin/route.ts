import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, mood, gratitude, isPublic, timestamp } = body

    if (!userId || !username || !mood) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate points
    let points = 10 // Base points for check-in
    if (gratitude && gratitude.trim().length > 0) {
      points += 5 // Bonus for gratitude
    }

    // Get current streak
    const { data: existingCheckins } = await supabase
      .from("daily_checkins")
      .select("created_at, streak")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    let newStreak = 1
    if (existingCheckins && existingCheckins.length > 0) {
      const lastCheckin = new Date(existingCheckins[0].created_at)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        // Consecutive day
        newStreak = (existingCheckins[0].streak || 0) + 1
      } else if (daysDiff === 0) {
        // Same day - update existing
        newStreak = existingCheckins[0].streak || 1
      } else {
        // Streak broken
        newStreak = 1
      }
    }

    // Add streak bonus (1 point per streak day, max 20)
    const streakBonus = Math.min(newStreak, 20)
    points += streakBonus

    // Check if already checked in today
    const today = new Date().toISOString().split("T")[0]
    const { data: todayCheckin } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`)
      .single()

    const checkinData = {
      user_id: userId,
      username,
      mood,
      gratitude: gratitude || "",
      is_public: isPublic || false,
      points,
      streak: newStreak,
      created_at: timestamp || new Date().toISOString(),
    }

    let result
    if (todayCheckin) {
      // Update existing check-in
      const { data, error } = await supabase
        .from("daily_checkins")
        .update(checkinData)
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
      const { data, error } = await supabase.from("daily_checkins").insert([checkinData]).select().single()

      if (error) {
        console.error("Error creating check-in:", error)
        return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 })
      }
      result = data
    }

    // If gratitude is public, we could add it to a public feed table here
    if (isPublic && gratitude && gratitude.trim().length > 0) {
      const publicGratitudeData = {
        user_id: userId,
        username,
        gratitude,
        mood,
        created_at: timestamp || new Date().toISOString(),
      }

      // Insert into public gratitude feed (table would need to be created)
      await supabase
        .from("public_gratitude")
        .insert([publicGratitudeData])
        .catch((error) => {
          console.error("Error saving public gratitude:", error)
          // Don't fail the whole request if this fails
        })
    }

    return NextResponse.json(
      {
        checkin: result,
        points,
        streak: newStreak,
        message: `Check-in successful! Earned ${points} points (${newStreak} day streak)`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in checkin API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let query = supabase.from("daily_checkins").select("*").order("created_at", { ascending: false }).limit(limit)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching check-ins:", error)
      return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 })
    }

    return NextResponse.json({ checkins: data || [] })
  } catch (error) {
    console.error("Error in checkin GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
