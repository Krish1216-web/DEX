import { WalletConnect } from "@/components/WalletConnect";
import { Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function DexHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 border-b border-primary/20 bg-slate-950/45 backdrop-blur-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 via-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-black tracking-tight text-lg text-foreground hidden sm:inline">
            FluxDEX
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {[
            ["/swap", "Swap"],
            ["/markets", "Markets"],
            ["/liquidity", "Liquidity"],
            ["/portfolio", "Portfolio"],
            ["/history", "History"],
            ["/security", "Security"],
            ["/admin", "Admin"],
          ].map(([path, label]) => (
            <Link
              key={path}
              to={String(path)}
              className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${
                isActive(String(path))
                  ? "bg-gradient-to-r from-violet-500 via-primary to-cyan-400 text-white shadow-lg shadow-primary/35"
                  : "text-muted-foreground hover:text-accent hover:bg-primary/15"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <WalletConnect />
      </div>
    </header>
  );
}
