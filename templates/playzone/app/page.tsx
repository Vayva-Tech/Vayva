import Link from "next/link";
import { Gamepad2, ShoppingBag, Joystick, Headphones, Monitor, Mouse, Keyboard, Trophy, Zap, Shield, Truck, Star, Plus, Flame } from "lucide-react";

export default function PlayZoneHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">PlayZone</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/consoles" className="text-muted-foreground hover:text-foreground transition-colors">Consoles</Link>
              <Link href="/pc" className="text-muted-foreground hover:text-foreground transition-colors">PC Gaming</Link>
              <Link href="/accessories" className="text-muted-foreground hover:text-foreground transition-colors">Accessories</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">5</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4 flex items-center gap-2 w-fit">
                <Flame className="w-4 h-4" /> Hot Drops
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Level Up Your <span className="text-primary">Game</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Premium gaming gear, consoles, and accessories for the ultimate gaming experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Gear</Link>
                <Link href="/deals" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Daily Deals</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">100K+</div>
                <div className="text-muted-foreground">Gamers Online</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Gaming Categories</h2>
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
          <h2 className="text-3xl font-bold mb-8">Trending Gear</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-sm border group">
                <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 relative">
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-accent text-white text-xs rounded-full font-medium">{product.badge}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{product.price}</span>
                    <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join the PlayZone Elite</h2>
          <p className="text-primary-foreground/80 mb-8">Early access to new drops and exclusive member discounts</p>
          <div className="flex flex-wrap justify-center gap-4">
            <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-lg w-72" />
            <button className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Join Free
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">PlayZone</span>
              </div>
              <p className="text-sm text-muted-foreground">Premium gaming gear for serious gamers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/consoles" className="hover:text-foreground">Consoles</Link></li>
                <li><Link href="/pc" className="hover:text-foreground">PC Gaming</Link></li>
                <li><Link href="/accessories" className="hover:text-foreground">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/warranty" className="hover:text-foreground">Warranty</Link></li>
                <li><Link href="/shipping" className="hover:text-foreground">Shipping</Link></li>
                <li><Link href="/returns" className="hover:text-foreground">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@playzone.gg</li>
                <li>1-800-GAMER-01</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 PlayZone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Consoles", href: "/consoles", icon: Joystick },
  { name: "Headsets", href: "/headsets", icon: Headphones },
  { name: "Monitors", href: "/monitors", icon: Monitor },
  { name: "Mice", href: "/mice", icon: Mouse },
  { name: "Keyboards", href: "/keyboards", icon: Keyboard },
  { name: "Trophies", href: "/trophies", icon: Trophy },
];

const products = [
  { name: "Pro Gaming Mouse", category: "Gaming Mouse", price: "$79", badge: "Best Seller" },
  { name: "RGB Keyboard", category: "Gaming Keyboard", price: "$129", badge: null },
  { name: "Elite Headset", category: "Gaming Headset", price: "$149", badge: "New" },
  { name: "4K Gaming Monitor", category: "Gaming Monitor", price: "$499", badge: "Hot" },
];

const features = [
  { title: "Fast Shipping", desc: "Same day dispatch", icon: Zap },
  { title: "2-Year Warranty", desc: "On all electronics", icon: Shield },
  { title: "Free Returns", desc: "30-day guarantee", icon: Truck },
  { title: "5-Star Rated", desc: "By 50K+ gamers", icon: Star },
];
