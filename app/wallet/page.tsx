"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Send } from "lucide-react"

export default function Wallet() {
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [activeTab, setActiveTab] = useState("care")

  // Mock data - in a real app, this would come from your blockchain connection
  const walletData = {
    address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    care: {
      balance: "1250.00",
      symbol: "CARE",
      name: "CARE Token",
      isNative: true,
    },
    gct: {
      balance: "75.50",
      symbol: "GCT",
      address: "0x10acd62bdfa7028b0A96710a9f6406446D2b1164",
      name: "GOOD Care Token",
      isNative: false,
    },
  }

  const handleSend = async () => {
    // In a real app, this would connect to the blockchain
    console.log({
      token: activeTab,
      amount: sendAmount,
      recipient: recipientAddress,
    })

    // Reset form
    setSendAmount("")
    setRecipientAddress("")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const exportWallet = () => {
    // In a real app, this would trigger wallet export functionality
    console.log("Exporting wallet")
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Wallet Address</CardTitle>
            <CardDescription>Your unique identifier on the GOOD CARE Network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border break-all">
              <span className="text-sm font-mono">{walletData.address}</span>
              <button onClick={() => copyToClipboard(walletData.address)} className="p-1 hover:bg-gray-200 rounded">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={exportWallet}>
              Export Wallet
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Your combined token value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{walletData.care.symbol}</span>
                <span className="font-bold">{walletData.care.balance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{walletData.gct.symbol}</span>
                <span className="font-bold">{walletData.gct.balance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="care" className="mb-8">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="care" onClick={() => setActiveTab("care")}>
            CARE Token
          </TabsTrigger>
          <TabsTrigger value="gct" onClick={() => setActiveTab("gct")}>
            GCT Token
          </TabsTrigger>
        </TabsList>

        <TabsContent value="care">
          <Card>
            <CardHeader>
              <CardTitle>{walletData.care.name}</CardTitle>
              <CardDescription>Native token of the GOOD CARE Subnet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-3xl font-bold">
                    {walletData.care.balance} {walletData.care.symbol}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-700">C</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="care-recipient">Recipient Address</Label>
                  <Input
                    id="care-recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="care-amount">Amount</Label>
                  <Input
                    id="care-amount"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full flex items-center gap-2"
                disabled={!sendAmount || !recipientAddress}
                onClick={handleSend}
              >
                <Send className="h-4 w-4" /> Send {walletData.care.symbol}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="gct">
          <Card>
            <CardHeader>
              <CardTitle>{walletData.gct.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-1">
                  <span>
                    Contract: {walletData.gct.address.substring(0, 6)}...
                    {walletData.gct.address.substring(walletData.gct.address.length - 4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(walletData.gct.address)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <a
                    href={`https://subnets.avax.network/goodcare/mainnet/token/${walletData.gct.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-3xl font-bold">
                    {walletData.gct.balance} {walletData.gct.symbol}
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-700">G</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="gct-recipient">Recipient Address</Label>
                  <Input
                    id="gct-recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="gct-amount">Amount</Label>
                  <Input
                    id="gct-amount"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    type="number"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full flex items-center gap-2"
                disabled={!sendAmount || !recipientAddress}
                onClick={handleSend}
              >
                <Send className="h-4 w-4" /> Send {walletData.gct.symbol}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent token transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border-b">
              <div>
                <p className="font-medium">Received CARE</p>
                <p className="text-sm text-gray-500">From: 0x1a2...3f4g</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+50 CARE</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border-b">
              <div>
                <p className="font-medium">Sent GCT</p>
                <p className="text-sm text-gray-500">To: 0x7h8...9j0k</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">-10 GCT</p>
                <p className="text-xs text-gray-500">5 days ago</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3">
              <div>
                <p className="font-medium">Check-in Reward</p>
                <p className="text-sm text-gray-500">From: System</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+15 CARE</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Transactions
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
