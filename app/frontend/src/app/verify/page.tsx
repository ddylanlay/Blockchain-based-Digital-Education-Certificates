"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, FileCheck, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api"
import { Asset } from "@/lib/types"

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [certificate, setCertificate] = useState<Asset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<'pending' | 'verified' | 'invalid' | null>(null)

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setError("Please enter a certificate ID")
      return
    }

    setIsVerifying(true)
    setError(null)
    setCertificate(null)
    setVerificationResult(null)

    try {
      const response = await apiService.getAssetById(certificateId.trim())
      
      if (response.success && response.data) {
        setCertificate(response.data)
        
        // Simulate verification process
        setTimeout(() => {
          setVerificationResult(
            response.data!.status === 'issued' ? 'verified' : 
            response.data!.status === 'revoked' ? 'invalid' : 'pending'
          )
          setIsVerifying(false)
        }, 1500)
      } else {
        setError(response.error || 'Certificate not found')
        setVerificationResult('invalid')
        setIsVerifying(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify certificate')
      setVerificationResult('invalid')
      setIsVerifying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Revoked
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <Shield className="h-6 w-6 text-primary" />
          <span>CertChain</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Verify Certificate</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter a certificate ID to verify its authenticity on the blockchain. 
            This verification ensures the certificate is genuine and hasn't been tampered with.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Certificate Verification
            </CardTitle>
            <CardDescription>
              Enter the certificate ID provided by the institution or student
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certificateId">Certificate ID</Label>
              <div className="flex gap-2">
                <Input
                  id="certificateId"
                  placeholder="Enter certificate ID (e.g., CERT-001)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  disabled={isVerifying}
                />
                <Button 
                  onClick={handleVerify}
                  disabled={isVerifying || !certificateId.trim()}
                  className="min-w-[100px]"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {verificationResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {verificationResult === 'verified' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {verificationResult === 'invalid' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {verificationResult === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult === 'verified' && certificate && (
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                      <strong>Certificate Verified Successfully!</strong> This certificate is authentic and valid.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Certificate Holder</Label>
                        <p className="text-lg font-semibold">{certificate.owner}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                        <p>{certificate.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Certificate Type</Label>
                        <p>{certificate.certificateType}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Academic Year</Label>
                        <p>{certificate.academicYear}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Issue Date</Label>
                        <p>{certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'Not available'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(certificate.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {certificate.txHash && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Blockchain Transaction</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm font-mono bg-background px-2 py-1 rounded border">
                          {certificate.txHash}
                        </code>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {verificationResult === 'invalid' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Certificate Not Found or Invalid!</strong> The certificate ID you entered could not be verified. 
                    Please check the ID and try again.
                  </AlertDescription>
                </Alert>
              )}

              {verificationResult === 'pending' && certificate && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Certificate Pending Verification!</strong> This certificate exists but has not yet been issued. 
                    Please contact the issuing institution for more information.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our verification system uses blockchain technology to ensure certificates cannot be forged or altered.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instant Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get immediate results when verifying any certificate issued through our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tamper-Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Once issued, certificates cannot be altered, ensuring their integrity forever.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}