import { ThirdwebNFTGallery } from "@/components/thirdweb-nft-gallery"

export default function NFTsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NFT Collection</h1>
        <p className="text-muted-foreground">View your reflection NFTs minted on the GOOD CARE Network</p>
      </div>

      <ThirdwebNFTGallery />
    </div>
  )
}
