import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let query = supabase.from("care_objectives").select("*").order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching objectives:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch objectives" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      objectives: data || [],
    })
  } catch (error) {
    console.error("Objectives GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, title, description, category } = body

    if (!userId || !username || !title || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Determine points based on category
    const pointsMap = {
      mentorship: 100,
      content: 75,
      support: 50,
      events: 125,
    }

    const points = pointsMap[category as keyof typeof pointsMap] || 50

    const { data, error } = await supabase
      .from("care_objectives")
      .insert({
        user_id: userId,
        username,
        title,
        description,
        category,
        points,
        status: "completed", // Auto-complete for demo
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating objective:", error)
      return NextResponse.json({ success: false, error: "Failed to create objective" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      objective: data,
    })
  } catch (error) {
    console.error("Objectives POST error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
