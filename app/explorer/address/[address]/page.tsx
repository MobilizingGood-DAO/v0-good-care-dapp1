"use client"

import { useAccount } from "@/hooks/use-explorer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Code } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EXPLORER_URL } from "@/lib/explorer-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AddressPage({ params }: { params: { address: string } }) {
  const { address } = params
  const { account, isLoading, error } = useAccount(address)

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
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold tracking-tight">Address</h1>
          {account?.isContract && (
            <Badge className="bg-purple-100 text-purple-800">
              <Code className="h-3 w-3 mr-1" />
              Contract
            </Badge>
          )}
        </div>
        <Link
          href={`${EXPLORER_URL}/address/${address}`}
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
          <p>Loading address details...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      ) : !account ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Address not found</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Address details and balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-mono break-all">{account.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">{account.balance} GOOD</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p>{account.transactionCount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p>{account.isContract ? "Contract" : "EOA (Externally Owned Account)"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              {account.isContract && <TabsTrigger value="contract">Contract</TabsTrigger>}
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Transactions involving this address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Transaction history will be displayed here</p>
                    <p className="text-sm mt-2">
                      For detailed transaction history, visit the{" "}
                      <Link
                        href={`${EXPLORER_URL}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        official explorer
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {account.isContract && (
              <TabsContent value="contract">
                <Card>
                  <CardHeader>
                    <CardTitle>Contract</CardTitle>
                    <CardDescription>Contract code and interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Contract Code</p>
                        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-64">
                          <pre className="text-xs font-mono">{account.code}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            <TabsContent value="tokens">
              <Card>
                <CardHeader>
                  <CardTitle>Tokens</CardTitle>
                  <CardDescription>Token balances for this address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Token balances will be displayed here</p>
                    <p className="text-sm mt-2">
                      For detailed token information, visit the{" "}
                      <Link
                        href={`${EXPLORER_URL}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        official explorer
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
