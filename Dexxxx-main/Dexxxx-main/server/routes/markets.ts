import { RequestHandler } from "express";

interface LiveMarketsCache {
  payload: {
    tokens: any[];
    summary: {
      dayVolume: number;
      marketCap: number;
      defiCap: number;
      activeCoins: number;
    };
    fetchedAt: number;
    stale: boolean;
  } | null;
  updatedAt: number;
}

const cache: LiveMarketsCache = {
  payload: null,
  updatedAt: 0,
};

const CACHE_MS = 15000;

async function fetchLiveMarkets() {
  const [marketResp, globalResp] = await Promise.all([
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h",
      {
        headers: {
          accept: "application/json",
        },
      },
    ),
    fetch("https://api.coingecko.com/api/v3/global", {
      headers: {
        accept: "application/json",
      },
    }),
  ]);

  if (!marketResp.ok || !globalResp.ok) {
    throw new Error("Upstream market API failed");
  }

  const marketJson = await marketResp.json();
  const globalJson = await globalResp.json();

  const tokens = Array.isArray(marketJson)
    ? marketJson.map((coin: any, index: number) => ({
        rank: Number(coin.market_cap_rank || index + 1),
        id: String(coin.id || index),
        name: String(coin.name || "Unknown"),
        symbol: String(coin.symbol || "").toUpperCase(),
        image: String(coin.image || ""),
        price: Number(coin.current_price || 0),
        change1h: Number(coin.price_change_percentage_1h_in_currency || 0),
        change24h: Number(coin.price_change_percentage_24h_in_currency || 0),
        fdv: Number(coin.fully_diluted_valuation || 0),
        volume24h: Number(coin.total_volume || 0),
        sparkline: Array.isArray(coin.sparkline_in_7d?.price)
          ? coin.sparkline_in_7d.price.map((p: any) => Number(p || 0)).slice(-24)
          : [],
      }))
    : [];

  const globalData = globalJson?.data || {};
  const summary = {
    dayVolume: Number(globalData?.total_volume?.usd || 0),
    marketCap: Number(globalData?.total_market_cap?.usd || 0),
    defiCap: Number(globalData?.defi_market_cap || 0),
    activeCoins: Number(globalData?.active_cryptocurrencies || 0),
  };

  return {
    tokens,
    summary,
    fetchedAt: Date.now(),
    stale: false,
  };
}

export const handleLiveMarkets: RequestHandler = async (_req, res) => {
  const now = Date.now();

  if (cache.payload && now - cache.updatedAt < CACHE_MS) {
    return res.status(200).json(cache.payload);
  }

  try {
    const payload = await fetchLiveMarkets();
    cache.payload = payload;
    cache.updatedAt = Date.now();
    return res.status(200).json(payload);
  } catch {
    if (cache.payload) {
      return res.status(200).json({
        ...cache.payload,
        stale: true,
      });
    }

    return res.status(502).json({
      error: "Failed to fetch live market data",
      tokens: [],
      summary: {
        dayVolume: 0,
        marketCap: 0,
        defiCap: 0,
        activeCoins: 0,
      },
      fetchedAt: Date.now(),
      stale: true,
    });
  }
};
