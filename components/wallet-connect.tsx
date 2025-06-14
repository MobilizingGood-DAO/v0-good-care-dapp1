"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useBalance, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy } from "lucide-react"
import { GOOD_CARE_NETWORK, TOKEN_ADDRESSES } from "@/lib/blockchain-config"

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  const { data: careBalance } = useBalance({
    address,
    chainId: GOOD_CARE_NETWORK.chainId,
  })

  const { data: gctBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.GCT as `0x${string}`,
    chainId: GOOD_CARE_NETWORK.chainId,
  })

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const isOnCorrectNetwork = chain?.id === GOOD_CARE_NETWORK.chainId

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectButton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </span>
          {!isOnCorrectNetwork && <Badge variant="destructive">Wrong Network</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Address:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <Button size="sm" variant="ghost" onClick={copyAddress}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isOnCorrectNetwork && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CARE Balance:</span>
              <span className="text-sm font-medium">
                {careBalance ? `${Number(careBalance.formatted).toFixed(4)} CARE` : "0 CARE"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">GCT Balance:</span>
              <span className="text-sm font-medium">
                {gctBalance ? `${Number(gctBalance.formatted).toFixed(4)} GCT` : "0 GCT"}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.open(GOOD_CARE_NETWORK.explorerUrl, "_blank")}>
            <ExternalLink className="h-3 w-3 mr-1" />
            Explorer
          </Button>
          <Button size="sm" variant="outline" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
