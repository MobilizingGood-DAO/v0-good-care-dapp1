import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    let query = supabase.from("care_objectives").select("*").order("created_at", { ascending: false })

    if (username) {
      query = query.eq("username", username)
    } else if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: objectives, error } = await query

    if (error) {
      console.error("Error fetching objectives:", error)
      throw error
    }

    return NextResponse.json({
      objectives: objectives || [],
      success: true,
    })
  } catch (error) {
    console.error("Error fetching objectives:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch objectives",
        objectives: [],
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { objectiveId, status, evidence_url, username } = body

    if (!objectiveId) {
      return NextResponse.json({ error: "Objective ID is required" }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status

      // Set timestamps based on status
      if (status === "active" && !updateData.started_at) {
        updateData.started_at = new Date().toISOString()
      } else if (status === "completed" && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString()
      } else if (status === "verified" && !updateData.verified_at) {
        updateData.verified_at = new Date().toISOString()
      }
    }

    if (evidence_url) {
      updateData.evidence_url = evidence_url
    }

    // Update the objective
    const { data, error } = await supabase
      .from("care_objectives")
      .update(updateData)
      .eq("id", objectiveId)
      .select()
      .single()

    if (error) {
      console.error("Error updating objective:", error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Objective updated successfully",
      objective: data,
    })
  } catch (error) {
    console.error("Error updating objective:", error)
    return NextResponse.json(
      {
        error: "Failed to update objective",
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, title, description, category, points = 50 } = body

    if (!username || !title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new objective (admin only)
    const { data, error } = await supabase
      .from("care_objectives")
      .insert({
        username,
        title,
        description,
        category,
        points,
        status: "assigned",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating objective:", error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Objective created successfully",
      objective: data,
    })
  } catch (error) {
    console.error("Error creating objective:", error)
    return NextResponse.json(
      {
        error: "Failed to create objective",
        success: false,
      },
      { status: 500 },
    )
  }
}
