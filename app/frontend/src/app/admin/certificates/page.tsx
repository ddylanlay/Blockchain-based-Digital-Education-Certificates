"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Award, Download, Eye, FileText, MoreHorizontal, Plus, Search, Shield, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for certificates
const certificatesData = [
  {
    id: "CERT-001",
    studentName: "John Smith",
    department: "Computer Science",
    academicYear: "2022-2023",
    joinDate: "2019-09-01",
    endDate: "2023-05-30",
    certificateType: "Degree Certificate",
    issueDate: "2023-06-15",
    status: "issued",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  },
  {
    id: "CERT-002",
    studentName: "Emily Johnson",
    department: "Electrical Engineering",
    academicYear: "2022-2023",
    joinDate: "2019-09-01",
    endDate: "2023-05-30",
    certificateType: "Degree Certificate",
    issueDate: "2023-06-15",
    status: "issued",
    txHash: "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
  },
  {
    id: "CERT-003",
    studentName: "Michael Brown",
    department: "Business Administration",
    academicYear: "2022-2023",
    joinDate: "2019-09-01",
    endDate: "2023-05-30",
    certificateType: "Degree Certificate",
    issueDate: "2023-06-16",
    status: "issued",
    txHash: "0xz9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g",
  },
  {
    id: "CERT-004",
    studentName: "Sarah Davis",
    department: "Psychology",
    academicYear: "2022-2023",
    joinDate: "2019-09-01",
    endDate: "2023-05-30",
    certificateType: "Degree Certificate",
    issueDate: "2023-06-16",
    status: "pending",
    txHash: "",
  },
  {
    id: "CERT-005",
    studentName: "David Wilson",
    department: "Mechanical Engineering",
    academicYear: "2022-2023",
    joinDate: "2019-09-01",
    endDate: "2023-05-30",
    certificateType: "Degree Certificate",
    issueDate: "2023-06-17",
    status: "pending",
    txHash: "",
  },
  {
    id: "CERT-006",
    studentName: "Jennifer Martinez",
    department: "Chemistry",
    academicYear: "2022-2023",
    joinDate: "2019-09-01",
    endDate: "2023-05-30",
    certificateType: "Degree Certificate",
    issueDate: "2023-06-17",
    status: "revoked",
    txHash: "0xq1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9",
    revokedReason: "Administrative error in certificate details",
  },
]

export default function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [certificates, setCertificates] = useState(certificatesData)

  // Get unique departments for filter
  const departments = Array.from(new Set(certificates.map((cert) => cert.department)))

  // Filter certificates based on search query and filters
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || cert.department === departmentFilter
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleRevokeCertificate = (id: string) => {
    // In a real application, this would make an API call to revoke the certificate
    console.log(`Revoking certificate ${id}`)

    // Update the UI optimistically
    setCertificates((prev) =>
      prev.map((cert) =>
        cert.id === id ? { ...cert, status: "revoked", revokedReason: "Manually revoked by administrator" } : cert,
      ),
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/admin">
          <Shield className="h-6 w-6 text-primary" />
          <span>CertChain</span>
        </Link>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Certificates Management</h1>
          <Button asChild>
            <Link href="/admin/certificates/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload New Certificate
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search certificates by name, ID, or department..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Certificates</TabsTrigger>
            <TabsTrigger value="issued">Issued</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="revoked">Revoked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <CertificatesList certificates={filteredCertificates} onRevoke={handleRevokeCertificate} />
          </TabsContent>

          <TabsContent value="issued" className="mt-6">
            <CertificatesList
              certificates={filteredCertificates.filter((cert) => cert.status === "issued")}
              onRevoke={handleRevokeCertificate}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <CertificatesList
              certificates={filteredCertificates.filter((cert) => cert.status === "pending")}
              onRevoke={handleRevokeCertificate}
            />
          </TabsContent>

          <TabsContent value="revoked" className="mt-6">
            <CertificatesList
              certificates={filteredCertificates.filter((cert) => cert.status === "revoked")}
              onRevoke={handleRevokeCertificate}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function CertificatesList({
  certificates,
  onRevoke,
}: {
  certificates: typeof certificatesData
  onRevoke: (id: string) => void
}) {
  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No certificates found</h3>
        <p className="text-sm text-muted-foreground mt-1">There are no certificates matching your current filters.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <Card key={cert.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {cert.studentName}
                  {cert.status === "issued" && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      Issued
                    </Badge>
                  )}
                  {cert.status === "pending" && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    >
                      Pending
                    </Badge>
                  )}
                  {cert.status === "revoked" && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      Revoked
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{cert.department}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </DropdownMenuItem>
                  {cert.status !== "revoked" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onRevoke(cert.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke Certificate
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center justify-center bg-muted/50 p-6">
              <div className="relative flex h-32 w-full items-center justify-center rounded-lg border border-dashed">
                <Award className="h-12 w-12 text-muted-foreground/50" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 flex flex-col space-y-2">
            <div className="w-full flex justify-between items-center">
              <div className="text-xs text-muted-foreground">ID: {cert.id}</div>
              <div className="text-xs text-muted-foreground">
                Issued: {new Date(cert.issueDate).toLocaleDateString()}
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-xs text-muted-foreground">Academic Year: {cert.academicYear}</div>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-3 w-3" />
                View
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

