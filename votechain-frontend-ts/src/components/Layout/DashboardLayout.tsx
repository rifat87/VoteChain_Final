import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/components/ui/wallet-provider";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isConnected } = useWallet();
  const navigate = useNavigate();

  // Only redirect if we're already on a dashboard page and not connected
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (!isConnected && (currentPath.startsWith('/admin') || currentPath.startsWith('/voter'))) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  // Show loading state instead of null
  if (!isConnected) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Please connect your wallet to access the dashboard</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 