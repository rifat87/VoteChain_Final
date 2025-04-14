import { Link } from "react-router-dom"
import { Home, Users, Shield, Moon, Sun, Wallet, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/components/ui/wallet-provider"
import { useTheme } from "@/components/ui/theme-provider"
import { useRole } from "@/hooks/useRole"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Voter Dashboard", href: "/voter", icon: Users },
  { name: "Admin Dashboard", href: "/admin", icon: Shield },
]

export function DashboardSidebar() {
  const { isConnected, address, connect, disconnect } = useWallet()
  const { theme, setTheme } = useTheme()
  const { isAdmin } = useRole()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-xl font-semibold">VoteChain</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link to={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link to="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Voter
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link to="/admin/register-candidate">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Candidate
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
      <div className="space-y-2 border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          )}
        </Button>
        <Separator />
        <div className="space-y-2">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                >
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="default"
              className="w-full"
              onClick={connect}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 