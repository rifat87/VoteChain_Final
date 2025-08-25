import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface FormData {
  name: string
  party: string
  nationalId: string
  age: number
  location: string
}

export function RegisterCandidate() {
  const navigate = useNavigate()
  const { registerCandidate, isAdmin } = useContract()
  const { address } = useWallet()
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    party: "",
    nationalId: "",
    age: 0,
    location: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first", variant: "destructive" })
      return
    }
    if (!isAdmin) {
      toast({ title: "Error", description: "Only admin can register candidates", variant: "destructive" })
      return
    }
    if (!formData.nationalId.trim() || !formData.name.trim() || !formData.location.trim() || !formData.party.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    if (formData.age < 18 || formData.age > 120) {
      toast({ title: "Error", description: "Age must be between 18 and 120", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      // ✅ Step 1: Register on blockchain
      const txReceipt = await registerCandidate(
        formData.name,
        formData.nationalId,
        formData.location,
        formData.age,    // age before party
        formData.party
      )

      if (txReceipt.status === 0) throw new Error("Transaction failed on blockchain")

      // ✅ Step 2: Store in central server (MongoDB)
      const response = await fetch("http://localhost:5000/api/candidates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to store candidate data: ${errorData.message || response.statusText}`)
      }

      toast({ title: "Success", description: "Candidate registered successfully" })
      navigate("/admin")
    } catch (err) {
      console.error("Registration error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to register candidate",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Register Candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  pattern="^[A-Za-z ]{3,50}$"
                  title="Full name should be 3-50 characters, letters and spaces only"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party">Party</Label>
                <Input
                  id="party"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  required
                  pattern="^[A-Za-z ]{2,40}$"
                  title="Party name should be 2-40 characters, letters and spaces only"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value.trim() })}
                  required
                  pattern="^\d{10}$"
                  title="National ID must be number and exactly 10 digits"
                />

              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    setFormData({ ...formData, age: val })
                  }}
                  required
                  min="18"
                  max="120"
                  title="Age must be between 18 and 120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  pattern="^[A-Za-z ,.-]{2,100}$"
                  title="Location must be 2-100 characters, letters, spaces, commas, or hyphens"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Registering..." : "Register Candidate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
