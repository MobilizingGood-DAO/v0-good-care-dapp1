import { SimpleNFTGallery } from "@/components/simple-nft-gallery"

export default function NFTsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your NFT Collection</h1>
        <p className="text-muted-foreground mt-2">
          View your daily reflection NFTs and track your wellness journey on the GOOD CARE Network.
        </p>
      </div>
      <SimpleNFTGallery />
    </div>
  )
}
