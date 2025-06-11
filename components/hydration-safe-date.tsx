"use client"

import { useState, useEffect } from "react"

interface HydrationSafeDateProps {
  date: string | Date
  className?: string
}

export function HydrationSafeDate({ date, className }: HydrationSafeDateProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className={className}>Loading...</span>
  }

  const dateObj = typeof date === "string" ? new Date(date) : date

  return (
    <time className={className} suppressHydrationWarning>
      {dateObj.toLocaleDateString()}
    </time>
  )
}
