import { ThirdwebNftMedia, useContract, useNFTs } from "@thirdweb-dev/react"
import { REFLECTION_NFT_CONTRACT } from "@/lib/reflection-minting"

const NFTGrid = () => {
  const { contract } = useContract(REFLECTION_NFT_CONTRACT)
  const { data: nfts, isLoading } = useNFTs(contract)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!nfts || nfts.length === 0) {
    return <div>No NFTs found.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts?.map((nft) => (
        <div key={nft.metadata.id} className="border rounded-md p-2">
          <ThirdwebNftMedia metadata={nft.metadata} width="100%" height="auto" />
          <div className="mt-2">
            <p className="font-semibold">{nft.metadata.name}</p>
            {/* <p className="text-gray-500">{nft.metadata.description}</p> */}
          </div>
        </div>
      ))}
    </div>
  )
}

export default NFTGrid
