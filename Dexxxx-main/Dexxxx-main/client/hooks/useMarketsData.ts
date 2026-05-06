import { useEffect, useMemo, useState } from "react";

export interface MarketToken {
  rank: number;
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change1h: number;
  change24h: number;
  fdv: number;
  volume24h: number;
  sparkline: number[];
  tick: "up" | "down" | "flat";
}

export interface MarketSummary {
  dayVolume: number;
  marketCap: number;
  defiCap: number;
  activeCoins: number;
}

const FALLBACK_SUMMARY: MarketSummary = {
  dayVolume: 120000000000,
  marketCap: 2400000000000,
  defiCap: 85000000000,
  activeCoins: 14000,
};

export function useMarketsData() {
  const [tokens, setTokens] = useState<MarketToken[]>([]);
  const [summary, setSummary] = useState<MarketSummary>(FALLBACK_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError(null);

        const response = await fetch("/api/markets/live");
        if (!response.ok) {
          throw new Error("Live market endpoint unavailable");
        }

        const json = (await response.json()) as {
          tokens?: Array<{
            rank: number;
            id: string;
            name: string;
            symbol: string;
            image: string;
            price: number;
            change1h: number;
            change24h: number;
            fdv: number;
            volume24h: number;
            sparkline: number[];
          }>;
          summary?: {
            dayVolume: number;
            marketCap: number;
            defiCap: number;
            activeCoins: number;
          };
          stale?: boolean;
        };

        const mappedTokensBase: Omit<MarketToken, "tick">[] = Array.isArray(json.tokens)
          ? json.tokens.map((coin) => ({
              rank: Number(coin.rank || 0),
              id: String(coin.id || ""),
              name: String(coin.name || "Unknown"),
              symbol: String(coin.symbol || "").toUpperCase(),
              image: String(coin.image || ""),
              price: Number(coin.price || 0),
              change1h: Number(coin.change1h || 0),
              change24h: Number(coin.change24h || 0),
              fdv: Number(coin.fdv || 0),
              volume24h: Number(coin.volume24h || 0),
              sparkline: Array.isArray(coin.sparkline) ? coin.sparkline.map((p) => Number(p || 0)) : [],
            }))
          : [];

        const mappedTokens: MarketToken[] = mappedTokensBase.map((token) => ({
          ...token,
          tick: "flat",
        }));

        const nextSummary: MarketSummary = {
          dayVolume: Number(json.summary?.dayVolume || FALLBACK_SUMMARY.dayVolume),
          marketCap: Number(json.summary?.marketCap || FALLBACK_SUMMARY.marketCap),
          defiCap: Number(json.summary?.defiCap || FALLBACK_SUMMARY.defiCap),
          activeCoins: Number(json.summary?.activeCoins || FALLBACK_SUMMARY.activeCoins),
        };

        if (!mounted) return;
        setTokens((prev) => {
          if (!prev.length) {
            return mappedTokens;
          }

          const prevPriceMap = new Map(prev.map((token) => [token.id, token.price]));
          return mappedTokens.map((token) => {
            const oldPrice = prevPriceMap.get(token.id);
            if (typeof oldPrice !== "number") {
              return { ...token, tick: "flat" };
            }

            if (token.price > oldPrice) {
              return { ...token, tick: "up" };
            }
            if (token.price < oldPrice) {
              return { ...token, tick: "down" };
            }
            return { ...token, tick: "flat" };
          });
        });
        setSummary(nextSummary);
        setLastUpdated(Date.now());

        if (json.stale) {
          setError("Live feed is temporarily stale. Showing cached recent data.");
        }
      } catch {
        if (!mounted) return;
        setError("Could not fetch live market data. Showing fallback values.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = window.setInterval(load, 10000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const topVolume = useMemo(() => {
    if (!tokens.length) return 0;
    return tokens.reduce((sum, t) => sum + t.volume24h, 0);
  }, [tokens]);

  return { tokens, summary, loading, error, topVolume, lastUpdated };
}
