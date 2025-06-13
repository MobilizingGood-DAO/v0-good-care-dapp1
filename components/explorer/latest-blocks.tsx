"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLatestBlocks } from "@/hooks/use-explorer"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function LatestBlocks() {
  const { blocks, isLoading, error } = useLatestBlocks(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Blocks</CardTitle>
        <CardDescription>Most recent blocks on the GOOD CARE Network</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading latest blocks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No blocks found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Txns</TableHead>
                <TableHead className="hidden md:table-cell">Gas Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.number}>
                  <TableCell>
                    <Link href={`/explorer/block/${block.number}`} className="text-green-600 hover:underline">
                      {block.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {block.timestamp
                      ? formatDistanceToNow(new Date(block.timestamp * 1000), { addSuffix: true })
                      : "Unknown"}
                  </TableCell>
                  <TableCell>{block.transactions}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {Number.parseInt(block.gasUsed).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
