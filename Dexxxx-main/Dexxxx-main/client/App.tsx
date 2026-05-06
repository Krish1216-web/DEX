import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DexHeader } from "./components/DexHeader";
import Index from "./pages/Index";
import Swap from "./pages/Swap";
import Wallet from "./pages/Wallet";
import Portfolio from "./pages/Portfolio";
import Liquidity from "./pages/Liquidity";
import History from "./pages/History";
import Markets from "./pages/Markets";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RiskDisclosure from "./pages/RiskDisclosure";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DexHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route
                path="/swap"
                element={
                  <ProtectedRoute>
                    <Swap />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/markets"
                element={
                  <ProtectedRoute>
                    <Markets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio"
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/liquidity"
                element={
                  <ProtectedRoute>
                    <Liquidity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route path="/security" element={<Security />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/risk" element={<RiskDisclosure />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
