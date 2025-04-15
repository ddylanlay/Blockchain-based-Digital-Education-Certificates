import Link from "next/link"
import { Calendar, User, FileText, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CertificateCardProps {
  id: string
  name: string
  institution: string
  recipient?: string
  issueDate: string
  status: "verified" | "pending" | "revoked"
  txHash?: string
}

export function CertificateCard({
  id,
  name,
  institution,
  recipient = "Alex Johnson",
  issueDate,
  status,
  txHash,
}: CertificateCardProps) {
  const truncatedHash = txHash ? `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}` : ""

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border">
      <div className="bg-blue-500 text-white p-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-blue-100">{institution}</p>
      </div>
      <div className="p-4 space-y-3 bg-white">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>{recipient}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>Issued on {new Date(issueDate).toLocaleDateString()}</span>
        </div>
        {txHash && (
          <div className="flex items-center gap-2 text-sm font-mono">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{truncatedHash}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-gray-500" />
          <span>Status: </span>
          {status === "verified" && <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>}
          {status === "pending" && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              Pending
            </Badge>
          )}
          {status === "revoked" && (
            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
              Revoked
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
        <Link href={`/dashboard/certificate/${id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            View Details
          </Button>
        </Link>
        {status === "verified" && <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>}
      </div>
    </div>
  )
}
