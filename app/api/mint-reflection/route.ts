import { type NextRequest, NextResponse } from "next/server"
import { ThirdwebSDK } from "@thirdweb-dev/sdk"
import { ethers } from "ethers"

export async function POST(request: NextRequest) {
  try {
    const { mood, journal, streak, address } = await request.json()

    if (!mood || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const date = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    // Initialize the signer with the minter private key
    const signer = new ethers.Wallet(
      process.env.MINTER_PRIVATE_KEY!,
      new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_GOODCARE_RPC),
    )

    // Initialize Thirdweb SDK
    const sdk = ThirdwebSDK.fromSigner(signer, {
      chainId: 741741, // GOOD CARE Network
      rpc: [process.env.NEXT_PUBLIC_GOODCARE_RPC!],
    })

    // Get the CARE Daily Reflections NFT Drop contract - UPDATED ADDRESS
    const contract = await sdk.getContract(
      "0x141b77a109011475A4c347fD19Dd4ead79AE912F", // CARE Daily Reflections contract
      "nft-drop",
    )

    // Create metadata for the reflection NFT
    const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😄"]
    const moodLabels = ["", "Very Upset", "Somewhat Upset", "Neutral", "Somewhat Happy", "Very Happy"]

    const metadata = {
      name: `Daily Reflection – ${date}`,
      description: `A daily reflection from ${date} capturing mood and thoughts on the GOOD CARE journey. Mood: ${moodLabels[mood]} (${mood}/5). ${journal ? `Reflection: "${journal}"` : "No written reflection."}`,
      image: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(moodEmojis[mood])}`,
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

    // Lazy mint the metadata (this creates the NFT template)
    await contract.erc721.lazyMint([metadata])

    // Claim the NFT to the user's address
    const tx = await contract.claimTo(address, 1)

    return NextResponse.json({
      success: true,
      transactionHash: tx.receipt.transactionHash,
      tokenId: tx.id.toString(),
    })
  } catch (error) {
    console.error("Reflection mint error:", error)
    return NextResponse.json({ error: "Mint failed. Please try again later." }, { status: 500 })
  }
}
