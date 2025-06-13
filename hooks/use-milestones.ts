"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { fetchMilestones, type Milestone, type Progress, type CategoryProgress } from "@/lib/blockchain"

export function useMilestones() {
  const { address, isConnected, isCorrectChain } = useWallet()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [progress, setProgress] = useState<Progress>({ total: 10, completed: 0, percentage: 0 })
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress>({
    community: { total: 5, completed: 0, percentage: 0 },
    contribution: { total: 5, completed: 0, percentage: 0 },
    learning: { total: 5, completed: 0, percentage: 0 },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getMilestones() {
      if (!address || !isConnected || !isCorrectChain) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchMilestones(address)
        setMilestones(data.milestones)
        setProgress(data.progress)
        setCategoryProgress(data.categoryProgress)
      } catch (err) {
        console.error("Error fetching milestones:", err)
        setError("Failed to fetch milestones")
      } finally {
        setIsLoading(false)
      }
    }

    getMilestones()
  }, [address, isConnected, isCorrectChain])

  return {
    milestones,
    progress,
    categoryProgress,
    completedMilestones: milestones.filter((m) => m.completed),
    pendingMilestones: milestones.filter((m) => !m.completed),
    isLoading,
    error,
  }
}
