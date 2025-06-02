import { Outlet } from "react-router-dom"
import { Navigation } from "@/components/Layout/Navigation"

export default function RootLayout() {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
} 