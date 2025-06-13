"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLatestTransactions } from "@/hooks/use-explorer"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getDisplayName } from "@/lib/user-profile"

export function LatestTransactions() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tx Hash</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="hidden md:table-cell">Gas Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.hash}>
                  <TableCell>
                    <Link href={`/explorer/tx/${tx.hash}`} className="text-green-600 hover:underline">
                      {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 6)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {tx.timestamp ? formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true }) : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/explorer/address/${tx.from}`} className="text-green-600 hover:underline">
                      {getDisplayName(tx.from)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {tx.to ? (
                      <Link href={`/explorer/address/${tx.to}`} className="text-green-600 hover:underline">
                        {getDisplayName(tx.to)}
                      </Link>
                    ) : (
                      <Badge>Contract Creation</Badge>
                    )}
                  </TableCell>
                  <TableCell>{tx.value} CARE</TableCell>
                  <TableCell className="hidden md:table-cell">{tx.gasPriceCARE} CARE</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
