"use client"

import { useState, useEffect } from "react"

export function useHydrationSafeStorage<T>(key: string, defaultValue: T) {
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    setMounted(true)
    try {
      const item = localStorage.getItem(key)
      if (item) {
        setValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue)
      if (mounted) {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [mounted ? value : defaultValue, setStoredValue] as const
}
