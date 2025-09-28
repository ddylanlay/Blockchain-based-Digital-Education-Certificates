"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, User, GraduationCap } from "lucide-react"

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"student" | "university">("student")
  const [selectedDemo, setSelectedDemo] = useState<string>("")

  const demoUsers = {
    student: [
      { id: "S123", name: "Alice Johnson", department: "Computer Science" },
      { id: "S124", name: "Bob Smith", department: "Mathematics" },
      { id: "S125", name: "Carol Wilson", department: "Physics" }
    ],
    university: [
      { id: "ADMIN001", name: "Dr. Emily Davis", role: "CS Department Admin" },
      { id: "ADMIN002", name: "Prof. Michael Brown", role: "Registrar Office" },
      { id: "ADMIN003", name: "Sarah Johnson", role: "Certificate Authority" }
    ]
  }

  const handleLogin = () => {
    if (!selectedDemo) return

    if (userType === "student") {
      router.push(`/dashboard?student=${selectedDemo}`)
    } else {
      router.push(`/admin?admin=${selectedDemo}`)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">CertChain</CardTitle>
          <CardDescription className="text-center">
            Choose your role to access the blockchain certificate system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="userType">I am a:</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "student" | "university")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="flex items-center cursor-pointer">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Student
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="university" id="university" />
                  <Label htmlFor="university" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    University Admin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="demoUser">Select User:</Label>
              <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a demo ${userType}`} />
                </SelectTrigger>
                <SelectContent>
                  {demoUsers[userType].map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.id})
                      {userType === "student" ? ` - ${(user as any).department}` : ` - ${(user as any).role}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full" 
              disabled={!selectedDemo}
            >
              Try as {userType === "student" ? "Student" : "University Admin"}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">{capitalise(userType)} Flow:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {userType === "student" ? (
                <div>
                  <p>• View your existing certificates</p>
                  <p>• Request new certificates</p>
                  <p>• Check certificate status</p>
                </div>
              ) : (
                <div>
                  <p>• View pending certificate requests</p>
                  <p>• Approve and issue certificates</p>
                  <p>• Manage certificate database</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline text-muted-foreground">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

