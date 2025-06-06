import { createClient } from "@supabase/supabase-js"

// Use the environment variables that are available in v0
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yicbjuejkxyuwmsjxajz.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpY2JqdWVqa3h5dXdtc2p4YWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU3NjcsImV4cCI6MjA2NDMyMTc2N30.OzfTUyCcvGEobFrJq5fOb0WYpxG7DFpdNJQPndJhlrY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email?: string
  wallet_address: string
  username?: string
  bio?: string
  avatar?: string
  social_provider?: string
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  date: string
  mood: number
  mood_label: string
  points: number
  streak: number
  gratitude_note?: string
  resources_viewed: string[]
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_points: number
  current_streak: number
  longest_streak: number
  level: number
  total_checkins: number
  last_checkin: string | null
  updated_at: string
}
