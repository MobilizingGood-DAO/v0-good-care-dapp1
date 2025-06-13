"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wallet, Copy, Check, ExternalLink, Send, Download, QrCode, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/providers/wallet-provider"
import { CHAIN_CONFIG } from "@/lib/blockchain-config"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { exportPrivateKey } from "@/lib/avacloud-waas"
import { Label } from "@/components/ui/label"

export function AvaCloudWallet() {
  const [copied, setCopied] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const [showingPrivateKey, setShowingPrivateKey] = useState(false)
  const [privateKey, setPrivateKey] = useState("")
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false)

  const { address, isConnected, isCorrectChain, connectWallet, switchNetwork } = useWallet()
  const { balances, isLoading, error } = useTokenBalances()

  const displayAddress = address
    ? showAddress
      ? address
      : address.substring(0, 6) + "..." + address.substring(address.length - 4)
    : "Not connected"

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey)
      setPrivateKeyCopied(true)
      setTimeout(() => setPrivateKeyCopied(false), 2000)
    }
  }

  const handleExportPrivateKey = async () => {
    if (!address) return

    setExportLoading(true)
    setExportError(null)

    try {
      const result = await exportPrivateKey(address)
      if (result.success) {
        setPrivateKey(result.privateKey)
        setShowingPrivateKey(true)
      } else {
        setExportError("Failed to export private key")
      }
    } catch (error) {
      setExportError("An error occurred while exporting private key")
      console.error(error)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            <span>Non-Custodial Wallet</span>
          </div>
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${isCorrectChain ? "bg-green-600" : "bg-yellow-500"}`}></div>
              <span>{isCorrectChain ? "GOOD CARE Network" : "Wrong Network"}</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Powered by AvaCloud WaaS - You control your private keys
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Non-Custodial Mode:</strong> You have full control over your private keys.
                Make sure to backup your wallet after connecting.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">Connect your wallet to view your balance and details.</p>
            <Button onClick={connectWallet} className="w-full bg-green-600 hover:bg-green-700">
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            {!isCorrectChain && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You're not connected to the GOOD CARE Network (Chain ID: {CHAIN_CONFIG.chainId})
                  <Button size="sm" onClick={switchNetwork} className="ml-2">
                    Switch Network
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Non-Custodial Wallet Active:</strong> You have full control over your funds.
                Your private key can be exported below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="text-sm font-medium">Wallet Address</div>
              <div className="flex items-center space-x-2">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm flex-1 overflow-hidden">
                  {displayAddress}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddress(!showAddress)}>
                  {showAddress ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard} disabled={!address}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Wallet Address QR Code</DialogTitle>
                      <DialogDescription>Scan this QR code to send tokens to your wallet</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center p-4">
                      <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                        <p className="text-sm text-center text-gray-500">QR Code for {displayAddress}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="tokens" className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h3 className="font-medium">Token Balances</h3>
                  </div>
                  <div className="border-t">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Loading balances...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 text-center text-red-500">{error}</div>
                    ) : (
                      <div className="divide-y">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <span className="text-green-600 font-semibold">G</span>
                            </div>
                            <div>
                              <div className="font-medium">{balances.gct.symbol}</div>
                              <div className="text-sm text-muted-foreground">{balances.gct.name}</div>
                            </div>
                          </div>
                          <div className="font-medium">{balances.gct.balance}</div>
                        </div>

                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center">
                            <img
                              src="/images/care-token-logo.png"
                              alt="CARE Token"
                              className="h-8 w-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="font-medium">{balances.care.symbol}</div>
                              <div className="text-sm text-muted-foreground">{balances.care.name}</div>
                            </div>
                          </div>
                          <div className="font-medium">{balances.care.balance}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nfts">
                <div className="rounded-md border p-4 text-center">
                  <p className="text-muted-foreground">Your NFTs will appear here</p>
                  <p className="text-sm text-muted-foreground mt-1">Check the NFTs tab for a complete gallery</p>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-3">
                <Button className="w-full flex items-center" asChild>
                  <a href="/dashboard/send">
                    <Send className="mr-2 h-4 w-4" />
                    Send Tokens
                  </a>
                </Button>

                <Button variant="outline" className="w-full flex items-center" asChild>
                  <a href={`/explorer/address/${address}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </a>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export Private Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Export Private Key</DialogTitle>
                      <DialogDescription>
                        Your private key gives you complete control over your wallet. Keep it safe and never share it.
                      </DialogDescription>
                    </DialogHeader>

                    {!showingPrivateKey ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Warning:</strong> Anyone with your private key can access your funds.
                            Store it securely and never share it with anyone.
                          </AlertDescription>
                        </Alert>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-medium text-blue-900 mb-2">Best Practices:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Store offline in a secure location</li>
                            <li>• Never share via email or messaging</li>
                            <li>• Consider using a hardware wallet</li>
                            <li>• Make multiple secure backups</li>
                          </ul>
                        </div>

                        {exportError && (
                          <Alert variant="destructive">
                            <AlertDescription>{exportError}</AlertDescription>
                          </Alert>
                        )}

                        <Button onClick={handleExportPrivateKey} disabled={exportLoading} className="w-full">
                          {exportLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            "I understand, export my private key"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Private key exported successfully. Copy and store it securely.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label>Your Private Key</Label>
                          <div className="p-3 bg-gray-100 rounded-md break-all font-mono text-xs border">
                            {privateKey}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={copyPrivateKey} className="flex-1">
                            {privateKeyCopied ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowingPrivateKey(false)
                              setPrivateKey("")
                            }}
                          >
                            Close
                          </Button>
                        </div>

                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            This private key will not be shown again. Make sure you've saved it securely.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
