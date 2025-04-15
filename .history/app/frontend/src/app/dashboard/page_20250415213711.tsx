// "use client"

// import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Award, Download, MoreHorizontal, Share2, Upload } from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Badge } from "@/components/ui/badge"

// export default function Dashboard() {
//   const [certificates, setCertificates] = useState([
//     {
//       id: "BC12345",
//       name: "Bachelor of Computer Science",
//       institution: "Tech University",
//       issueDate: "2023-05-15",
//       status: "verified",
//       txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
//     },
//     {
//       id: "BC12346",
//       name: "Advanced Web Development",
//       institution: "Code Academy",
//       issueDate: "2023-08-22",
//       status: "verified",
//       txHash: "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
//     },
//     {
//       id: "BC12347",
//       name: "Data Science Fundamentals",
//       institution: "Data Institute",
//       issueDate: "2024-01-10",
//       status: "pending",
//       txHash: "",
//     },
//   ])

//   const [walletAddress, setWalletAddress] = useState<string>("")

//   useEffect(() => {
//     const checkWalletConnection = async () => {
//       if (typeof window.ethereum !== "undefined") {
//         try {
//           const accounts = await window.ethereum.request({ method: "eth_accounts" })
//           if (accounts.length > 0) {
//             setWalletAddress(accounts[0])
//           }
//         } catch (error) {
//           console.error("Error checking wallet connection:", error)
//         }
//       }
//     }

//     checkWalletConnection()

//     // Check for newly uploaded certificates
//     const newCertificate = localStorage.getItem("newCertificate")
//     if (newCertificate) {
//       try {
//         const parsedCertificate = JSON.parse(newCertificate)
//         // Check if this certificate is already in our list (avoid duplicates)
//         if (!certificates.some((cert) => cert.id === parsedCertificate.id)) {
//           setCertificates((prevCerts) => [parsedCertificate, ...prevCerts])
//         }
//         // Clear the localStorage after adding the certificate
//         localStorage.removeItem("newCertificate")
//       } catch (error) {
//         console.error("Error parsing new certificate:", error)
//       }
//     }
//   }, [])

//   return (
//     <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
//         <Link href="/dashboard/upload">
//           <Button>
//             <Upload className="mr-2 h-4 w-4" />
//             Upload Certificate
//           </Button>
//         </Link>
//       </div>
//       <Tabs defaultValue="all">
//         <div className="flex items-center">
//           <TabsList>
//             <TabsTrigger value="all">All Certificates</TabsTrigger>
//             <TabsTrigger value="verified">Verified</TabsTrigger>
//             <TabsTrigger value="pending">Pending</TabsTrigger>
//           </TabsList>
//         </div>
//         <TabsContent value="all" className="mt-4">
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {certificates.map((cert) => (
//               <Card key={cert.id} className="overflow-hidden">
//                 <CardHeader className="p-4">
//                   <div className="flex items-start justify-between">
//                     <div className="space-y-1">
//                       <CardTitle className="flex items-center gap-2">
//                         {cert.name}
//                         {cert.status === "verified" && (
//                           <Badge
//                             variant="outline"
//                             className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
//                           >
//                             Verified
//                           </Badge>
//                         )}
//                         {cert.status === "pending" && (
//                           <Badge
//                             variant="outline"
//                             className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
//                           >
//                             Pending
//                           </Badge>
//                         )}
//                       </CardTitle>
//                       <CardDescription>{cert.institution}</CardDescription>
//                     </div>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="icon" className="rounded-full">
//                           <MoreHorizontal className="h-4 w-4" />
//                           <span className="sr-only">More</span>
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem>View Details</DropdownMenuItem>
//                         <DropdownMenuItem>Download PDF</DropdownMenuItem>
//                         <DropdownMenuItem>Share</DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem className="text-red-600">Report Issue</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="flex items-center justify-center bg-muted/50 p-6">
//                     <div className="relative flex h-32 w-full items-center justify-center rounded-lg border border-dashed">
//                       <Award className="h-12 w-12 text-muted-foreground/50" />
//                     </div>
//                   </div>
//                 </CardContent>
//                 <CardFooter className="flex items-center justify-between p-4">
//                   <div className="text-xs text-muted-foreground">
//                     Issued: {new Date(cert.issueDate).toLocaleDateString()}
//                   </div>
//                   <div className="flex gap-1">
//                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
//                       <Download className="h-4 w-4" />
//                       <span className="sr-only">Download</span>
//                     </Button>
//                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
//                       <Share2 className="h-4 w-4" />
//                       <span className="sr-only">Share</span>
//                     </Button>
//                   </div>
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>
//         <TabsContent value="verified" className="mt-4">
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {certificates
//               .filter((cert) => cert.status === "verified")
//               .map((cert) => (
//                 <Card key={cert.id} className="overflow-hidden">
//                   <CardHeader className="p-4">
//                     <div className="flex items-start justify-between">
//                       <div className="space-y-1">
//                         <CardTitle className="flex items-center gap-2">
//                           {cert.name}
//                           <Badge
//                             variant="outline"
//                             className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
//                           >
//                             Verified
//                           </Badge>
//                         </CardTitle>
//                         <CardDescription>{cert.institution}</CardDescription>
//                       </div>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon" className="rounded-full">
//                             <MoreHorizontal className="h-4 w-4" />
//                             <span className="sr-only">More</span>
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem>View Details</DropdownMenuItem>
//                           <DropdownMenuItem>Download PDF</DropdownMenuItem>
//                           <DropdownMenuItem>Share</DropdownMenuItem>
//                           <DropdownMenuSeparator />
//                           <DropdownMenuItem className="text-red-600">Report Issue</DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="p-0">
//                     <div className="flex items-center justify-center bg-muted/50 p-6">
//                       <div className="relative flex h-32 w-full items-center justify-center rounded-lg border border-dashed">
//                         <Award className="h-12 w-12 text-muted-foreground/50" />
//                       </div>
//                     </div>
//                   </CardContent>
//                   <CardFooter className="flex items-center justify-between p-4">
//                     <div className="text-xs text-muted-foreground">
//                       Issued: {new Date(cert.issueDate).toLocaleDateString()}
//                     </div>
//                     <div className="flex gap-1">
//                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
//                         <Download className="h-4 w-4" />
//                         <span className="sr-only">Download</span>
//                       </Button>
//                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
//                         <Share2 className="h-4 w-4" />
//                         <span className="sr-only">Share</span>
//                       </Button>
//                     </div>
//                   </CardFooter>
//                 </Card>
//               ))}
//           </div>
//         </TabsContent>
//         <TabsContent value="pending" className="mt-4">
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {certificates
//               .filter((cert) => cert.status === "pending")
//               .map((cert) => (
//                 <Card key={cert.id} className="overflow-hidden">
//                   <CardHeader className="p-4">
//                     <div className="flex items-start justify-between">
//                       <div className="space-y-1">
//                         <CardTitle className="flex items-center gap-2">
//                           {cert.name}
//                           <Badge
//                             variant="outline"
//                             className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
//                           >
//                             Pending
//                           </Badge>
//                         </CardTitle>
//                         <CardDescription>{cert.institution}</CardDescription>
//                       </div>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon" className="rounded-full">
//                             <MoreHorizontal className="h-4 w-4" />
//                             <span className="sr-only">More</span>
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuItem>View Details</DropdownMenuItem>
//                           <DropdownMenuItem>Check Status</DropdownMenuItem>
//                           <DropdownMenuSeparator />
//                           <DropdownMenuItem className="text-red-600">Cancel Request</DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="p-0">
//                     <div className="flex items-center justify-center bg-muted/50 p-6">
//                       <div className="relative flex h-32 w-full items-center justify-center rounded-lg border border-dashed">
//                         <Award className="h-12 w-12 text-muted-foreground/50" />
//                       </div>
//                     </div>
//                   </CardContent>
//                   <CardFooter className="flex items-center justify-between p-4">
//                     <div className="text-xs text-muted-foreground">
//                       Requested: {new Date(cert.issueDate).toLocaleDateString()}
//                     </div>
//                     <Button size="sm" variant="outline">
//                       Check Status
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               ))}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"
import { CertificateCard } from "@/components/certificate-card"

export default function Dashboard() {
  const [certificates, setCertificates] = useState([
    {
      id: "BC12345",
      name: "Bachelor of Computer Science",
      institution: "University of Technology",
      recipient: "Alex Johnson",
      issueDate: "2024-05-15",
      status: "verified" as const,
      txHash: "0x7a8b...3f2e",
    },
    {
      id: "BC12346",
      name: "Advanced Web Development",
      institution: "Code Academy",
      recipient: "Alex Johnson",
      issueDate: "2023-08-22",
      status: "verified" as const,
      txHash: "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
    },
    {
      id: "BC12347",
      name: "Data Science Fundamentals",
      institution: "Data Institute",
      recipient: "Alex Johnson",
      issueDate: "2024-01-10",
      status: "pending" as const,
      txHash: "",
    },
  ])

  const [walletAddress, setWalletAddress] = useState<string>("")

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()

    // Check for newly uploaded certificates
    const newCertificate = localStorage.getItem("newCertificate")
    if (newCertificate) {
      try {
        const parsedCertificate = JSON.parse(newCertificate)
        // Check if this certificate is already in our list (avoid duplicates)
        if (!certificates.some((cert) => cert.id === parsedCertificate.id)) {
          setCertificates((prevCerts) => [parsedCertificate, ...prevCerts])
        }
        // Clear the localStorage after adding the certificate
        localStorage.removeItem("newCertificate")
      } catch (error) {
        console.error("Error parsing new certificate:", error)
      }
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
        <Link href="/dashboard/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Certificate
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All Certificates</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} {...cert} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="verified" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates
              .filter((cert) => cert.status === "verified")
              .map((cert) => (
                <CertificateCard key={cert.id} {...cert} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {certificates
              .filter((cert) => cert.status === "pending")
              .map((cert) => (
                <CertificateCard key={cert.id} {...cert} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
