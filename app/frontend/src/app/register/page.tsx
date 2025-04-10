"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ChevronRight, Shield, Wallet } from "lucide-react"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")

  const [selectedType, setSelectedType] = useState<"none" | "institution">("none")

  // Set the initial type based on URL parameter
  useEffect(() => {
    if (typeParam === "institution") {
      setSelectedType("institution")
    }
  }, [typeParam])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold">
        <Shield className="h-6 w-6 text-primary" />
        <span>CertChain</span>
      </Link>

      {selectedType === "none" && (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Join CertChain</CardTitle>
            <CardDescription className="text-center">Register as an institution to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50"
              onClick={() => setSelectedType("institution")}
            >
              <Building2 className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-medium">Register as Institution</div>
                <div className="text-xs text-muted-foreground">For universities, colleges, and training centers</div>
              </div>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}

      {selectedType === "institution" && <InstitutionRegistration onBack={() => setSelectedType("none")} />}
    </div>
  )
}

function InstitutionRegistration({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    email: "",
    contactName: "",
    contactPhone: "",
    website: "",
    address: "",
    country: "",
    verificationStatus: "pending",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setConnectionError("")

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in MetaMask.")
      }

      // Set the wallet address
      setWalletAddress(accounts[0])
      setWalletConnected(true)

      // Move to next step after successful connection
      setTimeout(() => {
        setStep(2)
      }, 1000)
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error)
      setConnectionError(error.message || "Failed to connect to MetaMask. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const nextStep = () => {
    setStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    if (step === 1) onBack()
    else setStep((prev) => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would submit the form data along with the wallet address to your backend
    console.log("Institution registration data:", { ...formData, walletAddress })
    nextStep()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prevStep}>
            Back
          </Button>
          <div className="text-xs text-muted-foreground">Step {step} of 3</div>
        </div>
        <CardTitle className="text-2xl font-bold">Institution Registration</CardTitle>
        <CardDescription>
          {step === 1 && "Connect your MetaMask wallet to register your institution"}
          {step === 2 && "Provide your institution details"}
          {step === 3 && "Registration complete! Verify your email to continue"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Wallet className="h-12 w-12 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your MetaMask wallet to register your institution on the blockchain.
                </p>
              </div>

              {connectionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {connectionError}
                </div>
              )}

              {walletConnected ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm w-full">
                  <p className="font-medium">Wallet Connected</p>
                  <p className="text-xs mt-1 break-all">{walletAddress}</p>
                </div>
              ) : (
                <Button type="button" className="w-full" onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? "Connecting..." : "Connect MetaMask Wallet"}
                </Button>
              )}

              <div className="text-xs text-muted-foreground text-center">
                <p>Don't have MetaMask?</p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Download MetaMask
                </a>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Institution Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="University of Technology"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Institution Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Select institution type
                  </option>
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="training">Training Center</option>
                  <option value="school">School</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Institution Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="admin@university.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="contactName" className="text-sm font-medium">
                  Contact Person Name
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="John Smith"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="contactPhone" className="text-sm font-medium">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="website" className="text-sm font-medium">
                  Website (Optional)
                </label>
                <input
                  id="website"
                  name="website"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://university.edu"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="123 Education St."
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Select country
                  </option>
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                  <option value="uk">United Kingdom</option>
                  <option value="au">Australia</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                <p className="font-medium">Connected Wallet</p>
                <p className="text-xs mt-1 break-all">{walletAddress}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Registration Submitted</h3>
              <p className="text-center text-muted-foreground">
                Thank you for registering your institution with CertChain. We've sent a verification email to{" "}
                {formData.email}.
              </p>
              <p className="text-center text-muted-foreground">
                Your account is pending verification. Our team will review your information within 1-3 business days.
              </p>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm w-full">
                <p className="font-medium">Institution Wallet Address</p>
                <p className="text-xs mt-1 break-all">{walletAddress}</p>
                <p className="text-xs mt-2">
                  This wallet address will be used to issue and verify certificates on the blockchain.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {step < 3 && (
            <>
              <Button variant="outline" type="button" onClick={prevStep}>
                Back
              </Button>
              {step === 1 && walletConnected && (
                <Button type="button" onClick={nextStep}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              {step === 2 && <Button type="submit">Submit Registration</Button>}
            </>
          )}

          {step === 3 && (
            <Button className="w-full" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

