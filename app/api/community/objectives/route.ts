import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") || "active"

    let query = supabase
      .from("care_objectives")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching objectives:", error)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    return NextResponse.json({ objectives: data || [] })
  } catch (error) {
    console.error("Error in objectives GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, title, description, category, points } = body

    if (!userId || !username || !title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate category
    const validCategories = ["mentorship", "content", "support", "events"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Set default points based on category
    const defaultPoints = {
      mentorship: 100,
      content: 75,
      support: 50,
      events: 125,
    }

    const objectiveData = {
      user_id: userId,
      username,
      title,
      description: description || "",
      category,
      points: points || defaultPoints[category as keyof typeof defaultPoints],
      status: "active",
    }

    const { data, error } = await supabase.from("care_objectives").insert([objectiveData]).select().single()

    if (error) {
      console.error("Error creating objective:", error)
      return NextResponse.json({ error: "Failed to create objective" }, { status: 500 })
    }

    return NextResponse.json({ objective: data }, { status: 201 })
  } catch (error) {
    console.error("Error in objectives POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, completedAt } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "completed" && completedAt) {
      updateData.completed_at = completedAt
    }

    const { data, error } = await supabase.from("care_objectives").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating objective:", error)
      return NextResponse.json({ error: "Failed to update objective" }, { status: 500 })
    }

    return NextResponse.json({ objective: data })
  } catch (error) {
    console.error("Error in objectives PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
