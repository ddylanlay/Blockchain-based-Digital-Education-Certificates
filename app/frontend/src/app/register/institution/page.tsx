import { redirect } from "next/navigation"

export default function InstitutionRegistrationPage() {
  // Redirect to the main registration page with the institution type parameter
  redirect("/register?type=institution")
}

