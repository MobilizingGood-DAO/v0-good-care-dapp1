import { type NextRequest, NextResponse } from "next/server"
import { Wallet, providers, utils } from "ethers"

// Track funded addresses to prevent abuse
const fundedAddresses = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Check if address has already been funded
    if (fundedAddresses.has(address.toLowerCase())) {
      return NextResponse.json({ error: "Address has already been funded" }, { status: 400 })
    }

    // Initialize provider and faucet wallet
    const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_GOODCARE_RPC)
    const faucetWallet = new Wallet(process.env.FAUCET_PRIVATE_KEY!, provider)

    // Check faucet balance
    const faucetBalance = await faucetWallet.getBalance()
    const fundAmount = utils.parseEther("0.1") // 0.1 CARE

    if (faucetBalance.lt(fundAmount)) {
      return NextResponse.json({ error: "Faucet is currently empty. Please try again later." }, { status: 503 })
    }

    // Send CARE tokens to the user's address
    const tx = await faucetWallet.sendTransaction({
      to: address,
      value: fundAmount,
      gasLimit: 21000,
    })

    // Wait for transaction confirmation
    await tx.wait()

    // Mark address as funded
    fundedAddresses.add(address.toLowerCase())

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      amount: "0.1",
    })
  } catch (error) {
    console.error("Faucet error:", error)
    return NextResponse.json(
      {
        error: "Unable to fund wallet right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}
