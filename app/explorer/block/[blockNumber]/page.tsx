"use client"

import { useBlock } from "@/hooks/use-explorer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EXPLORER_URL } from "@/lib/explorer-service"
import { ethers } from "ethers"

export default function BlockPage({ params }: { params: { blockNumber: string } }) {
  const { blockNumber } = params
  const { block, isLoading, error } = useBlock(blockNumber)

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/explorer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explorer
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Block #{blockNumber}</h1>
        <Link
          href={`${EXPLORER_URL}/block/${blockNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          View on Official Explorer
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading block details...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      ) : !block ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Block not found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Block Details</CardTitle>
            <CardDescription>Information about block #{block.number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Block Number</p>
                <p className="font-mono">{block.number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p>
                  {new Date(block.timestamp * 1000).toLocaleString()} (
                  {formatDistanceToNow(new Date(block.timestamp * 1000), { addSuffix: true })})
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p>{block.transactions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Miner</p>
                <Link href={`/explorer/address/${block.miner}`} className="font-mono text-green-600 hover:underline">
                  {block.miner}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Used</p>
                <p>{Number.parseInt(block.gasUsed).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Limit</p>
                <p>{Number.parseInt(block.gasLimit).toLocaleString()}</p>
              </div>
              {block.baseFeePerGas && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Base Fee Per Gas</p>
                  <p>{ethers.formatUnits(block.baseFeePerGas, "gwei")} Gwei</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Block Hash</p>
              <p className="font-mono break-all">{block.hash}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
