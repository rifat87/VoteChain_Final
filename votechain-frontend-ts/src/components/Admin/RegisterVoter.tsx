import { useState } from "react"
import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { FaceCapture } from "@/components/Biometric/face-recognition/FaceCapture"
import { FingerprintCapture } from "@/components/Biometric/fingerprint/FingerprintCapture"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  name: string
  nationalId: string
  dateOfBirth: Date
  location: string
}

export function RegisterVoter() {
  const navigate = useNavigate()
  const { registerVoter, isAdmin } = useContract()
  const { address } = useWallet()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    nationalId: "",
    dateOfBirth: new Date(),
    location: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [biometricStatus, setBiometricStatus] = useState({
    faceCaptured: false,
    fingerprintCaptured: false,
    faceTrainingProgress: 0,
    isTraining: false,
  })

  // ✅ Train face after capture
  const handleTrainFace = async () => {
    if (!formData.nationalId.trim()) {
      toast({ title: "Error", description: "Please enter National ID first", variant: "destructive" })
      return
    }

    if (!biometricStatus.faceCaptured) {
      toast({ title: "Error", description: "Please capture face images first", variant: "destructive" })
      return
    }

    setBiometricStatus(prev => ({ ...prev, isTraining: true, faceTrainingProgress: 0 }))

    try {
      const response = await fetch(`http://localhost:5000/api/voters/train-face/${formData.nationalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to train face model")
      }

      setBiometricStatus(prev => ({ ...prev, faceTrainingProgress: 100, isTraining: false }))
      toast({ title: "Success", description: "Face training completed successfully" })
    } catch (err) {
      console.error("Training error:", err)
      setBiometricStatus(prev => ({ ...prev, isTraining: false, faceTrainingProgress: 0 }))
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to train face model",
        variant: "destructive",
      })
    }
  }

  // ✅ Handle registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Run built-in validation first
    const form = e.target as HTMLFormElement
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first", variant: "destructive" })
      return
    }

    if (!isAdmin) {
      toast({ title: "Error", description: "Only admin can register voters", variant: "destructive" })
      return
    }

    if (!biometricStatus.faceCaptured) {
      toast({ title: "Error", description: "Please capture face biometric data", variant: "destructive" })
      return
    }

    // ✅ Age validation
    const today = new Date()
    const age = today.getFullYear() - formData.dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - formData.dateOfBirth.getMonth()
    const dayDiff = today.getDate() - formData.dateOfBirth.getDate()
    const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)
    const actualAge = isBirthdayPassed ? age : age - 1

    if (actualAge < 18 || actualAge > 120) {
      toast({
        title: "Error",
        description: "Voter must be between 18 and 120 years old",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // ✅ Register on blockchain
      const birthDateString = formData.dateOfBirth.toISOString().split("T")[0]
      await registerVoter(formData.name, formData.nationalId, formData.location, birthDateString)

      // ✅ Store in MongoDB
      const response = await fetch("http://localhost:5000/api/voters/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          nationalId: formData.nationalId,
          dateOfBirth: formData.dateOfBirth.toISOString(),
          location: formData.location,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to store voter data: ${errorData.message || response.statusText}`)
      }

      toast({ title: "Success", description: "Voter registered successfully" })
      navigate("/admin")
    } catch (err) {
      console.error("Registration error:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to register voter",
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
          <CardTitle>Register Voter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value.trim() })}
                  required
                  pattern="^\d{10}$"
                  title="National ID must be exactly 10 digits"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !formData.dateOfBirth && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date: Date | undefined) => date && setFormData({ ...formData, dateOfBirth: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  pattern="^[A-Za-z ,.-]{2,100}$"
                  title="Location must be 2-100 characters, letters, spaces, commas, hyphens, or periods"
                />
              </div>
            </div>

            {/* ✅ Biometric Section */}
            <div className="space-y-4">
              <Label>Biometric Verification</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Face Capture</Label>
                  <FaceCapture
                    nid={formData.nationalId}
                    onCaptureComplete={(success) => setBiometricStatus(prev => ({ ...prev, faceCaptured: success }))}
                  />
                  {biometricStatus.faceCaptured && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTrainFace}
                        disabled={biometricStatus.isTraining}
                        className="w-full"
                      >
                        {biometricStatus.isTraining ? "Training..." : "Train Face"}
                      </Button>
                      {biometricStatus.faceTrainingProgress === 100 && (
                        <div className="text-sm text-green-600">Face training completed successfully</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Fingerprint Capture</Label>
                  <FingerprintCapture
                    nid={formData.nationalId}
                    onCapture={() => setBiometricStatus(prev => ({ ...prev, fingerprintCaptured: true }))}
                    onRetake={() => setBiometricStatus(prev => ({ ...prev, fingerprintCaptured: false }))}
                    isCaptured={biometricStatus.fingerprintCaptured}
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Registering..." : "Register Voter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
