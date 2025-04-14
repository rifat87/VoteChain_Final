import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WalletButton } from "@/components/Wallet/WalletButton"
import { ThemeToggle } from "@/components/Layout/ThemeToggle"
import { useRole } from "@/hooks/useRole"
import {
  LayoutDashboard,
  Vote,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  requiresConnection?: boolean
  requiresAdmin?: boolean
  showInAdminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Vote",
    href: "/vote",
    icon: <Vote className="h-4 w-4" />,
    requiresConnection: true,
    requiresAdmin: false,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: <Users className="h-4 w-4" />,
    requiresConnection: true,
    requiresAdmin: true,
  },
  {
    title: "Register Candidate",
    href: "/admin/register-candidate",
    icon: <UserPlus className="h-4 w-4" />,
    requiresConnection: true,
    requiresAdmin: true,
    showInAdminOnly: true,
  },
]

export function Navigation() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { isAdmin, isLoading, isConnected } = useRole()

  const filteredNavItems = navItems.filter(item => {
    if (item.requiresConnection && !isConnected) return false
    if (item.requiresAdmin && !isAdmin) return false
    if (item.requiresConnection && isConnected && item.requiresAdmin === false && isAdmin) return false
    if (item.showInAdminOnly && !location.pathname.startsWith('/admin')) return false
    return true
  })

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && <span className="text-lg font-semibold">VoteChain</span>}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))
          )}
        </nav>
      </ScrollArea>

      <div className="flex flex-col gap-2 border-t p-4">
        <WalletButton />
        <ThemeToggle />
      </div>
    </div>
  )
} 