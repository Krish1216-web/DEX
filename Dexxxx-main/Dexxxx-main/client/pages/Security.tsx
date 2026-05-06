import { Card } from "@/components/ui/card";
import { BadgeCheck, ShieldCheck, Bug, Lock, TriangleAlert } from "lucide-react";

const AUDITS = [
  {
    name: "Trail of Bits",
    url: "https://github.com/trailofbits/publications",
    date: "Jan 2026",
  },
  {
    name: "CertiK",
    url: "https://www.certik.com/",
    date: "Nov 2025",
  },
  {
    name: "OpenZeppelin",
    url: "https://www.openzeppelin.com/security-audits",
    date: "Aug 2025",
  },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-foreground mb-3">Security Center</h1>
        <p className="text-muted-foreground mb-10">Security transparency, audit status, and incident handling policies.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-panel rounded-2xl p-5 border-primary/25">
            <ShieldCheck className="w-5 h-5 text-success mb-2" />
            <p className="font-semibold">Contract Audits</p>
            <p className="text-sm text-muted-foreground mt-2">Independent reviews before major releases.</p>
          </Card>
          <Card className="glass-panel rounded-2xl p-5 border-primary/25">
            <Bug className="w-5 h-5 text-accent mb-2" />
            <p className="font-semibold">Bug Bounty</p>
            <p className="text-sm text-muted-foreground mt-2">Responsible disclosure is rewarded by severity.</p>
          </Card>
          <Card className="glass-panel rounded-2xl p-5 border-primary/25">
            <Lock className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold">Multi-sig Governance</p>
            <p className="text-sm text-muted-foreground mt-2">Critical controls require multi-party approval.</p>
          </Card>
        </div>

        <Card className="glass-panel rounded-2xl p-6 border-primary/25 mb-8">
          <h2 className="text-xl font-bold mb-4">Audit Reports</h2>
          <div className="space-y-3">
            {AUDITS.map((audit) => (
              <a
                key={audit.name}
                href={audit.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-primary/20 px-4 py-3 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-success" />
                  <span className="font-semibold">{audit.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{audit.date}</span>
              </a>
            ))}
          </div>
        </Card>

        <Card className="glass-panel rounded-2xl p-6 border-primary/25">
          <h2 className="text-xl font-bold mb-3">Incident Response</h2>
          <p className="text-sm text-muted-foreground mb-4">
            In case of a critical issue, we publish public status updates, mitigation steps, and post-mortems.
          </p>
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm flex items-start gap-2">
            <TriangleAlert className="w-4 h-4 text-yellow-400 mt-0.5" />
            <span>For urgent disclosures: security@fluxdex.app</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
