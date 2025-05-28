import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h1>
        <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl">
          Common questions about CARE Card and the GOOD ecosystem
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is CARE Card?</AccordionTrigger>
            <AccordionContent>
              CARE Card is a Vercel-ready app built on the GOOD CARE Subnet using AvaCloud's Wallets-as-a-Service. It
              provides a seamless onboarding experience into a kinder, regenerative crypto ecosystem. With one-click
              login via email or socials, users receive an embedded wallet that acts as their CARE Card — a living
              reflection of their care, contributions, and healing journey.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I get started with CARE Card?</AccordionTrigger>
            <AccordionContent>
              Getting started is easy! Simply click the "Get Your CARE Card" button on the homepage, or navigate to the
              registration page. You can sign up using your email or social accounts. Once registered, you'll receive
              your embedded wallet automatically, and you can start exploring the GOOD ecosystem right away.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What is the GOOD CARE Subnet?</AccordionTrigger>
            <AccordionContent>
              The GOOD CARE Subnet is a custom Avalanche Subnet designed specifically for regenerative economics and
              community care. It provides a fast, low-cost, and environmentally friendly platform for the GOOD
              ecosystem. The subnet enables seamless transactions, NFT minting, and other blockchain operations within
              the GOOD ecosystem.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What can I do with my CARE Card?</AccordionTrigger>
            <AccordionContent>
              With your CARE Card, you can view your $GOOD token balance, receive NFTs as reflections, care badges, or
              event mementos, send tokens or NFTs as acts of acknowledgment and care, and grow your card over time
              through Soulbound milestones and community action. Your card is a living reflection of your journey in the
              regenerative ecosystem.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How do I earn $GOOD tokens?</AccordionTrigger>
            <AccordionContent>
              You can earn $GOOD tokens through various activities within the ecosystem, such as participating in
              community events, achieving milestones, contributing to regenerative projects, and receiving tokens from
              other community members as acts of acknowledgment and care. The specific earning opportunities will be
              announced regularly through the platform.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>What are Soulbound milestones?</AccordionTrigger>
            <AccordionContent>
              Soulbound milestones are non-transferable NFTs that are permanently attached to your wallet. They
              represent significant achievements and contributions within the GOOD ecosystem. Unlike regular NFTs,
              Soulbound tokens cannot be transferred or sold, making them a true reflection of your personal journey and
              accomplishments.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Is my wallet secure?</AccordionTrigger>
            <AccordionContent>
              Yes, your embedded wallet is secured using AvaCloud's Wallets-as-a-Service technology, which provides
              enterprise-grade security. Your private keys are never exposed, and the wallet is protected by the
              authentication method you choose (email or social login). For additional security, we recommend enabling
              two-factor authentication in your account settings.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>How can I contribute to the GOOD ecosystem?</AccordionTrigger>
            <AccordionContent>
              There are many ways to contribute! You can participate in community events, join healing circles, share
              knowledge and resources, invite friends to join, and support regenerative projects. Each contribution
              helps grow the ecosystem and may be recognized with tokens, badges, or milestones. Check the community
              section regularly for opportunities to get involved.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
