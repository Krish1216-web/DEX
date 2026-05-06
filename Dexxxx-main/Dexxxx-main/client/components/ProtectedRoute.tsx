import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "@/context/WalletContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none pt-20">
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-3xl font-black text-foreground mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-muted-foreground mb-8">
              You need to connect a wallet to access this feature. This unlocks full trading capabilities and portfolio management.
            </p>
          </div>

          <Link to="/wallet">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 gap-2 font-semibold mb-4">
              <Wallet className="w-4 h-4" />
              Connect Wallet
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>

          <Link to="/">
            <Button variant="outline" className="w-full border-primary/20 h-12">
              Back to Home
            </Button>
          </Link>

          <Card className="mt-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 p-6">
            <p className="text-sm text-muted-foreground mb-3">
              <span className="font-semibold text-foreground">Why connect?</span>
            </p>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>✓ Swap tokens instantly</li>
              <li>✓ Track your portfolio</li>
              <li>✓ Provide liquidity & earn fees</li>
              <li>✓ View transaction history</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
