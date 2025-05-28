"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { useNFTs } from "@/hooks/use-nfts"
import { useWallet } from "@/providers/wallet-provider"
import { Loader2, TrendingUp, Activity, Calendar } from 'lucide-react'
import { useState, useEffect } from "react"

export function OnChainMetrics() {
  const { address } = useWallet()
  const { balances, isLoading: balanceLoading } = useTokenBalances()
  const { allNfts, reflectionsCount, isLoading: nftsLoading } = useNFTs()
  const [accountAge, setAccountAge] = useState<number>(0)

  useEffect(() => {
    // Calculate account age (mock data for now)
    const joinDate = new Date("2023-01-15")
    const now = new Date()
    const ageInDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
    setAccountAge(ageInDays)
  }, [])

  const totalValue = Number.parseFloat(balances.care.balance) * 0.5 + Number.parseFloat(balances.gct.balance) * 0.1

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {balances.care.balance} CARE + {balances.gct.balance} GCT
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NFT Collection</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {nftsLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{allNfts.length}</div>
              <p className="text-xs text-muted-foreground">{reflectionsCount} Reflections</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Age</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{accountAge}</div>
          <p className="text-xs text-muted-foreground">Days since joining</p>
        </CardContent>
      </Card>
    </div>
  )
}
