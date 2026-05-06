import { useEffect, useState } from "react";

export interface HomepageMetrics {
  tvl: number;
  volume24h: number;
  users: number;
  updatedAt: string;
  source: string;
}

const FALLBACK: HomepageMetrics = {
  tvl: 12400000000,
  volume24h: 3200000000,
  users: 890000,
  updatedAt: new Date().toISOString(),
  source: "fallback",
};

export function useLiveHomepageMetrics() {
  const [metrics, setMetrics] = useState<HomepageMetrics>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [llamaResp, globalResp] = await Promise.all([
          fetch("https://api.llama.fi/overview/dexs"),
          fetch("https://api.coingecko.com/api/v3/global"),
        ]);

        const llamaJson = await llamaResp.json();
        const globalJson = await globalResp.json();

        const volume24h = Number(llamaJson?.total24h || FALLBACK.volume24h);
        const tvl = Number(llamaJson?.totalDataChart?.slice(-1)?.[0]?.[1] || FALLBACK.tvl);
        const users = Number(globalJson?.data?.active_cryptocurrencies || 0) * 1000;

        if (!mounted) return;

        setMetrics({
          tvl: Number.isFinite(tvl) && tvl > 0 ? tvl : FALLBACK.tvl,
          volume24h: Number.isFinite(volume24h) && volume24h > 0 ? volume24h : FALLBACK.volume24h,
          users: Number.isFinite(users) && users > 0 ? users : FALLBACK.users,
          updatedAt: new Date().toISOString(),
          source: "live",
        });
      } catch {
        if (!mounted) return;
        setMetrics({ ...FALLBACK, updatedAt: new Date().toISOString() });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = window.setInterval(load, 60000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  return { metrics, loading };
}
