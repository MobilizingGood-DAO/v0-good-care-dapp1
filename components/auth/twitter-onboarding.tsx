"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Twitter, Wallet, Shield } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export function TwitterOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: "connect",
      title: "Connect Twitter",
      description: "Link your Twitter account to get started",
      icon: <Twitter className="w-6 h-6" />,
      completed: false,
    },
    {
      id: "wallet",
      title: "Create Wallet",
      description: "We'll create a secure embedded wallet for you",
      icon: <Wallet className="w-6 h-6" />,
      completed: false,
    },
    {
      id: "secure",
      title: "Secure Profile",
      description: "Your profile and wallet are now secure",
      icon: <Shield className="w-6 h-6" />,
      completed: false,
    },
  ]

  const [onboardingSteps, setOnboardingSteps] = useState(steps)

  const handleTwitterConnect = async () => {
    setIsProcessing(true)

    // Simulate onboarding process
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setOnboardingSteps((prev) => prev.map((step, index) => (index <= i ? { ...step, completed: true } : step)))

      setCurrentStep(i + 1)
    }

    // After completion, redirect to Twitter OAuth
    setTimeout(() => {
      window.location.href = "/api/auth/twitter"
    }, 1000)
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to GOOD CARE</CardTitle>
          <CardDescription className="text-gray-600">Get started with your embedded wallet in seconds</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Setup Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  step.completed
                    ? "bg-green-50 border border-green-200"
                    : index === currentStep
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className={`flex-shrink-0 ${step.completed ? "text-green-600" : "text-gray-400"}`}>
                  {step.completed ? <CheckCircle className="w-6 h-6" /> : step.icon}
                </div>

                <div className="flex-1">
                  <h3 className={`font-medium ${step.completed ? "text-green-900" : "text-gray-900"}`}>{step.title}</h3>
                  <p className={`text-sm ${step.completed ? "text-green-700" : "text-gray-600"}`}>{step.description}</p>
                </div>

                {index === currentStep && isProcessing && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>

          {/* Action Button */}
          {!isProcessing ? (
            <Button
              onClick={handleTwitterConnect}
              className="w-full bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
              size="lg"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Get Started with Twitter
            </Button>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Setting up your account...</span>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Your wallet is secured with industry-standard encryption</p>
            <p>🌟 No seed phrases to remember - we handle the security</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
