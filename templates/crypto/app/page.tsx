"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Wallet, TrendingUp, Shield, Zap, ArrowRight, Heart, Share2 } from "lucide-react";

const nfts = [
  { id: 1, name: "Cosmic Vibes #001", creator: "@artist_one", price: 0.5, likes: 234, image: "bg-gradient-to-br from-violet-500 to-fuchsia-600" },
  { id: 2, name: "Digital Dreams #42", creator: "@crypto_art", price: 1.2, likes: 567, image: "bg-gradient-to-br from-cyan-500 to-blue-600" },
  { id: 3, name: "Neon Genesis #07", creator: "@nft_master", price: 0.8, likes: 189, image: "bg-gradient-to-br from-amber-500 to-pink-600" },
  { id: 4, name: "Abstract Mind #12", creator: "@digital_dreams", price: 2.5, likes: 892, image: "bg-gradient-to-br from-emerald-500 to-teal-600" },
];

const stats = [
  { label: "Total Volume", value: "₦2.5B+" },
  { label: "NFTs Sold", value: "50K+" },
  { label: "Creators", value: "5K+" },
  { label: "Collectors", value: "25K+" },
];

export default function CryptoHome() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            CRYPTOVAULT
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-slate-300 hover:text-white transition">Explore</Link>
            <Link href="/create" className="text-slate-300 hover:text-white transition">Create</Link>
            <Link href="/drops" className="text-slate-300 hover:text-white transition">Drops</Link>
            <Link href="/stats" className="text-slate-300 hover:text-white transition">Stats</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Wallet className="h-4 w-4 mr-2" /> Connect
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-slate-950 to-fuchsia-900/20" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover & Collect <span className="text-violet-400">Extraordinary</span> NFTs
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              The premier marketplace for digital art, collectibles, and blockchain gaming assets
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Explore NFTs <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Create Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Trending NFTs</h2>
            <Link href="/explore" className="text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div key={nft.id} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500/50 transition">
                <div className={`aspect-square ${nft.image} relative`}>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="p-2 bg-slate-950/80 rounded-lg text-slate-400 hover:text-red-400 transition">
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-slate-950/80 rounded-lg text-slate-400 hover:text-white transition">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-slate-400 text-sm">{nft.creator}</p>
                  <h3 className="text-white font-semibold mb-3">{nft.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">Current Price</p>
                      <p className="text-violet-400 font-bold">{nft.price} ETH</p>
                    </div>
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-white font-semibold mb-2">Secure Trading</h3>
              <p className="text-slate-400">Verified smart contracts and audited security protocols</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-white font-semibold mb-2">Zero Gas Fees</h3>
              <p className="text-slate-400">Layer 2 scaling for minimal transaction costs</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 mx-auto mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-white font-semibold mb-2">Royalties</h3>
              <p className="text-slate-400">Earn up to 10% on secondary sales forever</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
