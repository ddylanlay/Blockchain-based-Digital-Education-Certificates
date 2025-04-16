import Link from "next/link"
import { Award, Calendar, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CertificateCardProps {
  id: string
  title: string
  institution: string
  recipient: string
  issueDate: string
  transactionHash: string
  isVerified: boolean
}

export function CertificateCard({
  id,
  title,
  institution,
  recipient,
  issueDate,
  transactionHash,
  isVerified,
}: CertificateCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-primary p-4 text-white">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm">{institution}</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{recipient}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Issued on {issueDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{transactionHash}</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span>Status: </span>
          {isVerified ? (
            <span className="rounded-md bg-blue-500 px-2 py-0.5 text-xs text-white">Verified</span>
          ) : (
            <span className="rounded-md bg-yellow-500 px-2 py-0.5 text-xs text-white">Pending</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t p-4">
        <Link href={`/dashboard/certificate/${id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        {isVerified && <span className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white">Verified</span>}
      </div>
    </div>
  )
}
