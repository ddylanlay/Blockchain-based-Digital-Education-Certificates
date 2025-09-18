"use client"

import { useState, useEffect } from "react"
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
import { Award, Download, Eye, FileText, MoreHorizontal, Plus, Search, Shield, Trash2, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@/components/wallet-provider"
import { apiService } from "@/lib/api"
import type { Asset } from "@/app/types"

export default function CertificatesPage() {
  const { isConnected } = useWallet()
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [certificates, setCertificates] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getAllAssets()
      
      if (response.success) {
        setCertificates(response.data || [])
      } else {
        setError(response.error || 'Failed to load certificates')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(certificates.map((cert) => cert.department)))

  // Filter certificates based on search query and filters
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || cert.department === departmentFilter
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleIssueCertificate = async (id: string) => {
    try {
      const response = await apiService.updateAssetStatus(id, 'issued')
      
      if (response.success) {
        loadCertificates() // Reload to get updated data
      } else {
        setError(response.error || 'Failed to issue certificate')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue certificate')
    }
  }

  const handleRevokeCertificate = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this certificate?')) return
    
    try {
      const response = await apiService.updateAssetStatus(id, 'revoked')
      
      if (response.success) {
        loadCertificates() // Reload to get updated data
      } else {
        setError(response.error || 'Failed to revoke certificate')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke certificate')
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) return
    
    try {
      const response = await apiService.deleteAsset(id)
      
      if (response.success) {
        loadCertificates() // Reload to get updated data
      } else {
        setError(response.error || 'Failed to delete certificate')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete certificate')
    }
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/admin">
            <Shield className="h-6 w-6 text-primary" />
            <span>CertChain</span>
          </Link>
        </header>
        <main className="flex-1 container mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please connect your wallet to access the certificates management system.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
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

        {error && (
          <Card className="border-destructive mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading certificates...
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Certificates</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="issued">Issued</TabsTrigger>
                <TabsTrigger value="revoked">Revoked</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <CertificatesList 
                  certificates={filteredCertificates} 
                  onIssue={handleIssueCertificate}
                  onRevoke={handleRevokeCertificate} 
                  onDelete={handleDeleteCertificate}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <CertificatesList
                  certificates={filteredCertificates.filter((cert) => cert.status === "pending")}
                  onIssue={handleIssueCertificate}
                  onRevoke={handleRevokeCertificate}
                  onDelete={handleDeleteCertificate}
                />
              </TabsContent>

              <TabsContent value="issued" className="mt-6">
                <CertificatesList
                  certificates={filteredCertificates.filter((cert) => cert.status === "issued")}
                  onIssue={handleIssueCertificate}
                  onRevoke={handleRevokeCertificate}
                  onDelete={handleDeleteCertificate}
                />
              </TabsContent>

              <TabsContent value="revoked" className="mt-6">
                <CertificatesList
                  certificates={filteredCertificates.filter((cert) => cert.status === "revoked")}
                  onIssue={handleIssueCertificate}
                  onRevoke={handleRevokeCertificate}
                  onDelete={handleDeleteCertificate}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

function CertificatesList({
  certificates,
  onIssue,
  onRevoke,
  onDelete,
}: {
  certificates: Asset[]
  onIssue: (id: string) => Promise<void>
  onRevoke: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Issued
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            Pending
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            Revoked
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            Draft
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <Card key={cert.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {cert.owner}
                  {getStatusBadge(cert.status)}
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
                  {cert.status === "pending" && (
                    <DropdownMenuItem onClick={() => onIssue(cert.id)} className="text-green-600">
                      <Award className="mr-2 h-4 w-4" />
                      Issue Certificate
                    </DropdownMenuItem>
                  )}
                  {cert.status !== "revoked" && cert.status !== "draft" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-orange-600" onClick={() => onRevoke(cert.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke Certificate
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDelete(cert.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Certificate
                  </DropdownMenuItem>
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
                {cert.issueDate ? `Issued: ${new Date(cert.issueDate).toLocaleDateString()}` : 'Not issued'}
              </div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-xs text-muted-foreground">Academic Year: {cert.academicYear}</div>
              <div className="text-xs text-muted-foreground">Type: {cert.certificateType}</div>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                TX: {cert.txHash ? `${cert.txHash.slice(0, 10)}...` : 'Pending'}
              </div>
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

