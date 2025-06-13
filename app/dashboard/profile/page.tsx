"use client"

import MyCare from "@/components/my-care"

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My CARE</h2>
      </div>
      <MyCare />
    </div>
  )
}
