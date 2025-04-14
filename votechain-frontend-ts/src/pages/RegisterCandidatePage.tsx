import { RegisterCandidate } from "@/components/Admin/RegisterCandidate"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"

export function RegisterCandidatePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Register New Candidate</h1>
        <RegisterCandidate />
      </div>
    </DashboardLayout>
  )
} 