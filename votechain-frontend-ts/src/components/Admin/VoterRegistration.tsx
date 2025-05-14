import { useEffect, useState } from "react"
import { useLocalContract } from "@/local/hooks/useLocalContract"
import { useLocalWallet } from "@/local/hooks/useLocalWallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { FaceCapture } from "@/components/Biometric/face-recognition/FaceCapture"
import { FingerprintCapture } from "@/components/Biometric/fingerprint/FingerprintCapture"

export function VoterRegistration() {
  const navigate = useNavigate()
  const { registerVoter } = useLocalContract()
  const { address } = useLocalWallet()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    location: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [biometricStatus, setBiometricStatus] = useState({
    faceCaptured: false,
    fingerprintCaptured: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return
    }

    if (!formData.nationalId.trim() || !formData.name.trim() || !formData.location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (!biometricStatus.faceCaptured || !biometricStatus.fingerprintCaptured) {
      toast({
        title: "Error",
        description: "Please complete biometric verification",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await registerVoter(formData.nationalId)
      toast({
        title: "Success",
        description: "Voter registered successfully"
      })
      navigate("/admin")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to register voter",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Register Voter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register Voter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 