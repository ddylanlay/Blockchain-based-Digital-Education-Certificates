"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Award,
  Calendar,
  FileText,
  CheckCircle,
  Download,
  Share2,
  Building,
  BookOpen,
  BadgeIcon as IdentificationCard,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock certificate data - in a real app, you would fetch this from an API
const certificatesData = [
  {
    id: "BC12345",
    name: "Bachelor of Computer Science",
    institution: "University of Technology",
    recipient: "Alex Johnson",
    issueDate: "2024-05-15",
    status: "verified",
    txHash: "0x7a8b...3f2e",
    certificateId: "cert-001",
    credentialType: "Academic Degree",
    studentId: "UTech-001",
    lastVerified: "Today, 10:45 AM",
  },
  {
    id: "BC12346",
    name: "Advanced Web Development",
    institution: "Code Academy",
    recipient: "Alex Johnson",
    issueDate: "2023-08-22",
    status: "verified",
    txHash: "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
    certificateId: "cert-002",
    credentialType: "Professional Certificate",
    studentId: "CA-2023-456",
    lastVerified: "Yesterday, 3:20 PM",
  },
  {
    id: "BC12347",
    name: "Data Science Fundamentals",
    institution: "Data Institute",
    recipient: "Alex Johnson",
    issueDate: "2024-01-10",
    status: "pending",
    txHash: "",
    certificateId: "cert-003",
    credentialType: "Course Certificate",
    studentId: "DI-789",
    lastVerified: "",
  },
]

export default function CertificateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [certificate, setCertificate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the certificate data from an API
    const cert = certificatesData.find((c) => c.id === params.id)
    if (cert) {
      setCertificate(cert)
    } else {
      // Certificate not found, redirect to dashboard
      router.push("/dashboard")
    }
    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return <div className="flex-1 p-8">Loading certificate details...</div>
  }

  if (!certificate) {
    return <div className="flex-1 p-8">Certificate not found</div>
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{certificate.name}</h1>
          {certificate.status === "verified" && <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>}
        </div>
        <p className="text-muted-foreground">{certificate.institution}</p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center border-b">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Award className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-center">{certificate.name}</h2>
          <p className="text-muted-foreground mt-1">Awarded to</p>
          <p className="text-xl font-semibold mt-1">{certificate.recipient}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">CERTIFICATE DETAILS</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{certificate.institution}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Credential Type</p>
                  <p className="font-medium">{certificate.credentialType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IdentificationCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{certificate.studentId}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">BLOCKCHAIN RECORD</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-medium">{certificate.certificateId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Blockchain Transaction</p>
                  <p className="font-mono text-sm">{certificate.txHash || "Pending"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {certificate.status === "verified" && (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-green-600 font-medium">Verified</span>
                      </>
                    )}
                    {certificate.status === "pending" && (
                      <>
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span className="text-yellow-600 font-medium">Pending</span>
                      </>
                    )}
                    {certificate.status === "revoked" && (
                      <>
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-red-600 font-medium">Revoked</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {certificate.status === "verified" && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Verified</p>
                    <p className="font-medium">{certificate.lastVerified}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex flex-wrap gap-3 justify-center">
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg border shadow-sm p-6">
        <h3 className="font-bold mb-4">Verification Instructions</h3>
        <p className="text-muted-foreground mb-4">
          This certificate can be verified directly on the blockchain. To verify this certificate independently:
        </p>
        <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
          <li>
            Visit the{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              official CertChain verification portal
            </Link>
          </li>
          <li>
            Enter the Certificate ID: <span className="font-mono">{certificate.certificateId}</span>
          </li>
          <li>Alternatively, scan the QR code from the PDF version of this certificate</li>
        </ol>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
