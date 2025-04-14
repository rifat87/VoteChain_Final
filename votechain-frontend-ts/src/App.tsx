import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { WalletProvider } from "@/components/ui/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import Dashboard from "@/pages/Dashboard"
import { VoterDashboard } from "@/pages/VoterDashboard"
import AdminDashboard from "@/pages/AdminDashboard"
import { VoterRegistrationPage } from "@/pages/VoterRegistrationPage"
import { RegisterCandidatePage } from "@/pages/RegisterCandidatePage"
import { useRoleRedirect } from "@/hooks/useRoleRedirect"

function AppRoutes() {
  useRoleRedirect()
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/voter" element={<VoterDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/register" element={<VoterRegistrationPage />} />
      <Route path="/admin/register-candidate" element={<RegisterCandidatePage />} />
    </Routes>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WalletProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </WalletProvider>
    </ThemeProvider>
  )
}
