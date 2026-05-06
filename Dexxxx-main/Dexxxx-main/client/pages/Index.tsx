import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useWallet } from "@/context/WalletContext";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Gauge,
  Orbit,
  Layers,
  CheckCircle2,
  Wallet,
  BadgeCheck,
  Users,
  Cpu,
  MessageCircle,
  Globe,
  Github,
  BookOpen,
  Clock3,
} from "lucide-react";
import { useLiveHomepageMetrics } from "@/hooks/useLiveHomepageMetrics";

const ROUTE_QUALITY = [
  { label: "Liquidity Depth", value: 92 },
  { label: "Price Efficiency", value: 96 },
  { label: "Execution Reliability", value: 99 },
];

const PROTOCOL_PULSE = [
  { title: "Route Confidence", value: "98.7%", bar: 98, tone: "from-primary/50 to-cyan-400/50" },
  { title: "Avg. Finality", value: "~2.1s", bar: 84, tone: "from-cyan-400/45 to-blue-400/45" },
  { title: "MEV Shield", value: "Enabled", bar: 91, tone: "from-violet-500/45 to-primary/45" },
];

const TRUST_PARTNERS = ["Chainlink", "Arbitrum", "Base", "Polygon", "OpenZeppelin", "Ledger"];
const SUPPORTED_CHAINS = ["Ethereum", "Arbitrum", "Base", "Optimism", "Polygon", "BNB Chain"];

const FAQ_ITEMS = [
  {
    q: "How secure is FluxDEX?",
    a: "FluxDEX is non-custodial and all execution requires wallet signatures. Smart contracts are reviewed and audited, and users always retain key ownership.",
  },
  {
    q: "How does routing work?",
    a: "Routing checks available liquidity across supported paths and chooses the best expected execution based on slippage, depth, and fee profile.",
  },
  {
    q: "Can I use mobile wallets?",
    a: "Yes. WalletConnect-compatible and injected mobile wallets can connect directly to the app interface.",
  },
  {
    q: "Do you custody funds?",
    a: "No. FluxDEX does not custody user funds. All swaps and liquidity actions are executed from your connected wallet.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The execution quality and UX feel institutional. It is the first DEX interface our trading desk trusts daily.",
    author: "Maya R.",
    role: "Quant Trader",
  },
  {
    quote:
      "FluxDEX gave us faster routing and lower realized slippage across volatile pairs. The visibility is excellent.",
    author: "Darius K.",
    role: "DAO Treasury Lead",
  },
  {
    quote:
      "Clean architecture, transparent route details, and stable performance. Exactly what we needed for scale.",
    author: "Ava T.",
    role: "Crypto Operations Manager",
  },
];

export default function Index() {
  const { connected } = useWallet();
  const { metrics } = useLiveHomepageMetrics();

  const [scrollY, setScrollY] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [animStats, setAnimStats] = useState({ tvl: 0, volume: 0, users: 0 });
  const [animateRouteBars, setAnimateRouteBars] = useState(false);
  const [animatePulseBars, setAnimatePulseBars] = useState(false);

  const routeBarsRef = useRef<HTMLDivElement | null>(null);
  const pulseBarsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const duration = 1400;
    const frames = 56;
    let step = 0;
    const tick = window.setInterval(() => {
      step += 1;
      const t = Math.min(step / frames, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setAnimStats({
        tvl: Math.floor(metrics.tvl * eased),
        volume: Math.floor(metrics.volume24h * eased),
        users: Math.floor(metrics.users * eased),
      });

      if (t === 1) {
        window.clearInterval(tick);
      }
    }, duration / frames);

    return () => window.clearInterval(tick);
  }, [metrics]);

  useEffect(() => {
    const routeElement = routeBarsRef.current;
    const pulseElement = pulseBarsRef.current;
    if (!routeElement && !pulseElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (entry.target === routeElement) {
            setAnimateRouteBars(true);
          }

          if (entry.target === pulseElement) {
            setAnimatePulseBars(true);
          }

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );

    if (routeElement) observer.observe(routeElement);
    if (pulseElement) observer.observe(pulseElement);

    return () => observer.disconnect();
  }, []);

  const stats = useMemo(
    () => [
      { label: "TVL", value: `$${(animStats.tvl / 1000000000).toFixed(1)}B` },
      { label: "24h Volume", value: `$${(animStats.volume / 1000000000).toFixed(1)}B` },
      { label: "Active Users", value: `${(animStats.users / 1000).toFixed(0)}K+` },
    ],
    [animStats],
  );

  const simulateRoute = () => {
    setIsLoadingRoute(true);
    window.setTimeout(() => setIsLoadingRoute(false), 1200);
  };

  return (
    <div className="min-h-screen bg-background pt-20 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden pt-20">
        <div
          className="absolute top-10 -right-16 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-violet-500/35 via-blue-500/25 to-cyan-400/20 blur-[100px]"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        ></div>
      </div>

      <div className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs text-accent font-semibold">
                <Sparkles className="w-3 h-3" />
                Investor-Grade Decentralized Trading Infrastructure
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-foreground leading-tight">
                Trade The Future
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300">
                  Without Compromise
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed">
                FluxDEX delivers high-performance routing, transparent pricing, and non-custodial execution for traders, funds, and crypto-native teams.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link to="/swap">
                  <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-500 via-primary to-cyan-400 text-white font-semibold shadow-[0_0_24px_rgba(86,115,255,0.45)] hover:opacity-95">
                    Start Trading
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={connected ? "/swap" : "/wallet"}>
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-xl border-primary/30 bg-card/60 hover:bg-primary/10 font-semibold"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
                {stats.map((s) => (
                  <Card key={s.label} className="glass-panel rounded-xl border-primary/25 p-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-violet-500/60 via-primary/55 to-cyan-400/60"></div>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="glass-panel rounded-3xl border-primary/25 p-5 sm:p-6 shadow-[0_0_36px_rgba(70,112,255,0.18)]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-foreground">Smart Route Preview</h3>
                <span className="text-xs text-success bg-success/20 px-2.5 py-1 rounded-full">Route Online</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground mb-2">You Pay</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black">1.25</p>
                    <div className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-card/70 px-3 py-1.5">
                      <span className="h-6 w-6 rounded-full bg-violet-500/30 text-xs flex items-center justify-center">E</span>
                      <span className="font-semibold">ETH</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground mb-2">You Receive</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black">3,043.28</p>
                    <div className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-card/70 px-3 py-1.5">
                      <span className="h-6 w-6 rounded-full bg-cyan-400/30 text-xs flex items-center justify-center">U</span>
                      <span className="font-semibold">USDC</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="rounded-xl border-primary/25 bg-card/65 p-3">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-semibold mt-1">1 ETH = 2434.62 USDC</p>
                  </Card>
                  <Card className="rounded-xl border-primary/25 bg-card/65 p-3">
                    <p className="text-xs text-muted-foreground">Slippage</p>
                    <p className="text-sm font-semibold mt-1">0.5%</p>
                  </Card>
                </div>

                <Card ref={routeBarsRef} className="rounded-xl border-primary/25 bg-card/65 p-3">
                  <p className="text-xs text-muted-foreground mb-2">Execution Quality</p>
                  <div className="space-y-2">
                    {ROUTE_QUALITY.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-primary/15 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500/80 via-primary/80 to-cyan-400/80 transition-all duration-1000 ease-out"
                            style={{ width: animateRouteBars ? `${item.value}%` : "0%" }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Button
                  onClick={simulateRoute}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-95 text-primary-foreground font-semibold"
                >
                  {isLoadingRoute ? "Finding Best Route..." : "Preview Execution"}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-primary/10">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-10">Why Leading Traders Choose FluxDEX</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Speed",
                text: "Low-latency quote updates and fast execution flow.",
                icon: <Zap className="w-5 h-5 text-primary" />,
              },
              {
                title: "Low Fees",
                text: "Optimized route selection reduces effective costs.",
                icon: <Gauge className="w-5 h-5 text-accent" />,
              },
              {
                title: "Decentralized",
                text: "Wallet-signed, non-custodial interactions only.",
                icon: <Orbit className="w-5 h-5 text-success" />,
              },
              {
                title: "Security",
                text: "Audited contracts and transparent execution details.",
                icon: <Shield className="w-5 h-5 text-cyan-300" />,
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="glass-panel rounded-2xl border-primary/25 p-5 hover:border-primary/45 hover:-translate-y-0.5 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <p className="text-lg font-bold text-foreground">{feature.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{feature.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-primary/10">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="glass-panel rounded-3xl border-primary/25 p-6">
              <h3 className="text-2xl font-black mb-6">How It Works</h3>
              <div className="space-y-4">
                {[
                  {
                    step: "01",
                    title: "Connect Wallet",
                    text: "Use your preferred wallet in one click.",
                    icon: <Wallet className="w-4 h-4 text-primary" />,
                  },
                  {
                    step: "02",
                    title: "Set Trade Parameters",
                    text: "Select pair, amount, and slippage tolerance.",
                    icon: <Layers className="w-4 h-4 text-accent" />,
                  },
                  {
                    step: "03",
                    title: "Execute Securely",
                    text: "Review route details and confirm on-chain.",
                    icon: <CheckCircle2 className="w-4 h-4 text-success" />,
                  },
                ].map((item) => (
                  <div key={item.step} className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
                    <div className="h-9 w-9 rounded-full border border-primary/25 bg-card/80 flex items-center justify-center text-xs font-bold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <p className="font-semibold text-foreground">{item.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-panel rounded-3xl border-primary/25 p-6">
              <h3 className="text-2xl font-black mb-6">Trust Indicators</h3>
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Audit Badges</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["Trail of Bits", "CertiK", "OpenZeppelin"].map((audit) => (
                      <span
                        key={audit}
                        className="inline-flex items-center gap-1 rounded-full bg-success/20 text-success px-3 py-1 text-xs font-semibold"
                      >
                        <BadgeCheck className="w-3 h-3" />
                        {audit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Supported Chains</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <span key={chain} className="rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs">
                        {chain}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Partners</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {TRUST_PARTNERS.map((partner) => (
                      <div key={partner} className="rounded-lg border border-primary/20 bg-card/70 px-3 py-2 text-sm font-semibold text-center">
                        {partner}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-primary/10">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h3 className="text-3xl font-black">Protocol Pulse</h3>
            <span className="text-xs text-success bg-success/20 px-3 py-1 rounded-full">Live System Health</span>
          </div>

          <div ref={pulseBarsRef} className="grid md:grid-cols-3 gap-4">
            {PROTOCOL_PULSE.map((pulse) => (
              <Card key={pulse.title} className="glass-panel rounded-2xl border-primary/25 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">{pulse.title}</p>
                  <p className="text-sm font-black text-accent">{pulse.value}</p>
                </div>
                <div className="h-2 rounded-full bg-primary/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${pulse.tone} transition-all duration-1000 ease-out`}
                    style={{ width: animatePulseBars ? `${pulse.bar}%` : "0%" }}
                  ></div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-primary/10">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
            <h3 className="text-3xl font-black">Community And Social Proof</h3>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              120k+ Community Members
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((item) => (
              <Card
                key={item.author}
                className="glass-panel rounded-2xl border-primary/25 p-5 hover:border-primary/45 transition-all"
              >
                <p className="text-sm text-foreground/95 leading-relaxed">"{item.quote}"</p>
                <p className="mt-4 font-semibold text-foreground">{item.author}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-primary/10">
          <h3 className="text-3xl font-black text-center mb-8">Frequently Asked Questions</h3>
          <Card className="glass-panel rounded-3xl border-primary/25 p-4 sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="border-primary/20">
                  <AccordionTrigger className="text-left font-semibold hover:text-accent">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        <footer className="mt-8 py-12 border-t border-primary/10 bg-card/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <p className="text-xl font-black text-foreground">FluxDEX</p>
                <p className="text-sm text-muted-foreground mt-3 max-w-xs">
                  Premium non-custodial trading infrastructure built for speed, transparency, and resilience.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-4">Product</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/swap" className="hover:text-accent transition-colors">Swap</Link></li>
                  <li><Link to="/markets" className="hover:text-accent transition-colors">Markets</Link></li>
                  <li><Link to="/liquidity" className="hover:text-accent transition-colors">Liquidity</Link></li>
                  <li><Link to="/security" className="hover:text-accent transition-colors">Security</Link></li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-4">Developers</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="https://docs.uniswap.org/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent transition-colors"><BookOpen className="w-4 h-4" /> Docs</a>
                  </li>
                  <li>
                    <a href="https://ethereum.org/developers/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent transition-colors"><Cpu className="w-4 h-4" /> API</a>
                  </li>
                  <li>
                    <a href="https://status.cloud.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent transition-colors"><Clock3 className="w-4 h-4" /> Status</a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-4">Community</p>
                <div className="flex gap-3">
                  <a aria-label="FluxDEX GitHub" href="https://github.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-primary/25 bg-card/70 flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a aria-label="FluxDEX Discord" href="https://discord.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-primary/25 bg-card/70 flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a aria-label="FluxDEX X profile" href="https://x.com" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full border border-primary/25 bg-card/70 flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted-foreground">
              <p>© 2026 FluxDEX. All rights reserved.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
                <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
                <Link to="/risk" className="hover:text-accent transition-colors">Risk Disclosure</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
