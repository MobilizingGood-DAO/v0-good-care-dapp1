import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const status = searchParams.get("status")

    let query = supabase.from("care_objectives").select("*").order("assigned_at", { ascending: false })

    if (username) {
      query = query.eq("username", username)
    }

    if (status) {
      query = query.eq("status", status)
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

// PATCH endpoint for users to update their objective status (start, complete, add evidence)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, evidence_url, username } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields: id, status" }, { status: 400 })
    }

    const updateData: any = { status }

    if (status === "active" && !updateData.started_at) {
      updateData.started_at = new Date().toISOString()
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
      if (evidence_url) {
        updateData.evidence_url = evidence_url
      }
    }

    const { data, error } = await supabase
      .from("care_objectives")
      .update(updateData)
      .eq("id", id)
      .eq("username", username) // Ensure users can only update their own objectives
      .select()
      .single()

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
