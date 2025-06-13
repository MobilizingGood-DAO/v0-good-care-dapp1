"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, ExternalLink, Copy } from "lucide-react"
import { useState } from "react"

interface TransactionStatusProps {
  txHash: string
  status: "pending" | "confirmed" | "failed"
  blockNumber?: number
  gasUsed?: string
  gasPrice?: string
  timestamp?: number
  onViewExplorer?: () => void
  className?: string
}

export function TransactionStatus({
  txHash,
  status,
  blockNumber,
  gasUsed,
  gasPrice,
  timestamp,
  onViewExplorer,
  className,
}: TransactionStatusProps) {
  const [copied, setCopied] = useState(false)

  const getStatusIcon = () => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Transaction Status</span>
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Track your transaction on the GOOD CARE Network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Transaction Hash</div>
          <div className="flex items-center space-x-2">
            <code className="flex-1 text-xs bg-muted p-2 rounded break-all">{txHash}</code>
            <Button variant="ghost" size="sm" onClick={copyTxHash}>
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {blockNumber && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Block Number</div>
              <div>{blockNumber.toLocaleString()}</div>
            </div>
            {timestamp && (
              <div>
                <div className="font-medium text-muted-foreground">Timestamp</div>
                <div>{new Date(timestamp * 1000).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {gasUsed && gasPrice && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Gas Used</div>
              <div>{Number.parseInt(gasUsed).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Gas Price</div>
              <div>{gasPrice} CARE</div>
            </div>
          </div>
        )}

        <Button onClick={onViewExplorer} className="w-full" variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Explorer
        </Button>
      </CardContent>
    </Card>
  )
}
