import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://yicbjuejkxyuwmsjxajz.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpY2JqdWVqa3h5dXdtc2p4YWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU3NjcsImV4cCI6MjA2NDMyMTc2N30.OzfTUyCcvGEobFrJq5fOb0WYpxG7DFpdNJQPndJhlrY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
