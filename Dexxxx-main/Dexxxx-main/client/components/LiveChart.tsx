import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LineChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

interface LiveChartProps {
  data: CandleData[];
  lineData: LineChartDataPoint[];
  symbol: string;
  currentPrice: number;
  priceChange: number;
}

export function LiveChart({
  data,
  lineData,
  symbol,
  currentPrice,
  priceChange,
}: LiveChartProps) {
  const [chartType, setChartType] = useState<"candlestick" | "line" | "ohlc">(
    "candlestick"
  );
  const [timeframe, setTimeframe] = useState<"1h" | "4h" | "24h">("1h");

  const isPositive = priceChange >= 0;

  const candleData = data.map((candle) => ({
    time: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
    range: [candle.low, candle.high],
  }));

  const timeframeConfig: Record<"1h" | "4h" | "24h", { candlePoints: number; linePoints: number }> = {
    "1h": { candlePoints: 12, linePoints: 15 },
    "4h": { candlePoints: 48, linePoints: 60 },
    "24h": { candlePoints: 288, linePoints: 360 },
  };

  const { candlePoints, linePoints } = timeframeConfig[timeframe];
  const displayedCandleData = candleData.slice(-Math.min(candlePoints, candleData.length));
  const displayedLineData = lineData.slice(-Math.min(linePoints, lineData.length));

  const displayedCandleWithIndicators = displayedCandleData.map((point, index, allPoints) => {
    const shortWindow = allPoints.slice(Math.max(0, index - 8), index + 1);
    const longWindow = allPoints.slice(Math.max(0, index - 20), index + 1);

    const ma9 =
      shortWindow.length === 9
        ? Number((shortWindow.reduce((sum, p) => sum + p.close, 0) / 9).toFixed(4))
        : null;

    const ma21 =
      longWindow.length === 21
        ? Number((longWindow.reduce((sum, p) => sum + p.close, 0) / 21).toFixed(4))
        : null;

    return {
      ...point,
      ma9,
      ma21,
    };
  });

  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload, data, index, yAxis } = props;
    const candle = payload ?? (Array.isArray(data) && index !== undefined ? data[index] : undefined);
    if (!candle) return null;

    const xPos = x + width / 2;
    const color = candle.close >= candle.open ? "#10b981" : "#ef4444";

    const yScale = yAxis?.scale;
    if (typeof yScale === "function") {
      const openY = yScale(candle.open);
      const closeY = yScale(candle.close);
      const highY = yScale(candle.high);
      const lowY = yScale(candle.low);
      const rectTop = Math.min(openY, closeY);
      const rectHeight = Math.max(Math.abs(closeY - openY), 2);

      return (
        <g key={index}>
          <line x1={xPos} y1={highY} x2={xPos} y2={lowY} stroke={color} strokeWidth={1} opacity={0.8} />
          <rect x={xPos - 4} y={rectTop} width={8} height={rectHeight} fill={color} stroke={color} strokeWidth={1} />
        </g>
      );
    }

    return (
      <g key={index}>
        <line x1={xPos} y1={y} x2={xPos} y2={y + height} stroke={color} strokeWidth={1} opacity={0.7} />
        <rect x={xPos - 4} y={y} width={8} height={Math.max(height, 2)} fill={color} stroke={color} strokeWidth={1} />
      </g>
    );
  };

  const CustomOhlcBar = (props: any) => {
    const { x, y, width, height, payload, index, yAxis } = props;
    const candle = payload;
    if (!candle) return null;

    const xPos = x + width / 2;
    const tick = Math.max(4, Math.min(width * 0.3, 8));
    const color = candle.close >= candle.open ? "#10b981" : "#ef4444";

    const yScale = yAxis?.scale;
    if (typeof yScale === "function") {
      const openY = yScale(candle.open);
      const highY = yScale(candle.high);
      const lowY = yScale(candle.low);
      const closeY = yScale(candle.close);

      return (
        <g key={index}>
          <line x1={xPos} y1={highY} x2={xPos} y2={lowY} stroke={color} strokeWidth={1.3} opacity={0.95} />
          <line x1={xPos - tick} y1={openY} x2={xPos} y2={openY} stroke={color} strokeWidth={1.5} />
          <line x1={xPos} y1={closeY} x2={xPos + tick} y2={closeY} stroke={color} strokeWidth={1.5} />
        </g>
      );
    }

    return (
      <g key={index}>
        <line x1={xPos} y1={y} x2={xPos} y2={y + height} stroke={color} strokeWidth={1.3} opacity={0.85} />
        <line x1={xPos - tick} y1={y + height * 0.25} x2={xPos} y2={y + height * 0.25} stroke={color} strokeWidth={1.5} />
        <line x1={xPos} y1={y + height * 0.7} x2={xPos + tick} y2={y + height * 0.7} stroke={color} strokeWidth={1.5} />
      </g>
    );
  };

  const candleHigh = Math.max(...displayedCandleData.map((d) => d.high));
  const candleLow = Math.min(...displayedCandleData.map((d) => d.low));
  const totalVolume = displayedCandleData.reduce((sum, d) => sum + d.volume, 0);

  return (
    <Card className="bg-gradient-to-b from-card via-card/95 to-card border border-primary/20 p-8 rounded-3xl shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40">
              <span className="text-2xl font-black text-primary">{symbol[0]}</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-foreground">{symbol}</h3>
              <p className="text-xs text-muted-foreground">Live Price Chart</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-5xl font-black text-primary tracking-tight">
              ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{priceChange}%</span>
              </div>
              <span className="text-xs text-muted-foreground">Live Change</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary/10">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{timeframe.toUpperCase()} High</p>
              <p className="text-lg font-bold text-foreground">${candleHigh.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{timeframe.toUpperCase()} Low</p>
              <p className="text-lg font-bold text-foreground">${candleLow.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{timeframe.toUpperCase()} Volume</p>
              <p className="text-lg font-bold text-foreground">${(totalVolume / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-64">
          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase">Chart Type</p>
            <div className="grid grid-cols-3 gap-2">
              {(["candlestick", "line", "ohlc"] as const).map((type) => (
                <Button
                  key={type}
                  onClick={() => setChartType(type)}
                  variant={chartType === type ? "default" : "outline"}
                  className={`text-xs font-semibold transition-all ${
                    chartType === type
                      ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg"
                      : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {type === "candlestick" ? "Candle" : type === "line" ? "Line" : "OHLC"}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase">Timeframe</p>
            <div className="grid grid-cols-3 gap-2">
              {(["1h", "4h", "24h"] as const).map((tf) => (
                <Button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  variant={timeframe === tf ? "default" : "outline"}
                  className={`text-xs font-semibold transition-all ${
                    timeframe === tf
                      ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg"
                      : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/55 rounded-2xl p-6 mb-6 border border-slate-600/40 backdrop-blur-sm">
        {chartType === "candlestick" ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={displayedCandleWithIndicators} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#475569" vertical={true} opacity={0.35} />
              <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: "11px" }} minTickGap={22} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} domain={["auto", "auto"]} />
              <ReferenceLine y={currentPrice} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.6} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (typeof value !== "number") return [value, name];
                  const labelMap: Record<string, string> = {
                    open: "Open",
                    high: "High",
                    low: "Low",
                    close: "Close",
                    ma9: "MA 9",
                    ma21: "MA 21",
                  };
                  return [value.toFixed(4), labelMap[name] ?? name];
                }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "#e2e8f0", fontWeight: "bold" }}
                cursor={{ stroke: "#64748b", strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="ma9" stroke="#f97316" dot={false} strokeWidth={1.2} connectNulls isAnimationActive={false} />
              <Line type="monotone" dataKey="ma21" stroke="#3b82f6" dot={false} strokeWidth={1.2} connectNulls isAnimationActive={false} />
              <Bar dataKey="close" fill="#22c55e" shape={<CustomCandlestick data={displayedCandleWithIndicators} />} barSize={9} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : chartType === "ohlc" ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={displayedCandleData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis stroke="#e2e8f0" style={{ fontSize: "12px" }} domain={["auto", "auto"]} />
              <Tooltip
                formatter={(value: number, name: string) => [typeof value === "number" ? value.toFixed(2) : value, name]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                cursor={{ stroke: "#0ea5e9", strokeWidth: 1.5 }}
              />
              <Bar dataKey="close" fill="#0ea5e9" shape={<CustomOhlcBar />} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={displayedLineData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="time" stroke="#e2e8f0" style={{ fontSize: "12px" }} />
              <YAxis stroke="#e2e8f0" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="price" stroke="#06b6d4" dot={false} strokeWidth={3} isAnimationActive={true} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-gradient-to-b from-secondary/20 to-secondary/5 rounded-2xl p-6 border border-primary/10 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground mb-4 font-bold uppercase tracking-wider">Trading Volume</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartType === "line" ? displayedLineData : displayedCandleData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            <XAxis hide={true} />
            <YAxis hide={true} />
            <Bar dataKey="volume" fill="url(#volumeGradient)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
