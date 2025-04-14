import { VoterRegistration } from "@/components/VoterRegistration"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"

export function VoterRegistrationPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Voter Registration</h1>
          <p className="text-muted-foreground mt-2">
            Register as a voter by filling out the form and completing biometric verification.
          </p>
        </div>
        <VoterRegistration />
      </div>
    </DashboardLayout>
  )
} 