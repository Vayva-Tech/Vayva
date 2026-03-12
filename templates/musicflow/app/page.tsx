"use client";

import { Play, Pause, Heart, Share2, Headphones, Mic2, Radio, Music2 } from "lucide-react";
import Link from "next/link";

const albums = [
  { title: "Midnight Dreams", artist: "Luna Eclipse", color: "from-purple-600 to-purple-800" },
  { title: "Summer Vibes", artist: "Coastal Kids", color: "from-yellow-500 to-orange-500" },
  { title: "Urban Soul", artist: "Metro Beats", color: "from-blue-600 to-cyan-600" },
  { title: "Acoustic Love", artist: "Sarah Chen", color: "from-rose-500 to-pink-600" },
];

const features = [
  { icon: Headphones, title: "Hi-Fi Audio", desc: "Lossless quality" },
  { icon: Mic2, title: "Podcasts", desc: "Exclusive content" },
  { icon: Radio, title: "Live Radio", desc: "24/7 stations" },
  { icon: Music2, title: "Playlists", desc: "Curated for you" },
];

export default function MusicFlowHome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Music2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MusicFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
              <Link href="/library" className="text-muted-foreground hover:text-foreground transition-colors">Library</Link>
              <Link href="/premium" className="text-muted-foreground hover:text-foreground transition-colors">Premium</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/signup" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-90 transition-colors">Try Free</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-b from-primary/20 via-background to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Music for <span className="text-primary">Every Mood</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Stream millions of songs, podcasts, and exclusive content
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="px-12 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-90 transition-colors text-lg">Start Free Trial</Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">30 days free, cancel anytime</p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div key={album.title} className="group cursor-pointer">
                <div className={`aspect-square rounded-xl mb-4 relative overflow-hidden bg-gradient-to-br ${album.color} group-hover:scale-105 transition-transform`}>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground">{album.title}</h3>
                <p className="text-muted-foreground text-sm">{album.artist}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why MusicFlow</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">MusicFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">Music for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/premium" className="hover:text-foreground">Premium</Link></li>
                <li><Link href="/download" className="hover:text-foreground">Download</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 MusicFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
