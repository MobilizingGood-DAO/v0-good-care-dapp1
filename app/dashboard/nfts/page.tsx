import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NFTGallery } from "@/components/nft-gallery"

export default function NFTsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">NFT Collection</h2>
        <p className="text-muted-foreground">Your ERC-721 and ERC-1155 tokens from the GOOD CARE Network</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All NFTs</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
          <TabsTrigger value="erc721">ERC-721</TabsTrigger>
          <TabsTrigger value="erc1155">ERC-1155</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <NFTGallery filter="all" />
        </TabsContent>
        <TabsContent value="reflections">
          <NFTGallery filter="reflections" />
        </TabsContent>
        <TabsContent value="erc721">
          <NFTGallery filter="erc721" />
        </TabsContent>
        <TabsContent value="erc1155">
          <NFTGallery filter="erc1155" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
