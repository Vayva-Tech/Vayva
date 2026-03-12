"use client";

import { Wallet, Shield, Zap, TrendingUp, Lock, Globe, CheckCircle, ArrowRight, Bitcoin } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Shield, title: "Bank-Grade Security", desc: "Cold storage & 2FA" },
  { icon: Zap, title: "Instant Trades", desc: "Execute in seconds" },
  { icon: TrendingUp, title: "Advanced Charts", desc: "Real-time analytics" },
  { icon: Globe, title: "Global Access", desc: "Trade anywhere" },
];

const coins = [
  { name: "Bitcoin", symbol: "BTC", price: "$43,245", change: "+2.4%" },
  { name: "Ethereum", symbol: "ETH", price: "$2,890", change: "+1.8%" },
  { name: "Solana", symbol: "SOL", price: "$98.50", change: "+5.2%" },
];

const stats = [
  { value: "$2B+", label: "Volume Traded" },
  { value: "50+", label: "Cryptocurrencies" },
  { value: "1M+", label: "Users" },
  { value: "0.1%", label: "Low Fees" },
];

export default function CryptoVaultHome() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <nav className="bg-dark-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CryptoVault</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/markets" className="text-gray-300 hover:text-white">Markets</Link>
              <Link href="/trading" className="text-gray-300 hover:text-white">Trading</Link>
              <Link href="/wallet" className="text-gray-300 hover:text-white">Wallet</Link>
              <Link href="/earn" className="text-gray-300 hover:text-white">Earn</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white">Sign In</Link>
              <Link href="/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-b from-dark-800 to-dark-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Trade Crypto <span className="text-primary-500">Like a Pro</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Secure wallet, instant trading, and advanced analytics
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="btn-primary">Start Trading</Link>
                <Link href="/demo" className="px-8 py-3 bg-dark-800 text-white font-medium rounded-lg border border-gray-700 hover:bg-dark-700">View Demo</Link>
              </div>
            </div>
            <div className="bg-dark-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Trending Coins</h3>
              <div className="space-y-4">
                {coins.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 bg-dark-900 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center">₿</div>
                      <div>
                        <div className="font-semibold">{coin.name}</div>
                        <div className="text-sm text-gray-500">{coin.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{coin.price}</div>
                      <div className="text-sm text-green-400">{coin.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why CryptoVault</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6 bg-dark-800 rounded-2xl border border-gray-700">
                <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-dark-800 border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">CryptoVault</span>
              </div>
              <p className="text-sm text-gray-400">Secure crypto trading platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/wallet">Wallet</Link></li>
                <li><Link href="/exchange">Exchange</Link></li>
                <li><Link href="/staking">Staking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            © 2024 CryptoVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
