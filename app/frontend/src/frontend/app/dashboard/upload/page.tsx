"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Upload, CheckCircle2, AlertCircle, FileUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function UploadCertificatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [showValidationError, setShowValidationError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    department: "",
    fullName: "",
    graduationYear: "",
    certificateType: "degree",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setErrors((prev) => ({ ...prev, certificateFile: false }))

      // Create a preview URL for the selected file
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string)
      }
      fileReader.readAsDataURL(file)
    }
  }

  const validateForm = (): boolean => {
    let isValid = true
    const newErrors: Record<string, boolean> = {}

    // Validate required fields
    if (!formData.department) {
      newErrors.department = true
      isValid = false
    }
    if (!formData.fullName) {
      newErrors.fullName = true
      isValid = false
    }
    if (!formData.graduationYear) {
      newErrors.graduationYear = true
      isValid = false
    }
    if (!selectedFile) {
      newErrors.certificateFile = true
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowValidationError(false)

    if (validateForm()) {
      setIsSubmitting(true)

      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)

        // In a real application, you would upload the file and form data to your backend
        console.log("Certificate upload data:", {
          ...formData,
          file: selectedFile?.name,
        })
      }, 1500)
    } else {
      setShowValidationError(true)
    }
  }

  const getInputClassName = (fieldName: string) => {
    return `flex h-10 w-full rounded-md border ${
      errors[fieldName] ? "border-red-500 focus-visible:ring-red-500" : "border-input focus-visible:ring-ring"
    } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <Shield className="h-6 w-6 text-primary" />
          <span>CertChain</span>
        </Link>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Certificate</h1>
          <p className="text-muted-foreground mt-2">
            Upload a new certificate by providing student details and the certificate PDF.
          </p>
        </div>

        {isSuccess ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Certificate Uploaded Successfully</h3>
                <p className="text-center text-muted-foreground">
                  The certificate has been uploaded and will be available on the blockchain once processed.
                </p>
                <div className="bg-muted p-4 rounded-lg w-full mt-4">
                  <h4 className="font-medium mb-2">Certificate Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Student Name:</div>
                    <div>{formData.fullName}</div>
                    <div className="text-muted-foreground">Department:</div>
                    <div>{formData.department}</div>
                    <div className="text-muted-foreground">Graduation Year:</div>
                    <div>{formData.graduationYear}</div>
                    <div className="text-muted-foreground">Certificate Type:</div>
                    <div>Degree Certificate</div>
                    <div className="text-muted-foreground">Uploaded On:</div>
                    <div>{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex gap-4 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsSuccess(false)
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setFormData({
                        department: "",
                        fullName: "",
                        graduationYear: "",
                        certificateType: "degree",
                      })
                    }}
                  >
                    Upload Another
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Certificate Information</CardTitle>
              <CardDescription>Fill in the details and upload the certificate PDF</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {showValidationError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please complete all required fields before submitting.</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="fullName" className="flex">
                    Student Full Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={getInputClassName("fullName")}
                    required
                  />
                  {errors.fullName && <p className="text-sm text-red-500">Student name is required</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department" className="flex">
                    Department <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Computer Science"
                    className={getInputClassName("department")}
                    required
                  />
                  {errors.department && <p className="text-sm text-red-500">Department is required</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="graduationYear" className="flex">
                    Year of Graduation <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    placeholder="2023"
                    className={getInputClassName("graduationYear")}
                    required
                  />
                  {errors.graduationYear && <p className="text-sm text-red-500">Graduation year is required</p>}
                </div>

                <Separator className="my-4" />

                <div className="grid gap-2">
                  <Label htmlFor="certificateFile" className="flex">
                    Upload Certificate PDF <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 ${
                      errors.certificateFile ? "border-red-500" : "border-muted-foreground/25"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-md h-64 mb-4 bg-muted rounded-lg overflow-hidden">
                          {selectedFile?.type.startsWith("image/") ? (
                            <img
                              src={previewUrl || "/placeholder.svg"}
                              alt="Certificate preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <FileUp className="h-16 w-16 text-muted-foreground" />
                              <span className="ml-2 text-muted-foreground">{selectedFile?.name}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl(null)
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Upload the certificate PDF</p>
                        <p className="text-xs text-muted-foreground mb-4">PDF, JPG, or PNG, max 10MB</p>
                        <Input
                          id="certificateFile"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("certificateFile")?.click()}
                        >
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.certificateFile && <p className="text-sm text-red-500">Certificate file is required</p>}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading..." : "Upload Certificate"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </main>
    </div>
  )
}

