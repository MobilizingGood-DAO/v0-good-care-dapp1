import { type NextRequest, NextResponse } from "next/server"
import { ThirdwebSDK } from "@thirdweb-dev/sdk"
import { Wallet, providers } from "ethers"

export async function POST(request: NextRequest) {
  console.log("🚀 Mint reflection API called")

  try {
    const body = await request.json()
    console.log("📦 Request body:", body)

    const { mood, journal, streak, address } = body

    if (!mood || !address) {
      console.log("❌ Missing required fields:", { mood, address })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("✅ Request validation passed")
    console.log("🔑 Environment check:")
    console.log("- MINTER_PRIVATE_KEY exists:", !!process.env.MINTER_PRIVATE_KEY)
    console.log("- GOODCARE_RPC exists:", !!process.env.NEXT_PUBLIC_GOODCARE_RPC)

    const date = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    // Initialize the signer with the minter private key
    console.log("🔗 Initializing provider and signer...")
    const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_GOODCARE_RPC)
    const signer = new Wallet(process.env.MINTER_PRIVATE_KEY!, provider)

    console.log("👛 Signer address:", await signer.getAddress())

    // Initialize Thirdweb SDK
    console.log("🔧 Initializing Thirdweb SDK...")
    const sdk = ThirdwebSDK.fromSigner(signer, {
      chainId: 741741, // GOOD CARE Network
      rpc: [process.env.NEXT_PUBLIC_GOODCARE_RPC!],
    })

    // Get the CARE Daily Reflections NFT Drop contract
    console.log("📋 Getting contract...")
    const contract = await sdk.getContract(
      "0x141b77a109011475A4c347fD19Dd4ead79AE912F", // CARE Daily Reflections contract
      "nft-drop",
    )

    console.log("📋 Contract loaded successfully")

    // Create metadata for the reflection NFT
    const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😄"]
    const moodLabels = ["", "Very Upset", "Somewhat Upset", "Neutral", "Somewhat Happy", "Very Happy"]

    const metadata = {
      name: `Daily Reflection – ${date}`,
      description: `A daily reflection from ${date} capturing mood and thoughts on the GOOD CARE journey. Mood: ${moodLabels[mood]} (${mood}/5). ${journal ? `Reflection: "${journal}"` : "No written reflection."}`,
      image: "ipfs://QmXRna91Fhh7MR1AErjRfpXMM9DnxTJ8eqjVtqxyBxVNu3/0.png", // Official CARE reflection badge
      attributes: [
        {
          trait_type: "Mood",
          value: moodLabels[mood],
        },
        {
          trait_type: "Mood Score",
          value: mood,
        },
        {
          trait_type: "Date",
          value: date,
        },
        {
          trait_type: "Streak",
          value: streak || 1,
        },
        {
          trait_type: "Has Reflection",
          value: journal ? "Yes" : "No",
        },
        {
          trait_type: "Reflection Length",
          value: journal ? journal.length : 0,
        },
      ],
      properties: {
        mood,
        journal: journal || "",
        streak: streak || 1,
        date,
        wallet: address,
      },
    }

    console.log("📝 Metadata created:", metadata)

    // Lazy mint the metadata (this creates the NFT template)
    console.log("🎨 Lazy minting metadata...")
    await contract.erc721.lazyMint([metadata])
    console.log("✅ Lazy mint successful")

    // Claim the NFT to the user's address
    console.log("🎁 Claiming NFT to user address:", address)
    const tx = await contract.claimTo(address, 1)
    console.log("✅ Claim successful, tx:", tx)

    const response = {
      success: true,
      transactionHash: tx.receipt.transactionHash,
      tokenId: tx.id.toString(),
    }

    console.log("🎉 Mint successful, response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("💥 Reflection mint error:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        error: `Mint failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}
