import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to VoteChain</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center">
        A secure and transparent blockchain-based voting system
      </p>
      <Link href="/dashboard">
        <Button size="lg">Get Started</Button>
      </Link>
    </div>
  )
} 