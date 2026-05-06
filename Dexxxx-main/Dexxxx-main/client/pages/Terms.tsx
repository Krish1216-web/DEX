import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-3">Terms of Use</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 11, 2026</p>

        <Card className="glass-panel rounded-2xl p-6 border-primary/25 space-y-4 text-sm text-muted-foreground">
          <p>By using FluxDEX, you acknowledge this interface is non-custodial and interactions are executed on public blockchains.</p>
          <p>You are solely responsible for wallet security, transaction approvals, and regional legal compliance.</p>
          <p>No investment advice is provided. Protocol and market risks may result in loss of funds.</p>
          <p>Use of the interface constitutes acceptance of these terms and related policies.</p>
        </Card>
      </div>
    </div>
  );
}
