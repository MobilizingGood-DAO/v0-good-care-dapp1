"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNetworkStats } from "@/hooks/use-explorer"
import { Loader2 } from "lucide-react"

// Convert Gwei to CARE
function gweiToCARE(gweiAmount: string): string {
  // 1 CARE = 10^18 wei, 1 Gwei = 10^9 wei, so 1 CARE = 10^9 Gwei
  const gweiValue = Number.parseFloat(gweiAmount)
  const careValue = gweiValue / 1_000_000_000
  return careValue.toFixed(9)
}

export function NetworkStatsCard() {
  const { stats, isLoading, error } = useNetworkStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Statistics</CardTitle>
        <CardDescription>Current GOOD CARE Network stats</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading network stats...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Latest Block</p>
              <p className="text-2xl font-bold">{stats.latestBlock.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gas Price</p>
              <p className="text-2xl font-bold">{gweiToCARE(stats.gasPrice)} CARE</p>
              <p className="text-xs text-muted-foreground">{stats.gasPrice} Gwei</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">TPS</p>
              <p className="text-2xl font-bold">{stats.tps.toFixed(2)}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
