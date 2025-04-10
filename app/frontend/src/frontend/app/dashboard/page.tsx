"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Download, FileCheck, FileText, MoreHorizontal, Search, Share2, Shield, Upload } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [certificates, setCertificates] = useState([
    {
      id: "BC12345",
      name: "Bachelor of Computer Science",
      institution: "Tech University",
      issueDate: "2023-05-15",
      status: "verified",
      txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    },
    {
      id: "BC12346",
      name: "Advanced Web Development",
      institution: "Code Academy",
      issueDate: "2023-08-22",
      status: "verified",
      txHash: "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
    },
    {
      id: "BC12347",
      name: "Data Science Fundamentals",
      institution: "Data Institute",
      issueDate: "2024-01-10",
      status: "pending",
      txHash: "",
    },
  ])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <Shield className="h-6 w-6 text-primary" />
          <span>CertChain</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <form className="hidden items-center lg:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search certificates..."
                className="w-64 rounded-lg bg-background pl-8"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 sm:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4">
              <span className="font-semibold">Dashboard</span>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Link href="#" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary">
                  <FileText className="h-4 w-4" />
                  My Certificates
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <FileCheck className="h-4 w-4" />
                  Verify Certificate
                </Link>
              </nav>
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
            {/* Request New button removed */}
          </div>
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All Certificates</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              <div className="ml-auto hidden items-center gap-2 md:flex">
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {cert.name}
                            {cert.status === "verified" && (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              >
                                Verified
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
                          </CardTitle>
                          <CardDescription>{cert.institution}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Download PDF</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Report Issue</DropdownMenuItem>
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
                    <CardFooter className="flex items-center justify-between p-4">
                      <div className="text-xs text-muted-foreground">
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="verified" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates
                  .filter((cert) => cert.status === "verified")
                  .map((cert) => (
                    <Card key={cert.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {cert.name}
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              >
                                Verified
                              </Badge>
                            </CardTitle>
                            <CardDescription>{cert.institution}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Download PDF</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Report Issue</DropdownMenuItem>
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
                      <CardFooter className="flex items-center justify-between p-4">
                        <div className="text-xs text-muted-foreground">
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates
                  .filter((cert) => cert.status === "pending")
                  .map((cert) => (
                    <Card key={cert.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {cert.name}
                              <Badge
                                variant="outline"
                                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              >
                                Pending
                              </Badge>
                            </CardTitle>
                            <CardDescription>{cert.institution}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Check Status</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Cancel Request</DropdownMenuItem>
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
                      <CardFooter className="flex items-center justify-between p-4">
                        <div className="text-xs text-muted-foreground">
                          Requested: {new Date(cert.issueDate).toLocaleDateString()}
                        </div>
                        <Button size="sm" variant="outline">
                          Check Status
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

