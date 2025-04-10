import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CertChain Admin Portal",
  description: "Admin portal for managing the CertChain platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}

