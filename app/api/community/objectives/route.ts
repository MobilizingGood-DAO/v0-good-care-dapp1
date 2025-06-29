import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    let query = supabase.from("care_objectives").select("*").order("created_at", { ascending: false })

    if (username) {
      query = query.eq("username", username)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching objectives:", error)
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 })
    }

    return NextResponse.json({ objectives: data, success: true })
  } catch (error) {
    console.error("Objectives GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, title, description, category } = body

    if (!username || !title || !category) {
      return NextResponse.json({ error: "Missing required fields: username, title, category" }, { status: 400 })
    }

    // Determine points based on category
    const categoryPoints: Record<string, number> = {
      mentorship: 100,
      content: 75,
      support: 50,
      events: 125,
    }

    const points = categoryPoints[category] || 50

    const { data, error } = await supabase
      .from("care_objectives")
      .insert({
        username,
        title,
        description: description || "",
        category,
        points,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating objective:", error)
      return NextResponse.json({ error: "Failed to create objective" }, { status: 500 })
    }

    return NextResponse.json({
      objective: data,
      message: "Objective created successfully",
      success: true,
    })
  } catch (error) {
    console.error("Objectives POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, username } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields: id, status" }, { status: 400 })
    }

    const updateData: any = { status }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("care_objectives").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating objective:", error)
      return NextResponse.json({ error: "Failed to update objective" }, { status: 500 })
    }

    return NextResponse.json({
      objective: data,
      message: "Objective updated successfully",
      success: true,
    })
  } catch (error) {
    console.error("Objectives PATCH API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
