import { useContract } from "@/hooks/useContract"
import { useWallet } from "@/components/ui/wallet-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { FaceCapture } from "@/components/Biometric/face-recognition/FaceCapture"
import { FingerprintCapture } from "@/components/Biometric/fingerprint/FingerprintCapture"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ethers } from "ethers"
import { contractAddress, contractABI } from "@/config/contract"


interface FormData {
  name: string
  party: string
  nationalId: string
  fathersName: string
  mothersName: string
  dateOfBirth: Date
  bloodGroup: string
  postOffice: string
  postCode: number
  location: string
  faceHash: string
  fingerprintHash: string
}

interface BiometricCaptureProps {
  onCaptureComplete: (success: boolean, hash?: string) => void
  nid: string
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
    fathersName: "",
    mothersName: "",
    dateOfBirth: new Date(),
    bloodGroup: "",
    postOffice: "",
    postCode: 0,
    location: "",
    faceHash: "",
    fingerprintHash: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [biometricStatus, setBiometricStatus] = useState({
    faceCaptured: false,
    fingerprintCaptured: false,
    faceTrainingProgress: 0,
    isTraining: false
  })
  const [error, setError] = useState<string | null>(null)

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const handleTrainFace = async () => {
    if (!formData.nationalId.trim()) {
      toast({
        title: "Error",
        description: "Please enter National ID first",
        variant: "destructive"
      })
      return
    }

    if (!biometricStatus.faceCaptured) {
      toast({
        title: "Error",
        description: "Please capture face images first",
        variant: "destructive"
      })
      return
    }

    setBiometricStatus(prev => ({ 
      ...prev, 
      isTraining: true, 
      faceTrainingProgress: 0 
    }))

    try {
      const response = await fetch(`http://localhost:5000/api/candidates/train-face/${formData.nationalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to train face model')
      }

      const data = await response.json()
      
      setBiometricStatus(prev => ({ 
        ...prev, 
        faceTrainingProgress: 100,
        isTraining: false 
      }))

      toast({
        title: "Success",
        description: "Face training completed successfully"
      })
    } catch (err) {
      console.error('Training error:', err)
      setBiometricStatus(prev => ({ 
        ...prev, 
        isTraining: false,
        faceTrainingProgress: 0 
      }))
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to train face model",
        variant: "destructive"
      })
    }
  }

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

    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only admin can register candidates",
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

    if (formData.postCode <= 0 || formData.postCode >= 10000) {
      toast({
        title: "Error",
        description: "Post code must be a positive number less than 10000",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('Starting blockchain registration...')
      console.log('Contract address:', contractAddress)
      console.log('Form data:', formData)

      // Step 1: Get face hash from server
      const faceHashResponse = await fetch(`http://localhost:5000/api/candidates/face-hash/${formData.nationalId}`)
      if (!faceHashResponse.ok) {
        throw new Error('Failed to get face hash from server')
      }
      const { faceHash } = await faceHashResponse.json()
      console.log('Face hash:', faceHash)

      // Step 2: Register on blockchain
      const tx = await registerCandidate(
        formData.name,
        formData.nationalId,
        formData.location,
        faceHash
      )
      console.log('Transaction sent:', tx)
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log('Transaction receipt:', receipt)
      
      // Verify transaction was successful
      if (receipt.status === 0) {
        throw new Error('Transaction failed on blockchain')
      }

      const blockchainId = receipt.hash
      console.log('Blockchain ID:', blockchainId)

      // Step 3: Store in central server
      console.log('Storing in central server...')
      const response = await fetch('http://localhost:5000/api/candidates/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          blockchainId,
          dateOfBirth: formData.dateOfBirth.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to store candidate data in central server: ${errorData.message || response.statusText}`)
      }

      toast({
        title: "Success",
        description: "Candidate registered successfully on both blockchain and central server"
      })
      navigate("/admin")
    } catch (err) {
      console.error('Registration error:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to register candidate",
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="party">Party</Label>
                <Input
                  id="party"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
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
                  pattern="\d{10}"
                  title="Must be 10 digits"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fathersName">Father's Name</Label>
                <Input
                  id="fathersName"
                  value={formData.fathersName}
                  onChange={(e) => setFormData({ ...formData, fathersName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mothersName">Mother's Name</Label>
                <Input
                  id="mothersName"
                  value={formData.mothersName}
                  onChange={(e) => setFormData({ ...formData, mothersName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
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
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value: string) => setFormData({ ...formData, bloodGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postOffice">Post Office</Label>
                <Input
                  id="postOffice"
                  value={formData.postOffice}
                  onChange={(e) => setFormData({ ...formData, postOffice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postCode">Post Code</Label>
                <Input
                  id="postCode"
                  type="number"
                  value={formData.postCode}
                  onChange={(e) => setFormData({ ...formData, postCode: parseInt(e.target.value) || 0 })}
                  required
                  min="1"
                  max="9999"
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
            </div>

            <div className="space-y-4">
              <Label>Biometric Verification</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Face Capture</Label>
                  <FaceCapture
                    nid={formData.nationalId}
                    onCaptureComplete={(success) => {
                      setBiometricStatus(prev => ({ 
                        ...prev, 
                        faceCaptured: success
                      }))
                    }}
                  />
                  {biometricStatus.faceCaptured && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTrainFace}
                        disabled={biometricStatus.isTraining || !biometricStatus.faceCaptured}
                        className="w-full"
                      >
                        {biometricStatus.isTraining ? "Training..." : "Train Face"}
                      </Button>
                      {biometricStatus.isTraining && (
                    <div className="text-sm text-muted-foreground">
                          Training face model...
                        </div>
                      )}
                      {biometricStatus.faceTrainingProgress === 100 && (
                        <div className="text-sm text-green-600">
                          Face training completed successfully
                    </div>
                  )}
                    </div>
                  )}
                  {biometricStatus.faceCaptured && !biometricStatus.isTraining && biometricStatus.faceTrainingProgress !== 100 && (
                    <div className="text-sm text-blue-600">
                      Face captured successfully. Click "Train Face" to complete the process.
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Fingerprint Capture (Optional)</Label>
                  <FingerprintCapture
                    onCapture={(data) => {
                      setBiometricStatus(prev => ({ ...prev, fingerprintCaptured: true }))
                    }}
                    onRetake={() => setBiometricStatus(prev => ({ ...prev, fingerprintCaptured: false }))}
                    isCaptured={biometricStatus.fingerprintCaptured}
                  />
                </div>
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