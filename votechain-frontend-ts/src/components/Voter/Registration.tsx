import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, CheckCircle2 } from "lucide-react"
import { BiometricAuth } from "./BiometricAuth"

export function Registration() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsRegistered(true)
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Voter Registration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRegistered ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Register as a voter to participate in the election.
            </p>
            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Registering..." : "Register as Voter"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Registration successful!</span>
            </div>
            <p className="text-muted-foreground">
              Please complete biometric authentication to proceed.
            </p>
            <BiometricAuth />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 