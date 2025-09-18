import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, FileCheck, Shield, Upload, UserCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50 to-primary/10">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm bg-white/80 backdrop-blur">
        <Link className="flex items-center justify-center" href="#">
          <Shield className="h-7 w-7 text-primary" />
          <span className="ml-2 text-2xl font-extrabold tracking-tight">CertChain</span>
        </Link>
        <nav className="flex gap-6">
          <Link className="text-base font-medium hover:underline underline-offset-4 transition" href="#">
            Features
          </Link>
          <Link className="text-base font-medium hover:underline underline-offset-4 transition" href="#">
            About
          </Link>
          <Link className="text-base font-medium hover:underline underline-offset-4 transition" href="#">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button size="sm" className="font-semibold">
              Try Demo
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        <section className="w-full py-16 md:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6 flex flex-col lg:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-xl mx-auto">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Secure Student Certificates on the Blockchain
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                Immutable, verifiable, and tamper-proof certificates for educational institutions and students.
              </p>
              <Link href="/login">
                <Button size="lg" className="w-48 mx-auto font-semibold shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-400/30 rounded-full blur-3xl" />
                <div className="absolute inset-8 bg-white dark:bg-black rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center border border-primary/10">
                  <Shield className="h-16 w-16 text-primary mb-4" />
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Blockchain Verified</h3>
                    <p className="text-sm text-muted-foreground">Certificate #BC12345</p>
                    <div className="h-24 border border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center p-4 bg-muted/30">
                      <p className="text-xs text-muted-foreground">Certificate Preview</p>
                    </div>
                    <div className="flex justify-center mt-4">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-32 bg-muted flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed mx-auto">
                Our platform uses blockchain technology to create tamper-proof certificates that can be easily
                verified.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <Card className="flex flex-col items-center text-center shadow-lg">
                <CardHeader>
                  <Upload className="h-10 w-10 text-primary mb-2 mx-auto" />
                  <CardTitle>Issue Certificates</CardTitle>
                  <CardDescription>
                    Educational institutions can issue digital certificates that are stored on the blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Secure, tamper-proof certificates with digital signatures that verify authenticity.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full font-semibold">
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="flex flex-col items-center text-center shadow-lg">
                <CardHeader>
                  <Database className="h-10 w-10 text-primary mb-2 mx-auto" />
                  <CardTitle>Blockchain Storage</CardTitle>
                  <CardDescription>
                    Certificates are stored on a decentralized blockchain network for maximum security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Immutable records that cannot be altered or deleted, ensuring certificate integrity.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full font-semibold">
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="flex flex-col items-center text-center shadow-lg">
                <CardHeader>
                  <FileCheck className="h-10 w-10 text-primary mb-2 mx-auto" />
                  <CardTitle>Instant Verification</CardTitle>
                  <CardDescription>
                    Anyone can verify the authenticity of a certificate with a simple verification process.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Quick and reliable verification for employers, institutions, and other stakeholders.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" size="sm" className="w-full font-semibold">
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">For Educational Institutions</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto">
                  Issue secure, verifiable certificates that enhance your institution's credibility.
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span>Prevent certificate fraud and forgery</span>
                  </li>
                  <li className="flex items-center gap-3 justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span>Streamline certificate issuance process</span>
                  </li>
                  <li className="flex items-center gap-3 justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span>Enhance institutional reputation</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="font-semibold w-56 mx-auto">Register as Institution</Button>
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">For Students</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed mx-auto">
                  Access and share your certificates securely with potential employers and institutions.
                </p>
                <ul className="grid gap-3">
                  <li className="flex items-center gap-3 justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span>Lifetime access to your certificates</span>
                  </li>
                  <li className="flex items-center gap-3 justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span>Easy sharing with employers</span>
                  </li>
                  <li className="flex items-center gap-3 justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span>Instant verification of credentials</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="font-semibold w-56 mx-auto">Login to Access Certificates</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white/80 backdrop-blur">
        <p className="text-xs text-muted-foreground text-center sm:text-left">© 2025 CertChain. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
