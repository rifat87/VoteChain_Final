import { useState } from "react"
import { useContract } from "@/hooks/useContract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { FaceCapture } from "@/components/Biometric/face-recognition/FaceCapture"
import { FingerprintCapture } from "@/components/Biometric/fingerprint/FingerprintCapture"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface CandidateFormData {
  nationalId: string
  name: string
  party: string
  faceId: string | null
  fingerprint: string | null
}

export function RegisterCandidate() {
  const { registerCandidate } = useContract()
  const [formData, setFormData] = useState<CandidateFormData>({
    nationalId: "",
    name: "",
    party: "",
    faceId: null,
    fingerprint: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const [isFaceCaptured, setIsFaceCaptured] = useState(false)
  const [isFingerprintCaptured, setIsFingerprintCaptured] = useState(false)

  const handleInputChange = (field: keyof CandidateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFaceCapture = (image: string) => {
    setFormData(prev => ({ ...prev, faceId: image }))
    setIsFaceCaptured(true)
  }

  const handleFaceRetake = () => {
    setFormData(prev => ({ ...prev, faceId: null }))
    setIsFaceCaptured(false)
  }

  const handleFingerprintCapture = (data: string) => {
    setFormData(prev => ({ ...prev, fingerprint: data }))
    setIsFingerprintCaptured(true)
  }

  const handleFingerprintRetake = () => {
    setFormData(prev => ({ ...prev, fingerprint: null }))
    setIsFingerprintCaptured(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nationalId.trim()) {
      toast.error("Please enter National ID")
      return
    }
    if (!formData.name.trim()) {
      toast.error("Please enter candidate name")
      return
    }
    if (!formData.faceId) {
      toast.error("Please capture face ID")
      return
    }
    if (!formData.fingerprint) {
      toast.error("Please capture fingerprint")
      return
    }

    setIsLoading(true)
    try {
      await registerCandidate(formData.name, formData.party || "Independent")
      toast.success("Candidate registered successfully")
      setFormData({
        nationalId: "",
        name: "",
        party: "",
        faceId: null,
        fingerprint: null
      })
      setIsFaceCaptured(false)
      setIsFingerprintCaptured(false)
      setActiveTab("form")
    } catch (error) {
      console.error("Error registering candidate:", error)
      toast.error("Failed to register candidate")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Candidate</CardTitle>
        <CardDescription>
          Fill in the candidate's details and capture biometric data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Registration Form</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => handleInputChange('nationalId', e.target.value)}
                    placeholder="Enter National ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter candidate's full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="party">Political Party</Label>
                <Input
                  id="party"
                  value={formData.party}
                  onChange={(e) => handleInputChange('party', e.target.value)}
                  placeholder="Enter political party (optional)"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Face ID Capture</Label>
                  <FaceCapture 
                    onCapture={handleFaceCapture}
                    onRetake={handleFaceRetake}
                    isCaptured={isFaceCaptured}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fingerprint Capture</Label>
                  <FingerprintCapture 
                    onCapture={handleFingerprintCapture}
                    onRetake={handleFingerprintRetake}
                    isCaptured={isFingerprintCaptured}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("preview")}
                  disabled={!formData.name || !formData.nationalId}
                >
                  Preview
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Candidate"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Preview</CardTitle>
                <CardDescription>Review the candidate's information before submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">National ID</Label>
                    <p>{formData.nationalId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p>{formData.name}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Political Party</Label>
                  <p>{formData.party || "Independent"}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Face ID Status</Label>
                    <p>{isFaceCaptured ? "Captured" : "Not Captured"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fingerprint Status</Label>
                    <p>{isFingerprintCaptured ? "Captured" : "Not Captured"}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("form")}
                  >
                    Back to Form
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !isFaceCaptured || !isFingerprintCaptured}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Confirm Registration"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 