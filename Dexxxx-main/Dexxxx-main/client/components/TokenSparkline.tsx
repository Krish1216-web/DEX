import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: Array<{ time: string; price: number }>;
  isPositive: boolean;
}

export function TokenSparkline({ data, isPositive }: SparklineProps) {
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
