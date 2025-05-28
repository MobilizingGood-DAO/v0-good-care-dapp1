import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvaCloudWallet } from "@/components/avacloud/avacloud-wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
        <p className="text-muted-foreground">Manage your GCT and CARE tokens with AvaCloud WaaS</p>
      </div>

      <div className="grid gap-6">
        <AvaCloudWallet />
      </div>

      <Tabs defaultValue="nfts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
        </TabsList>
        <TabsContent value="nfts">
          <Card>
            <CardHeader>
              <CardTitle>NFT Collection</CardTitle>
              <CardDescription>Your GOOD CARE Network NFTs and Reflections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground py-4">
                Your NFTs and Reflections will appear here. Mint reflections from your daily check-ins!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
