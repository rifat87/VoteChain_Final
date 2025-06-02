import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/components/ui/wallet-provider";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isConnected, isWalletChecked } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWalletChecked && !isConnected) {
      navigate('/', { replace: true });
    }
  }, [isWalletChecked, isConnected, navigate]);

  // Show loader while wallet is being checked
  if (!isWalletChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Show connect message if not connected
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