import { useState } from 'react'
import { useCandidates } from '@/hooks/useContract'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'

export function RegisterCandidate() {
  const [name, setName] = useState('')
  const { registerCandidate, isLoading, error } = useCandidates()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await registerCandidate(name.trim())
      setName('')
      toast({
        title: 'Success',
        description: 'Candidate registered successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register candidate',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter candidate name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? 'Registering...' : 'Register Candidate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 