import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LiveChart } from "@/components/LiveChart";
import { TokenSparkline } from "@/components/TokenSparkline";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Markets() {
	const [selectedToken, setSelectedToken] = useState("ETH");
	const [search, setSearch] = useState("");

	const { data: chartData, lineData: chartLine, currentPrice: selectedPrice, priceChange: selectedChange } =
		useRealtimeData(selectedToken);

	const { currentPrice: ethPrice, priceChange: ethChange } = useRealtimeData("ETH");

	const tokens = [
		{
			symbol: "ETH",
			name: "Ethereum",
			icon: "E",
			price: ethPrice,
			change: ethChange,
			volume: "125.2M",
			tvl: "45.2B",
			color: "from-purple-500/20 to-indigo-500/20",
		},
		{
			symbol: "USDC",
			name: "USD Coin",
			icon: "USDC",
			price: 1.0,
			change: 0,
			volume: "450.5M",
			tvl: "28.0B",
			color: "from-blue-500/20 to-cyan-500/20",
		},
		{
			symbol: "DAI",
			name: "Dai Stablecoin",
			icon: "DAI",
			price: 1.0,
			change: 0.01,
			volume: "85.3M",
			tvl: "18.0B",
			color: "from-yellow-500/20 to-orange-500/20",
		},
		{
			symbol: "WBTC",
			name: "Wrapped Bitcoin",
			icon: "WBTC",
			price: 61234.5,
			change: 5.2,
			volume: "75.1M",
			tvl: "32.0B",
			color: "from-orange-500/20 to-yellow-500/20",
		},
		{
			symbol: "UNI",
			name: "Uniswap",
			icon: "UNI",
			price: 8.42,
			change: -1.3,
			volume: "45.7M",
			tvl: "5.2B",
			color: "from-pink-500/20 to-rose-500/20",
		},
		{
			symbol: "USDT",
			name: "Tether USD",
			icon: "USDT",
			price: 1.0,
			change: 0.02,
			volume: "850.2M",
			tvl: "85.0B",
			color: "from-green-500/20 to-emerald-500/20",
		},
	];

	const filteredTokens = tokens.filter(
		(token) =>
			token.symbol.toLowerCase().includes(search.toLowerCase()) ||
			token.name.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="min-h-screen bg-background pt-20 relative overflow-hidden pb-20">
			<div className="fixed inset-0 pointer-events-none pt-20">
				<div className="absolute top-40 right-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
				<div
					className="absolute bottom-32 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				></div>
			</div>

			<div className="relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12">
						<h1 className="text-4xl font-black text-foreground mb-2">Markets</h1>
						<p className="text-muted-foreground">Real-time charts and trading data for all tokens</p>
					</div>

					<div className="mb-12">
						<LiveChart
							data={chartData}
							lineData={chartLine}
							symbol={selectedToken}
							currentPrice={Number(selectedPrice.toFixed(2))}
							priceChange={Number(selectedChange.toFixed(2))}
						/>
					</div>

					<section>
						<div className="mb-8">
							<div className="relative mb-5">
								<Search className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="Search tokens..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-12 h-12 bg-card border-primary/20 placeholder:text-muted-foreground text-base rounded-xl"
								/>
							</div>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-black text-foreground">Top Trading Tokens</h2>
								<p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
									{filteredTokens.length} Tokens
								</p>
							</div>
						</div>

						<div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 mb-2 bg-secondary/30 rounded-xl border border-primary/10">
							<div className="col-span-3">
								<p className="text-xs font-bold text-muted-foreground uppercase">Token</p>
							</div>
							<div className="col-span-2 text-right">
								<p className="text-xs font-bold text-muted-foreground uppercase">Price</p>
							</div>
							<div className="col-span-2 text-right">
								<p className="text-xs font-bold text-muted-foreground uppercase">24h Change</p>
							</div>
							<div className="col-span-2 text-right">
								<p className="text-xs font-bold text-muted-foreground uppercase">Volume (24h)</p>
							</div>
							<div className="col-span-3 text-right">
								<p className="text-xs font-bold text-muted-foreground uppercase">Price Chart</p>
							</div>
						</div>

						<div className="space-y-2">
							{filteredTokens.map((token) => {
								const isPositive = token.change >= 0;
								const sparklineData = chartLine.slice(-20);

								return (
									<button
										key={token.symbol}
										onClick={() => setSelectedToken(token.symbol)}
										className={`w-full transition-all duration-300 rounded-xl group ${
											selectedToken === token.symbol ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
										}`}
									>
										<Card
											className={`border-0 backdrop-blur-sm transition-all border border-primary/10 group-hover:border-primary/30 ${
												selectedToken === token.symbol
													? "bg-gradient-to-r from-primary/20 to-accent/10"
													: "bg-card/60 hover:bg-card/80"
											} p-4 lg:p-5`}
										>
											<div className="lg:hidden flex items-center justify-between gap-3">
												<div className="flex items-center gap-3 flex-1">
													<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold text-primary flex-shrink-0">
														{token.icon[0]}
													</div>
													<div className="text-left flex-1 min-w-0">
														<p className="font-bold text-foreground text-sm truncate">{token.symbol}</p>
														<p className="text-xs text-muted-foreground truncate">{token.name}</p>
													</div>
												</div>

												<div className="text-right">
													<p className="font-bold text-foreground text-sm">
														${token.price.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: token.price < 1 ? 4 : 2,
														})}
													</p>
													<div
														className={`flex items-center justify-end gap-1 text-xs font-bold ${
															isPositive ? "text-success" : "text-destructive"
														}`}
													>
														{isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
														{isPositive ? "+" : ""}
														{token.change}%
													</div>
												</div>
											</div>

											<div className="hidden lg:grid grid-cols-12 gap-4 items-center">
												<div className="col-span-3 flex items-center gap-4">
													<div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center font-bold text-primary flex-shrink-0">
														{token.icon[0]}
													</div>
													<div className="text-left">
														<p className="font-bold text-foreground">{token.symbol}</p>
														<p className="text-xs text-muted-foreground">{token.name}</p>
													</div>
												</div>

												<div className="col-span-2 text-right">
													<p className="font-bold text-foreground">
														${token.price.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: token.price < 1 ? 4 : 2,
														})}
													</p>
												</div>

												<div className="col-span-2 text-right">
													<div
														className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm ${
															isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
														}`}
													>
														{isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
														{isPositive ? "+" : ""}
														{token.change}%
													</div>
												</div>

												<div className="col-span-2 text-right">
													<p className="font-bold text-foreground">{token.volume}</p>
													<p className="text-xs text-muted-foreground">24h Vol</p>
												</div>

												<div className="col-span-3 flex justify-end">
													<TokenSparkline data={sparklineData} isPositive={isPositive} />
												</div>
											</div>
										</Card>
									</button>
								);
							})}
						</div>
					</section>

					<section className="mt-16 pt-16 border-t border-primary/10">
						<h2 className="text-2xl font-black text-foreground mb-8">Market Overview</h2>

						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-6 rounded-2xl">
								<p className="text-xs text-muted-foreground mb-2">Total Market Cap</p>
								<p className="text-3xl font-black text-primary">$2.4T</p>
								<p className="text-xs text-success mt-2 flex items-center gap-1">
									<TrendingUp className="w-3 h-3" />
									+4.2% (24h)
								</p>
							</Card>

							<Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 p-6 rounded-2xl">
								<p className="text-xs text-muted-foreground mb-2">24h Volume</p>
								<p className="text-3xl font-black text-accent">$124.5B</p>
								<p className="text-xs text-success mt-2 flex items-center gap-1">
									<TrendingUp className="w-3 h-3" />
									+12.3% (24h)
								</p>
							</Card>

							<Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 p-6 rounded-2xl">
								<p className="text-xs text-muted-foreground mb-2">BTC Dominance</p>
								<p className="text-3xl font-black text-success">45.2%</p>
								<p className="text-xs text-destructive mt-2 flex items-center gap-1">
									<TrendingDown className="w-3 h-3" />
									-1.5% (24h)
								</p>
							</Card>

							<Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 p-6 rounded-2xl">
								<p className="text-xs text-muted-foreground mb-2">Active Coins</p>
								<p className="text-3xl font-black text-purple-400">22,450</p>
								<p className="text-xs text-success mt-2 flex items-center gap-1">
									<TrendingUp className="w-3 h-3" />
									+125 (24h)
								</p>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
