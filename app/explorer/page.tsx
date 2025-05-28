import { SearchBar } from "@/components/explorer/search-bar"
import { SimplifiedLatestTransactions } from "@/components/explorer/simplified-latest-transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ExplorerPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">GOOD CARE Network Explorer</h1>
          <Badge variant="secondary">Under Construction</Badge>
        </div>
        <p className="text-muted-foreground">Explore transactions on the GOOD CARE Network</p>
      </div>

      <SearchBar />

      <Card>
        <CardHeader>
          <CardTitle>Network Overview</CardTitle>
          <CardDescription>Current status of the GOOD CARE Network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">GCT Contract</p>
              <p className="text-sm font-bold text-green-600 break-all">0x10acd62bdfa7028b0A96710a9f6406446D2b1164</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Reflections Contract</p>
              <p className="text-sm font-bold text-green-600 break-all">0x5fb4048031364A47c320236312fF66CB42ae822F</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">NFT Collection</p>
              <p className="text-sm font-bold text-green-600 break-all">0xe91DC034e09f8D7E159C4a9A0bD62503e9E64Ee1</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Marketplace</p>
              <p className="text-sm font-bold text-green-600 break-all">0x70113Af9C760b02704db9d1D5eFCE0290C0d9c7b</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SimplifiedLatestTransactions />
    </div>
  )
}
