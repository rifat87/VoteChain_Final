import { useState } from "react"
import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { FaceCapture } from "@/components/Biometric/face-recognition/FaceCapture"
import { FingerprintCapture } from "@/components/Biometric/fingerprint/FingerprintCapture"

export function VoterRegistration() {
  const { registerVoter } = useContract()
  const { address } = useWallet()
  const [nationalId, setNationalId] = useState("")
  const [name, setName] = useState("")
  const [physicalAddress, setPhysicalAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [biometricStatus, setBiometricStatus] = useState({
    faceCaptured: false,
    fingerprintCaptured: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!nationalId.trim() || !name.trim() || !physicalAddress.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!biometricStatus.faceCaptured || !biometricStatus.fingerprintCaptured) {
      toast.error("Please complete biometric verification")
      return
    }

    setIsLoading(true)
    try {
      await registerVoter(address)
      toast.success("Voter registered successfully")
      setNationalId("")
      setName("")
      setPhysicalAddress("")
      setBiometricStatus({ faceCaptured: false, fingerprintCaptured: false })
    } catch (error) {
      console.error("Error registering voter:", error)
      toast.error("Failed to register voter")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Voter Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Enter national ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalAddress">Physical Address</Label>
              <Input
                id="physicalAddress"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                placeholder="Enter physical address"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Biometric Verification</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <FaceCapture
                  onCapture={() => setBiometricStatus(prev => ({ ...prev, faceCaptured: true }))}
                  captured={biometricStatus.faceCaptured}
                />
                <FingerprintCapture
                  onCapture={() => setBiometricStatus(prev => ({ ...prev, fingerprintCaptured: true }))}
                  captured={biometricStatus.fingerprintCaptured}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Registering..." : "Register Voter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 