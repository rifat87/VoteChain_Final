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
import { z } from "zod"

interface CandidateFormData {
  nationalId: string
  name: string
  party: string
  faceId: string | null
  fingerprint: string | null
  // NID Data
  fathersName: string
  mothersName: string
  dateOfBirth: string
  bloodGroup: string
  postOffice: string
  postCode: string
  location: string
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(100, "Name cannot exceed 100 characters"),
  party: z.string().min(2, "Party name must be at least 2 characters long").max(100, "Party name cannot exceed 100 characters"),
  nationalId: z.string().regex(/^\d{10}$/, "National ID must be exactly 10 digits"),
  fathersName: z.string().min(2, "Father's name must be at least 2 characters long").max(100, "Father's name cannot exceed 100 characters"),
  mothersName: z.string().min(2, "Mother's name must be at least 2 characters long").max(100, "Mother's name cannot exceed 100 characters"),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 25 && age - 1 <= 100;
    }
    return age >= 25 && age <= 100;
  }, "Candidate must be between 25 and 100 years old"),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    required_error: "Please select a blood group",
  }),
  postOffice: z.string().min(2, "Post office must be at least 2 characters long").max(100, "Post office cannot exceed 100 characters"),
  postCode: z.string().min(1, "Post code is required"),
  location: z.string().min(2, "Location must be at least 2 characters long").max(200, "Location cannot exceed 200 characters"),
});

export function RegisterCandidate() {
  const { registerCandidate, isAdmin } = useContract()
  const [formData, setFormData] = useState<CandidateFormData>({
    nationalId: "",
    name: "",
    party: "",
    faceId: null,
    fingerprint: null,
    // NID Data
    fathersName: "",
    mothersName: "",
    dateOfBirth: "",
    bloodGroup: "",
    postOffice: "",
    postCode: "",
    location: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("form")
  const [isFaceCaptured, setIsFaceCaptured] = useState(false)
  const [isFingerprintCaptured, setIsFingerprintCaptured] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: keyof CandidateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFaceCaptureComplete = (success: boolean) => {
    setIsFaceCaptured(success);
    if (success) {
      setFormData(prev => ({ ...prev, faceId: "captured" }));
    } else {
      setFormData(prev => ({ ...prev, faceId: null }));
    }
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
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.party || !formData.nationalId || 
          !formData.fathersName || !formData.mothersName || !formData.dateOfBirth || 
          !formData.bloodGroup || !formData.postOffice || !formData.postCode || 
          !formData.location) {
        throw new Error('Please fill in all required fields');
      }

      // Validate date of birth
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;

      if (actualAge < 1 || actualAge > 10000) {
        throw new Error('Candidate must be between 25 and 100 years old');
      }

      // Register on blockchain first
      const receipt = await registerCandidate(
        formData.name,
        formData.nationalId,
        formData.location
      );
      
      if (!receipt || !receipt.hash) {
        throw new Error('Failed to get transaction hash from blockchain');
      }

      // Format date to ISO string
      const formattedDate = birthDate.toISOString();

      // Register on central server
      const response = await fetch('http://localhost:5000/api/candidates/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          party: formData.party.trim(),
          nationalId: formData.nationalId.trim(),
          fathersName: formData.fathersName.trim(),
          mothersName: formData.mothersName.trim(),
          dateOfBirth: formattedDate,
          bloodGroup: formData.bloodGroup.trim(),
          postOffice: formData.postOffice.trim(),
          postCode: parseInt(formData.postCode, 10),
          location: formData.location.trim(),
          faceId: formData.faceId || "placeholder",
          fingerprint: formData.fingerprint || "placeholder",
          blockchainId: receipt.hash // Using the transaction hash directly from the receipt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register candidate on central server');
      }

      setSuccess("Candidate registered successfully!");
      // Reset form
      setFormData({
        nationalId: "",
        name: "",
        party: "",
        faceId: null,
        fingerprint: null,
        fathersName: "",
        mothersName: "",
        dateOfBirth: "",
        bloodGroup: "",
        postOffice: "",
        postCode: "",
        location: ""
      });
      setIsFaceCaptured(false);
      setIsFingerprintCaptured(false);
      setActiveTab("form");
    } catch (err) {
      console.error("Error registering candidate:", err);
      if (err instanceof Error) {
        if (err.message.includes("Only Election Commission")) {
          setError("Only the Election Commission can register candidates");
        } else if (err.message.includes("National ID already registered")) {
          setError("This National ID is already registered");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Candidate</CardTitle>
        <CardDescription>
          Fill in the candidate's details and optionally capture biometric data
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
                    type="number"
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fathersName">Father's Name</Label>
                  <Input
                    id="fathersName"
                    value={formData.fathersName}
                    onChange={(e) => handleInputChange('fathersName', e.target.value)}
                    placeholder="Enter father's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mothersName">Mother's Name</Label>
                  <Input
                    id="mothersName"
                    value={formData.mothersName}
                    onChange={(e) => handleInputChange('mothersName', e.target.value)}
                    placeholder="Enter mother's name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input
                    id="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    placeholder="Enter blood group"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postOffice">Post Office</Label>
                  <Input
                    id="postOffice"
                    value={formData.postOffice}
                    onChange={(e) => handleInputChange('postOffice', e.target.value)}
                    placeholder="Enter post office"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postCode">Post Code</Label>
                  <Input
                    id="postCode"
                    type="number"
                    value={formData.postCode}
                    onChange={(e) => handleInputChange('postCode', e.target.value)}
                    placeholder="Enter post code"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                  required
                />
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

              <div className="space-y-4">
                <Label>Face Capture</Label>
                <FaceCapture 
                  nid={formData.nationalId} 
                  onCaptureComplete={handleFaceCaptureComplete}
                />
                {isFaceCaptured && (
                  <p className="text-sm text-green-600">
                    Face captured successfully
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fingerprint Capture (Optional)</Label>
                <FingerprintCapture 
                  onCapture={handleFingerprintCapture}
                  onRetake={handleFingerprintRetake}
                  isCaptured={isFingerprintCaptured}
                />
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
                    disabled={isLoading}
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