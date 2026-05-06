import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
  address: string;
}

const TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "2.5",
    icon: "Ξ",
    address: "0x0000000000000000000000000000000000000000",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "5000.50",
    icon: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    balance: "3250.00",
    icon: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    balance: "1000.00",
    icon: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    balance: "0.05",
    icon: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDd86b8e09762Bd",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    balance: "150.25",
    icon: "UNI",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
];

interface TokenSelectorProps {
  onSelect: (token: Token) => void;
  selectedToken?: Token | null;
  tokens?: Token[];
}

export function TokenSelector({ onSelect, selectedToken, tokens }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const tokenList = tokens ?? TOKENS;

  const filteredTokens = tokenList.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
    setSearch("");
  };

  const iconText = selectedToken?.icon?.slice(0, 4) || "?";

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-between rounded-2xl border border-primary/30 bg-card/60 h-14 px-3 transition-all duration-300 hover:bg-primary/10 hover:border-primary/60 hover:shadow-[0_0_22px_hsl(var(--primary)/0.18)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/45 via-accent/35 to-primary/20 flex items-center justify-center text-[10px] text-foreground font-bold shadow-lg shadow-primary/20">
            {iconText}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground leading-none">
              {selectedToken?.symbol || "Select Token"}
            </span>
            {selectedToken && (
              <span className="text-xs text-muted-foreground mt-1">
                Bal: {selectedToken.balance}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-950/90 border border-primary/30 shadow-[0_0_40px_rgba(45,145,255,0.18)] backdrop-blur-xl max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Select A Token</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary/30 border-primary/30 rounded-xl text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleSelect(token)}
                    className="w-full p-3 rounded-xl bg-card/45 hover:bg-primary/10 transition-all duration-300 flex items-center justify-between border border-transparent hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/45 via-accent/35 to-primary/20 flex items-center justify-center text-[10px] text-foreground font-bold">
                        {token.icon.slice(0, 4)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-foreground">
                          {token.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {token.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {token.balance}
                    </span>
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No Tokens Found
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
