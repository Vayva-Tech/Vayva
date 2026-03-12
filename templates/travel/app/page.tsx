"use client";

import { Search, Plane, MapPin, Calendar, Star, Compass, Umbrella, Mountain, Building, ArrowRight, Heart, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const destinations = [
  { name: "Bali, Indonesia", price: "$899", rating: 4.9, image: "🏝️", nights: 7 },
  { name: "Paris, France", price: "$1,299", rating: 4.8, image: "🗼", nights: 5 },
  { name: "Tokyo, Japan", price: "$1,599", rating: 4.9, image: "🗾", nights: 8 },
  { name: "Dubai, UAE", price: "$1,199", rating: 4.7, image: "🏙️", nights: 5 },
  { name: "Maldives", price: "$2,499", rating: 5.0, image: "🏝️", nights: 6 },
  { name: "London, UK", price: "$999", rating: 4.6, image: "🏰", nights: 4 },
];

const packages = [
  { icon: Plane, title: "Flights", desc: "Best flight deals worldwide" },
  { icon: Building, title: "Hotels", desc: "Premium accommodations" },
  { icon: Compass, title: "Tours", desc: "Guided experiences" },
  { icon: Mountain, title: "Adventure", desc: "Thrilling expeditions" },
];

const testimonials = [
  { name: "Emma & James", trip: "Honeymoon to Santorini", quote: "The most romantic trip! Everything was perfectly arranged." },
  { name: "The Chen Family", trip: "Japan Adventure", quote: "Kids loved it! The guided tours were educational and fun." },
  { name: "Marcus T.", trip: "Solo Africa Safari", quote: "Life-changing experience. Felt safe and supported throughout." },
];

export default function TravelHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">VayvaTravel</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/destinations" className="text-muted-foreground hover:text-foreground transition-colors">Destinations</Link>
              <Link href="/packages" className="text-muted-foreground hover:text-foreground transition-colors">Packages</Link>
              <Link href="/hotels" className="text-muted-foreground hover:text-foreground transition-colors">Hotels</Link>
              <Link href="/flights" className="text-muted-foreground hover:text-foreground transition-colors">Flights</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-sky-100 via-background to-accent/20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 text-6xl animate-pulse">✈️</div>
          <div className="absolute bottom-40 right-20 text-5xl animate-pulse delay-1000">🌅</div>
          <div className="absolute top-40 right-40 text-4xl animate-pulse delay-500">☁️</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-current" />
              Rated #1 Travel Platform in Nigeria
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Discover Your Next <span className="text-primary">Adventure</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Book flights, hotels, and tours at unbeatable prices. Your dream vacation starts here.
            </p>
            
            {/* Search Box */}
            <div className="bg-card rounded-2xl shadow-xl p-6 border">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" placeholder="From where?" className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg border-0" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" placeholder="To where?" className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg border-0" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" placeholder="When?" className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg border-0" />
                </div>
                <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.title} className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <pkg.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{pkg.title}</h3>
                <p className="text-muted-foreground text-sm">{pkg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-muted-foreground">Handpicked vacation packages at amazing prices</p>
            </div>
            <Link href="/destinations" className="text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <div key={dest.name} className="group bg-card rounded-2xl overflow-hidden border hover:shadow-xl transition-all">
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-6xl">{dest.image}</span>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{dest.rating}</span>
                    <span className="text-muted-foreground text-sm">(128 reviews)</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{dest.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Umbrella className="w-4 h-4" />
                    <span>{dest.nights} nights</span>
                    <span>•</span>
                    <span>All inclusive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">{dest.price}</span>
                      <span className="text-muted-foreground text-sm">/person</span>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-primary/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Traveler Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-6 border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{t.quote}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-primary">{t.trip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore the World?</h2>
          <p className="text-white/80 mb-8">Join 50,000+ travelers who book with VayvaTravel every month</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/destinations" className="px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors">
              Browse Destinations
            </Link>
            <Link href="/contact" className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              Talk to an Expert
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/80 text-sm">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 24/7 Support</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Best Price Guarantee</span>
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> Trusted by 50K+</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">VayvaTravel</span>
              </div>
              <p className="text-sm text-muted-foreground">Your trusted partner for unforgettable travel experiences worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/destinations" className="hover:text-foreground">Destinations</Link></li>
                <li><Link href="/packages" className="hover:text-foreground">Packages</Link></li>
                <li><Link href="/flights" className="hover:text-foreground">Flights</Link></li>
                <li><Link href="/hotels" className="hover:text-foreground">Hotels</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                <li><Link href="/press" className="hover:text-foreground">Press</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Travel Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-foreground">FAQs</Link></li>
                <li><Link href="/cancellation" className="hover:text-foreground">Cancellation Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 VayvaTravel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
