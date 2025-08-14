"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && typeof window.ethereum !== "undefined"

  // Handle MetaMask connection
  const connectWallet = async () => {
    setError("")
    setIsConnecting(true)

    try {
      if (!isMetaMaskInstalled) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in MetaMask.")
      }

      // Set the wallet address
      setWalletAddress(accounts[0])

      // Simulate authentication process
      setTimeout(() => {
        // Set a cookie to simulate authentication
        document.cookie = "auth_token=dummy_token; path=/; max-age=86400"

        setIsRedirecting(true)
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error)
      setError(error.message || "Failed to connect to MetaMask. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold">
        <Shield className="h-6 w-6 text-primary" />
        <span>CertChain</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login with MetaMask</CardTitle>
          <CardDescription>Connect your MetaMask wallet to access your certificates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {walletAddress ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">Wallet Connected</p>
              <p className="text-xs mt-1 break-all">{walletAddress}</p>
              {isRedirecting && <p className="text-xs mt-2">Redirecting to dashboard...</p>}
            </div>
          ) : (
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <Wallet className="h-5 w-5" />
              {isConnecting ? "Connecting..." : "Connect MetaMask Wallet"}
            </Button>
          )}

          {!isMetaMaskInstalled && (
            <div className="text-center text-sm text-muted-foreground">
              <p>MetaMask is not installed.</p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Download MetaMask
              </a>
            </div>
          )}

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="outline" className="w-full" type="button">
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Continue with Apple
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

