import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import type { FC } from "react"
import { Layout } from "@/components/Layout/Layout"
import { PublicDashboard } from "@/components/Dashboard/PublicDashboard"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"

const Home: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to VoteChain</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center">
        A secure and transparent blockchain-based voting system
      </p>
      <Link to="/dashboard">
        <Button size="lg">Get Started</Button>
      </Link>
    </div>
  )
}

const App: FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<PublicDashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
