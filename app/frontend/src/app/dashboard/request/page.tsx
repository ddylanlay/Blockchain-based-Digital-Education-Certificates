"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ArrowLeft, ArrowRight, Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CertificateRequestPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [showValidationError, setShowValidationError] = useState(false)

  const [formData, setFormData] = useState({
    // Student Information
    fullName: "",
    studentId: "",
    dateOfBirth: "",
    email: "",
    phone: "",

    // Academic Details
    degree: "",
    completionDate: "",
    university: "",
    department: "",

    // Certificate Request Details
    certificateType: "",
    requestReason: "",
    notificationMethod: "email",

    // Verification
    username: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setErrors((prev) => ({ ...prev, universityIdFile: false }))
    }
  }

  const validateStep = (currentStep: number): boolean => {
    let isValid = true
    const newErrors: Record<string, boolean> = {}

    if (currentStep === 1) {
      // Validate Student Information
      if (!formData.fullName.trim()) {
        newErrors.fullName = true
        isValid = false
      }
      if (!formData.studentId.trim()) {
        newErrors.studentId = true
        isValid = false
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = true
        isValid = false
      }
      if (!formData.email.trim()) {
        newErrors.email = true
        isValid = false
      }
      if (!formData.phone.trim()) {
        newErrors.phone = true
        isValid = false
      }
    } else if (currentStep === 2) {
      // Validate Academic Details
      if (!formData.degree) {
        newErrors.degree = true
        isValid = false
      }
      if (!formData.completionDate) {
        newErrors.completionDate = true
        isValid = false
      }
      if (!formData.university) {
        newErrors.university = true
        isValid = false
      }
      if (!formData.department.trim()) {
        newErrors.department = true
        isValid = false
      }
    } else if (currentStep === 3) {
      // Validate Certificate Request Details
      if (!formData.certificateType) {
        newErrors.certificateType = true
        isValid = false
      }
      if (!formData.requestReason.trim()) {
        newErrors.requestReason = true
        isValid = false
      }
    } else if (currentStep === 4) {
      // Validate Verification
      if (!selectedFile) {
        newErrors.universityIdFile = true
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const nextStep = () => {
    setShowValidationError(false)

    if (validateStep(step)) {
      setStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    } else {
      setShowValidationError(true)
    }
  }

  const prevStep = () => {
    setShowValidationError(false)
    setStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault()

    if (validateStep(4)) {
      setIsSubmitting(true)
      setShowValidationError(false)

      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false)
        setStep(5) // Move to success step
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

  const getTextareaClassName = (fieldName: string) => {
    return `flex min-h-[80px] w-full rounded-md border ${
      errors[fieldName] ? "border-red-500 focus-visible:ring-red-500" : "border-input focus-visible:ring-ring"
    } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`
  }

  const getSelectTriggerClassName = (fieldName: string) => {
    return `flex h-10 w-full items-center justify-between rounded-md border ${
      errors[fieldName] ? "border-red-500 focus:ring-red-500" : "border-input focus:ring-ring"
    } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1`
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
          <h1 className="text-3xl font-bold">Request New Certificate</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to request a new certificate from your institution.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">
                  {i === 1 ? "Student Info" : i === 2 ? "Academic" : i === 3 ? "Request" : "Verify"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className={`h-1 rounded-l-full ${step > 1 ? "bg-primary" : "bg-muted"}`}></div>
            <div className={`h-1 ${step > 2 ? "bg-primary" : "bg-muted"}`}></div>
            <div className={`h-1 rounded-r-full ${step > 3 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Student Information"}
              {step === 2 && "Academic Details"}
              {step === 3 && "Certificate Request Details"}
              {step === 4 && "Verification"}
              {step === 5 && "Request Submitted"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Please provide your personal information"}
              {step === 2 && "Enter details about your academic program"}
              {step === 3 && "Specify the type of certificate you need"}
              {step === 4 && "Verify your identity to complete the request"}
              {step === 5 && "Your certificate request has been submitted successfully"}
            </CardDescription>
          </CardHeader>

          <div>
            <CardContent className="space-y-4">
              {showValidationError && step < 5 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Please complete all required fields before proceeding.</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Student Information */}
              {step === 1 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="flex">
                      Full Name <span className="text-red-500 ml-1">*</span>
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
                    {errors.fullName && <p className="text-sm text-red-500">Full name is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="studentId" className="flex">
                      Student ID <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      placeholder="S12345678"
                      className={getInputClassName("studentId")}
                      required
                    />
                    {errors.studentId && <p className="text-sm text-red-500">Student ID is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dateOfBirth" className="flex">
                      Date of Birth <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={getInputClassName("dateOfBirth")}
                      required
                    />
                    {errors.dateOfBirth && <p className="text-sm text-red-500">Date of birth is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      className={getInputClassName("email")}
                      required
                    />
                    {errors.email && <p className="text-sm text-red-500">Email address is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="flex">
                      Phone Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={getInputClassName("phone")}
                      required
                    />
                    {errors.phone && <p className="text-sm text-red-500">Phone number is required</p>}
                  </div>
                </>
              )}

              {/* Step 2: Academic Details */}
              {step === 2 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="degree" className="flex">
                      Degree/Qualification <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={formData.degree} onValueChange={(value) => handleSelectChange("degree", value)}>
                      <SelectTrigger id="degree" className={getSelectTriggerClassName("degree")}>
                        <SelectValue placeholder="Select your degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.degree && <p className="text-sm text-red-500">Degree is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="completionDate" className="flex">
                      Completion Date <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="completionDate"
                      name="completionDate"
                      type="date"
                      value={formData.completionDate}
                      onChange={handleInputChange}
                      className={getInputClassName("completionDate")}
                      required
                    />
                    {errors.completionDate && <p className="text-sm text-red-500">Completion date is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="university" className="flex">
                      University/Institution Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => handleSelectChange("university", value)}
                    >
                      <SelectTrigger id="university" className={getSelectTriggerClassName("university")}>
                        <SelectValue placeholder="Select your institution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech-university">Tech University</SelectItem>
                        <SelectItem value="code-academy">Code Academy</SelectItem>
                        <SelectItem value="data-institute">Data Institute</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.university && <p className="text-sm text-red-500">Institution is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="department" className="flex">
                      Department/Faculty <span className="text-red-500 ml-1">*</span>
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
                </>
              )}

              {/* Step 3: Certificate Request Details */}
              {step === 3 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="certificateType" className="flex">
                      Type of Certificate Requested <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={formData.certificateType}
                      onValueChange={(value) => handleSelectChange("certificateType", value)}
                    >
                      <SelectTrigger id="certificateType" className={getSelectTriggerClassName("certificateType")}>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="degree">Degree Certificate</SelectItem>
                        <SelectItem value="transcript">Academic Transcript</SelectItem>
                        <SelectItem value="completion">Course Completion</SelectItem>
                        <SelectItem value="enrollment">Enrollment Verification</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.certificateType && <p className="text-sm text-red-500">Certificate type is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="requestReason" className="flex">
                      Reason for Request <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="requestReason"
                      name="requestReason"
                      value={formData.requestReason}
                      onChange={handleInputChange}
                      placeholder="Please explain why you need this certificate..."
                      className={getTextareaClassName("requestReason")}
                      rows={4}
                      required
                    />
                    {errors.requestReason && <p className="text-sm text-red-500">Reason for request is required</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label className="flex">
                      Preferred Method of Notification <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.notificationMethod}
                      onValueChange={(value) => handleSelectChange("notificationMethod", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="notification-email" />
                        <Label htmlFor="notification-email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="notification-sms" />
                        <Label htmlFor="notification-sms">SMS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="notification-both" />
                        <Label htmlFor="notification-both">Both Email and SMS</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {/* Step 4: Verification */}
              {step === 4 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="universityIdFile" className="flex">
                      Upload University ID <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
                        errors.universityIdFile ? "border-red-500" : "border-muted-foreground/25"
                      }`}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a scan or photo of your university ID card
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">JPG, PNG or PDF, max 5MB</p>
                      <Input
                        id="universityIdFile"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("universityIdFile")?.click()}
                      >
                        Select File
                      </Button>
                      {selectedFile && <p className="text-sm mt-2">File selected: {selectedFile.name}</p>}
                    </div>
                    {errors.universityIdFile && <p className="text-sm text-red-500">University ID is required</p>}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">University Portal Credentials (Optional)</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Providing your university portal credentials can help speed up the verification process. Your
                      credentials will be securely encrypted and only used for verification purposes.
                    </p>

                    <div className="grid gap-2">
                      <Label htmlFor="username">University Portal Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">University Portal Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 5: Success */}
              {step === 5 && (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Request Submitted Successfully</h3>
                  <p className="text-center text-muted-foreground">
                    Your certificate request has been submitted and is now pending approval from your institution. You
                    will be notified once your request has been processed.
                  </p>
                  <div className="bg-muted p-4 rounded-lg w-full mt-4">
                    <h4 className="font-medium mb-2">Request Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Request ID:</div>
                      <div>
                        REQ-
                        {Math.floor(Math.random() * 10000)
                          .toString()
                          .padStart(4, "0")}
                      </div>
                      <div className="text-muted-foreground">Submitted On:</div>
                      <div>{new Date().toLocaleDateString()}</div>
                      <div className="text-muted-foreground">Status:</div>
                      <div>Pending</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {step < 5 ? (
                <>
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button type="button" onClick={nextStep} className={step === 1 ? "ml-auto" : ""}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={step === 1 ? "ml-auto" : ""}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  )}
                </>
              ) : (
                <Button type="button" className="w-full" onClick={() => router.push("/dashboard")}>
                  Return to Dashboard
                </Button>
              )}
            </CardFooter>
          </div>
        </Card>
      </main>
    </div>
  )
}

