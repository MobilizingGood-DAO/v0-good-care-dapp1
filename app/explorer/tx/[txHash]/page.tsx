"use client"

import { useTransaction } from "@/hooks/use-explorer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EXPLORER_URL } from "@/lib/explorer-service"
import { getDisplayName } from "@/lib/user-profile"

export default function TransactionPage({ params }: { params: { txHash: string } }) {
  const { txHash } = params
  const { transaction, isLoading, error } = useTransaction(txHash)

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
        <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
        <Link
          href={`${EXPLORER_URL}/tx/${txHash}`}
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
          <p>Loading transaction details...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      ) : !transaction ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Transaction not found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CardTitle>Transaction</CardTitle>
              <Badge
                className={
                  transaction.status === "success"
                    ? "bg-green-100 text-green-800"
                    : transaction.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {transaction.status === "success" ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : transaction.status === "pending" ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {transaction.status}
              </Badge>
            </div>
            <CardDescription>Transaction details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
              <p className="font-mono break-all">{transaction.hash}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Block</p>
                <Link href={`/explorer/block/${transaction.blockNumber}`} className="text-green-600 hover:underline">
                  {transaction.blockNumber}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p>
                  {new Date(transaction.timestamp * 1000).toLocaleString()} (
                  {formatDistanceToNow(new Date(transaction.timestamp * 1000), { addSuffix: true })})
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">From</p>
                <Link
                  href={`/explorer/address/${transaction.from}`}
                  className="font-mono text-green-600 hover:underline"
                >
                  {getDisplayName(transaction.from)}
                </Link>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">To</p>
                {transaction.to ? (
                  <Link
                    href={`/explorer/address/${transaction.to}`}
                    className="font-mono text-green-600 hover:underline"
                  >
                    {getDisplayName(transaction.to)}
                  </Link>
                ) : (
                  <Badge>Contract Creation</Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Value</p>
                <p>{transaction.value} CARE</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Transaction Type</p>
                <p>{transaction.method}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Price</p>
                <p>{transaction.gasPriceCARE} CARE</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Used</p>
                <p>{Number.parseInt(transaction.gasUsed || "0").toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gas Limit</p>
                <p>{Number.parseInt(transaction.gasLimit).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Gas Fee</p>
                <p>
                  {Number.parseFloat(transaction.gasPriceCARE) *
                    (Number.parseInt(transaction.gasUsed || "0") / 1_000_000_000)}{" "}
                  CARE
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
