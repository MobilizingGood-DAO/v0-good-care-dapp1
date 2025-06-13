import { SendForm } from "@/components/send-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SendPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Send</h2>
        <p className="text-muted-foreground">Send GCT tokens or NFTs as acts of acknowledgment and care</p>
      </div>

      <Tabs defaultValue="tokens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tokens">Send Tokens</TabsTrigger>
          <TabsTrigger value="nfts">Send NFTs</TabsTrigger>
        </TabsList>
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle>Send GCT Tokens</CardTitle>
              <CardDescription>Send GOOD CARE TOKEN (GCT) to another wallet or user</CardDescription>
            </CardHeader>
            <CardContent>
              <SendForm type="token" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nfts">
          <Card>
            <CardHeader>
              <CardTitle>Send NFTs</CardTitle>
              <CardDescription>Send transferable NFTs from your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <SendForm type="nft" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
