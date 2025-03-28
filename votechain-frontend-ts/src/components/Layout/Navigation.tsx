import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Settings,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  role?: "admin" | "voter"
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Voter Profile",
    href: "/voter/profile",
    icon: <UserCircle className="h-4 w-4" />,
    role: "voter",
  },
  {
    title: "Voter Management",
    href: "/admin/voters",
    icon: <Users className="h-4 w-4" />,
    role: "admin",
  },
  {
    title: "Election Settings",
    href: "/admin/settings",
    icon: <Settings className="h-4 w-4" />,
    role: "admin",
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: <Shield className="h-4 w-4" />,
    role: "admin",
  },
]

export function Navigation() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const userRole = "admin"

  useEffect(() => {
    const handleMouseEnter = () => setShowTooltip(true)
    const handleMouseLeave = () => setShowTooltip(false)

    const button = buttonRef.current
    if (button) {
      button.addEventListener('mouseenter', handleMouseEnter)
      button.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (button) {
        button.removeEventListener('mouseenter', handleMouseEnter)
        button.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return (
    <>
      <nav className={cn(
        "flex flex-col h-screen border-r transition-all duration-200 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between p-2 border-b h-14 relative z-10">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">VC</span>
              </div>
              <span className="text-lg font-semibold">Menu</span>
            </div>
          )}
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              size="icon"
              className={cn(
                "ml-auto",
                isCollapsed ? "mx-auto" : ""
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <div className="space-y-1 p-2">
            {navItems.map((item) => {
              if (item.role && item.role !== userRole) return null
              return (
                <div key={item.href} className="relative group">
                  <Button
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === item.href && "bg-secondary",
                      isCollapsed && "justify-center px-2"
                    )}
                    asChild
                  >
                    <a href={item.href}>
                      {item.icon}
                      {!isCollapsed && item.title}
                    </a>
                  </Button>
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">
                      {item.title}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>
      {showTooltip && buttonRef.current && (
        <div
          ref={tooltipRef}
          className="fixed px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm whitespace-nowrap z-[9999]"
          style={{
            top: buttonRef.current.getBoundingClientRect().top + buttonRef.current.offsetHeight / 2,
            left: buttonRef.current.getBoundingClientRect().right + 8,
            transform: 'translateY(-50%)'
          }}
        >
          {isCollapsed ? "Open sidebar" : "Close sidebar"}
        </div>
      )}
    </>
  )
} 