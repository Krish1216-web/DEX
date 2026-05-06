import { useState, useEffect, useRef } from "react";

export interface PricePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  time: string;
  price: number;
  volume: number;
}

const BASE_PRICES: Record<string, number> = {
  ETH: 2450,
  WBTC: 61234,
  UNI: 8.4,
  USDC: 1,
  USDT: 1,
  DAI: 1,
};

const getBasePrice = (symbol: string): number => BASE_PRICES[symbol] ?? 100;

const priceDrift = (price: number, basePrice: number): number => {
  const meanReversion = (basePrice - price) * 0.002;
  const random = (Math.random() - 0.5) * Math.max(basePrice * 0.0025, 0.01);
  return meanReversion + random;
};

const toTimeLabel = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const generateMockPriceData = (basePrice: number): PricePoint[] => {
  const points = 288; // 24h with 5-minute candles
  const data: PricePoint[] = [];
  let price = basePrice;

  for (let i = points; i >= 0; i--) {
    const open = price;
    const close = Math.max(0.0001, open + priceDrift(open, basePrice));
    const spread = Math.max(basePrice * 0.0015, 0.002);
    const high = Math.max(open, close) + Math.random() * spread;
    const low = Math.min(open, close) - Math.random() * spread;
    const time = new Date();
    time.setMinutes(time.getMinutes() - i * 5);

    data.push({
      time: toTimeLabel(time),
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(Math.max(0.0001, low).toFixed(4)),
      close: Number(close.toFixed(4)),
      volume: Math.floor(Math.random() * 7000000) + 800000,
    });

    price = close;
  }

  return data;
};

const generateMockLineData = (basePrice: number): ChartData[] => {
  const points = 360; // smooth long-range line for trend view
  const data: ChartData[] = [];
  let price = basePrice;

  for (let i = points; i >= 0; i--) {
    price = Math.max(0.0001, price + priceDrift(price, basePrice));
    const time = new Date();
    time.setMinutes(time.getMinutes() - i * 4);

    data.push({
      time: toTimeLabel(time),
      price: Number(price.toFixed(4)),
      volume: Math.floor(Math.random() * 4500000) + 400000,
    });
  }

  return data;
};

export const useRealtimeData = (symbol: string, interval: "1h" | "4h" | "24h" = "1h") => {
  const basePrice = getBasePrice(symbol);
  const [data, setData] = useState<PricePoint[]>(() => generateMockPriceData(basePrice));
  const [lineData, setLineData] = useState<ChartData[]>(() => generateMockLineData(basePrice));
  const [currentPrice, setCurrentPrice] = useState<number>(basePrice);
  const [priceChange, setPriceChange] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const seedCandles = generateMockPriceData(basePrice);
    const seedLine = generateMockLineData(basePrice);
    setData(seedCandles);
    setLineData(seedLine);
    setCurrentPrice(seedLine[seedLine.length - 1]?.price ?? basePrice);
    setPriceChange(Number((((seedLine[seedLine.length - 1]?.price ?? basePrice) - basePrice) / basePrice * 100).toFixed(2)));
  }, [symbol, interval, basePrice]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData];
        const last = newData[newData.length - 1];
        if (!last) return prevData;

        const nextClose = Math.max(0.0001, last.close + priceDrift(last.close, basePrice));
        newData[newData.length - 1] = {
          ...last,
          close: Number(nextClose.toFixed(4)),
          high: Number(Math.max(last.high, nextClose).toFixed(4)),
          low: Number(Math.max(0.0001, Math.min(last.low, nextClose)).toFixed(4)),
          volume: last.volume + Math.floor(Math.random() * 90000),
        };

        return newData;
      });

      setLineData((prevData) => {
        const newData = [...prevData];
        const last = newData[newData.length - 1];
        if (!last) return prevData;

        const nextPrice = Math.max(0.0001, last.price + priceDrift(last.price, basePrice));
        const now = new Date();
        const nextPoint: ChartData = {
          time: toTimeLabel(now),
          price: Number(nextPrice.toFixed(4)),
          volume: Math.floor(Math.random() * 4500000) + 400000,
        };

        newData.push(nextPoint);
        if (newData.length > 360) newData.shift();

        setCurrentPrice(nextPoint.price);
        setPriceChange(Number((((nextPoint.price - basePrice) / basePrice) * 100).toFixed(2)));

        return newData;
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [basePrice]);

  return { data, lineData, currentPrice, priceChange };
};
