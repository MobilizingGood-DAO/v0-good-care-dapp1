"use client"

import dynamic from "next/dynamic"

// Dynamically import check-in component with no SSR
const EnhancedDailyCheckIn = dynamic(() => import("./check-in/enhanced-daily-check-in"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export function ClientCheckIn() {
  return <EnhancedDailyCheckIn />
}

export default ClientCheckIn
