import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 11, 2026</p>

        <Card className="glass-panel rounded-2xl p-6 border-primary/25 space-y-4 text-sm text-muted-foreground">
          <p>FluxDEX does not custody private keys or directly store wallet secrets.</p>
          <p>We may process anonymous telemetry for performance and reliability improvements.</p>
          <p>Third-party providers (wallets, RPC, analytics) may collect additional data under their policies.</p>
          <p>You can disconnect wallets and clear local data at any time from your browser.</p>
        </Card>
      </div>
    </div>
  );
}
