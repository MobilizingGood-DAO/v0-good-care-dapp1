import { NextResponse } from "next/server"
import { ethers } from "ethers"

// Create a provider for the GOOD CARE Network
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_GOODCARE_RPC)

// Server-side wallet for faucet (in production, use secure key management)
// This is a demo wallet with test funds only
const FAUCET_PRIVATE_KEY =
  process.env.FAUCET_PRIVATE_KEY || "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider)

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!ethers.isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    // Check if the address has already been funded
    const funded = await hasFundedBefore(address)
    if (funded) {
      return NextResponse.json({ error: "Address already funded" }, { status: 400 })
    }

    // Send 0.1 CARE tokens to the address
    const tx = await faucetWallet.sendTransaction({
      to: address,
      value: ethers.parseEther("0.1"), // 0.1 CARE tokens
    })

    // Wait for transaction to be mined
    await tx.wait()

    // Record that this address has been funded
    await recordFunding(address)

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      amount: "0.1 CARE",
    })
  } catch (error) {
    console.error("Faucet error:", error)
    return NextResponse.json({ error: "Failed to fund wallet" }, { status: 500 })
  }
}

// In-memory store of funded addresses (in production, use a database)
const fundedAddresses = new Set<string>()

async function hasFundedBefore(address: string): Promise<boolean> {
  // In production, check a database
  return fundedAddresses.has(address.toLowerCase())
}

async function recordFunding(address: string): Promise<void> {
  // In production, record in a database
  fundedAddresses.add(address.toLowerCase())
}
