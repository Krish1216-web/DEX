import { Card } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-3">Risk Disclosure</h1>
        <p className="text-muted-foreground mb-8">Trading digital assets involves significant risk.</p>

        <Card className="glass-panel rounded-2xl p-6 border-primary/25 space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
            <TriangleAlert className="w-4 h-4 text-yellow-400 mt-0.5" />
            <span>Do not trade funds you cannot afford to lose.</span>
          </div>
          <p>Smart contract vulnerabilities, bridge issues, and network congestion can impact execution outcomes.</p>
          <p>Price volatility and liquidity changes can create adverse slippage and losses.</p>
          <p>Users are responsible for independent due diligence and tax/legal compliance.</p>
        </Card>
      </div>
    </div>
  );
}
