"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileCheck, FileText, QrCode, Search, Shield, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function VerifyPage() {
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [certificateId, setCertificateId] = useState("")

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!certificateId) return

    setVerificationStatus("loading")

    // Simulate verification process with a shorter timeout
    setTimeout(() => {
      if (certificateId === "BC12345" || certificateId === "BC12346") {
        setVerificationStatus("success")
      } else {
        setVerificationStatus("error")
      }
    }, 500) // Reduced from 1500ms to 500ms
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <Shield className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">CertChain</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Home
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Verify Certificate</h1>

          <Tabs defaultValue="id" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="id">Certificate ID</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="id" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verify by Certificate ID</CardTitle>
                  <CardDescription>
                    Enter the certificate ID to verify its authenticity on the blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerify}>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="certificate-id">Certificate ID</Label>
                        <Input
                          id="certificate-id"
                          placeholder="e.g. BC12345"
                          value={certificateId}
                          onChange={(e) => setCertificateId(e.target.value)}
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCertificateId("")}>
                    Clear
                  </Button>
                  <Button onClick={handleVerify} disabled={verificationStatus === "loading" || !certificateId}>
                    {verificationStatus === "loading" ? "Verifying..." : "Verify Certificate"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="qr" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verify by QR Code</CardTitle>
                  <CardDescription>Scan the QR code on the certificate to verify its authenticity.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 mb-4 w-full max-w-sm flex flex-col items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                      Position the QR code in front of your camera
                    </p>
                  </div>
                  <Button className="mt-4">
                    <Search className="mr-2 h-4 w-4" /> Scan QR Code
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="file" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verify by Certificate File</CardTitle>
                  <CardDescription>Upload the certificate file to verify its authenticity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 flex flex-col items-center justify-center">
                    <Upload className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Drag and drop your certificate file here, or click to browse
                    </p>
                    <Button variant="outline">Select File</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {verificationStatus === "success" && (
            <div className="mt-8">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">Certificate Verified</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  This certificate is authentic and has been verified on the blockchain.
                </AlertDescription>
              </Alert>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Certificate Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                        <p>BC12345</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                        <p>May 15, 2023</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-green-600 font-medium">Verified</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Certificate Name</p>
                      <p className="font-medium">Bachelor of Computer Science</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Issuing Institution</p>
                      <p>Tech University</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                      <p>John Doe</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Blockchain Transaction</p>
                      <p className="text-xs font-mono break-all">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> View Full Certificate
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {verificationStatus === "error" && (
            <Alert className="mt-8 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">Certificate Not Found</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                We couldn't verify this certificate. Please check the ID and try again, or contact support for
                assistance.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
      <footer className="border-t py-6 px-4 lg:px-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">© 2025 CertChain. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

