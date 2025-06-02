import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/ui/wallet-provider"

export default function Home() {
  const { isConnected } = useWallet()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome to VoteChain</h1>
          <p className="mt-2 text-muted-foreground">
            A decentralized voting system powered by blockchain technology
          </p>
        </div>

        {!isConnected ? (
          <div className="mt-8 space-y-4">
            <p className="text-center text-muted-foreground">
              Connect your wallet to get started
            </p>
            <Button className="w-full" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <Button className="w-full" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 