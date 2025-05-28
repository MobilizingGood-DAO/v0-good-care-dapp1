"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, BookOpen, CheckCircle, HelpCircle, X } from "lucide-react"

export function CryptoExplainer() {
  const [showExplainer, setShowExplainer] = useState(true)

  // Check if the user has dismissed the explainer before
  useState(() => {
    const dismissed = localStorage.getItem("cryptoExplainerDismissed")
    if (dismissed === "true") {
      setShowExplainer(false)
    }
  })

  const dismissExplainer = () => {
    localStorage.setItem("cryptoExplainerDismissed", "true")
    setShowExplainer(false)
  }

  if (!showExplainer) {
    return (
      <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setShowExplainer(true)}>
        <HelpCircle className="h-4 w-4" />
        <span>Crypto Help</span>
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            New to Crypto?
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={dismissExplainer}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardDescription>Here's a quick guide to help you understand the basics</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What are CARE and GCT tokens?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                <strong>CARE</strong> is the native token of the GOOD CARE Network. It's used to pay for transactions
                and is the foundation of the ecosystem.
              </p>
              <p>
                <strong>GCT (GOOD CARE TOKEN)</strong> is a utility token that represents your participation in the
                community. You can send GCT to others as a way to show appreciation.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What is a wallet?</AccordionTrigger>
            <AccordionContent>
              <p>
                Your wallet is your digital identity on the blockchain. It stores your tokens and NFTs. Think of it like
                a combination of a bank account and digital ID. Your wallet has a unique address that starts with "0x".
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>What are NFTs and Reflections?</AccordionTrigger>
            <AccordionContent>
              <p>
                NFTs (Non-Fungible Tokens) are unique digital items that you can own. In the GOOD ecosystem, Reflections
                are special NFTs that represent moments of care, achievements, or participation in events.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>How do I earn more tokens?</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check in daily to earn CARE and GCT tokens</li>
                <li>Participate in community events</li>
                <li>Complete achievements to earn badges</li>
                <li>Contribute to regenerative projects</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Is my information safe?</AccordionTrigger>
            <AccordionContent>
              <p>
                Yes! Your wallet is secured by advanced cryptography. Just remember to keep your recovery phrase safe
                and never share it with anyone. The GOOD CARE Network prioritizes privacy and security.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>Still have questions? Visit our Help Center</span>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={dismissExplainer}>
          <CheckCircle className="h-4 w-4" />
          <span>Got it</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
