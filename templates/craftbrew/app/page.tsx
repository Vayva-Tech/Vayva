"use client";

import Link from "next/link";
import { Coffee, ShoppingBag, Bean, CupSoda, Croissant, Cookie, Droplets, Thermometer, Truck, Star, Plus, Award } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { toast } from "sonner";

export default function CraftBrewHome() {
  const { cartCount, addToCart } = useStore();

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.name,
      name: product.name,
      price: parseInt(product.price.replace('$', '')),
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CraftBrew</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/coffee" className="text-muted-foreground hover:text-foreground transition-colors">Coffee</Link>
              <Link href="/tea" className="text-muted-foreground hover:text-foreground transition-colors">Tea</Link>
              <Link href="/equipment" className="text-muted-foreground hover:text-foreground transition-colors">Equipment</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Freshly Roasted</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Craft Coffee, <span className="text-primary">Perfected</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Small-batch roasted coffee beans and artisan brewing equipment for the perfect cup.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Coffee</Link>
                <Link href="/subscriptions" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Subscriptions</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-muted-foreground">Star Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href} className="group">
                <div className="bg-muted rounded-2xl p-6 text-center transition-transform hover:-translate-y-1 hover:bg-primary/10">
                  <cat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <span className="font-medium text-foreground">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Best Sellers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-sm border group">
                <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 relative">
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">{product.badge}</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-muted-foreground">{product.rating}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.roast}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{product.price}</span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join the Coffee Club</h2>
          <p className="text-primary-foreground/80 mb-8">Fresh roasts delivered monthly. Pause or cancel anytime.</p>
          <Link href="/subscribe" className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
            Start Subscription
          </Link>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">CraftBrew</span>
              </div>
              <p className="text-sm text-muted-foreground">Artisan coffee and tea for the perfect brew.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/coffee" className="hover:text-foreground">Coffee</Link></li>
                <li><Link href="/tea" className="hover:text-foreground">Tea</Link></li>
                <li><Link href="/equipment" className="hover:text-foreground">Equipment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/story" className="hover:text-foreground">Our Story</Link></li>
                <li><Link href="/roastery" className="hover:text-foreground">Roastery</Link></li>
                <li><Link href="/sustainability" className="hover:text-foreground">Sustainability</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@craftbrew.com</li>
                <li>1-800-BREW-01</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 CraftBrew. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Coffee", href: "/coffee", icon: Coffee },
  { name: "Tea", href: "/tea", icon: CupSoda },
  { name: "Brewers", href: "/brewers", icon: Droplets },
  { name: "Grinders", href: "/grinders", icon: Bean },
  { name: "Snacks", href: "/snacks", icon: Croissant },
  { name: "Merch", href: "/merch", icon: Cookie },
];

const products = [
  { name: "Ethiopian Blend", roast: "Light Roast", price: "$18", rating: "4.9", badge: "Bestseller" },
  { name: "Colombian Dark", roast: "Dark Roast", price: "$16", rating: "4.8", badge: null },
  { name: "V60 Pour Over", roast: "Equipment", price: "$35", rating: "4.9", badge: "New" },
  { name: "Matcha Set", roast: "Tea", price: "$42", rating: "4.7", badge: null },
];

const features = [
  { title: "Fresh Roasted", desc: "Within 48 hours", icon: Thermometer },
  { title: "Free Shipping", desc: "Orders over $40", icon: Truck },
  { title: "Award Winning", desc: "Best roaster 2024", icon: Award },
  { title: "Sustainable", desc: "Direct trade only", icon: Bean },
];
