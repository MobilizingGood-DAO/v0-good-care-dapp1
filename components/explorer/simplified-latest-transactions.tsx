"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLatestTransactions } from "@/hooks/use-explorer"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export function SimplifiedLatestTransactions() {
  const { transactions, isLoading, error } = useLatestTransactions(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Transactions</CardTitle>
        <CardDescription>Most recent transactions on the GOOD CARE Network</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading latest transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/explorer/tx/${tx.hash}`} className="text-green-600 hover:underline font-medium">
                    {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 6)}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {tx.timestamp
                      ? formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true })
                      : "Recently"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>{" "}
                    <Link href={`/explorer/address/${tx.from}`} className="text-green-600 hover:underline">
                      {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                    </Link>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span>{" "}
                    {tx.to ? (
                      <Link href={`/explorer/address/${tx.to}`} className="text-green-600 hover:underline">
                        {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                      </Link>
                    ) : (
                      <span className="text-orange-500">Contract Creation</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value:</span> <span>{tx.value || "0"} CARE</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gas:</span> <span>{tx.gasPriceCARE || "0.0001"} CARE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
