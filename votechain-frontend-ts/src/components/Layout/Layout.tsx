import { Header } from "./Header"
import { Navigation } from "./Navigation"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
} 