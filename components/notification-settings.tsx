"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="token-transfers" className="flex flex-col space-y-1">
            <span>Token Transfers</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications when tokens are sent or received
            </span>
          </Label>
          <Switch id="token-transfers" defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="nft-transfers" className="flex flex-col space-y-1">
            <span>NFT Transfers</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications when NFTs are sent or received
            </span>
          </Label>
          <Switch id="nft-transfers" defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="milestones" className="flex flex-col space-y-1">
            <span>Milestone Achievements</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications when you achieve a milestone
            </span>
          </Label>
          <Switch id="milestones" defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="community-updates" className="flex flex-col space-y-1">
            <span>Community Updates</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications about community events and updates
            </span>
          </Label>
          <Switch id="community-updates" defaultChecked />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">Receive notifications via email</span>
          </Label>
          <Switch id="email-notifications" defaultChecked />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  )
}
