import Link from "next/link";
import { Gem, ShoppingBag, Watch, Crown, Sparkles, Gift, Shield, Truck, Star, Plus, Award } from "lucide-react";

export default function ZenithHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Zenith</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/collections" className="text-muted-foreground hover:text-foreground transition-colors">Collections</Link>
              <Link href="/timepieces" className="text-muted-foreground hover:text-foreground transition-colors">Timepieces</Link>
              <Link href="/gifts" className="text-muted-foreground hover:text-foreground transition-colors">Gifts</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">2</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Luxury Redefined</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Timeless <span className="text-primary">Elegance</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Curated luxury timepieces and accessories for those who appreciate excellence.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Collection</Link>
                <Link href="/concierge" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Concierge</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-muted to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">Since 1985</div>
                <div className="text-muted-foreground">Heritage of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Curated Categories</h2>
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
          <h2 className="text-3xl font-bold mb-8">Featured Pieces</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-sm border group">
                <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 relative">
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">{product.badge}</span>
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join the Zenith Circle</h2>
          <p className="text-primary-foreground/80 mb-8">Exclusive previews and private events</p>
          <div className="flex flex-wrap justify-center gap-4">
            <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-lg w-72" />
            <button className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Gem className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Zenith</span>
              </div>
              <p className="text-sm text-muted-foreground">Heritage luxury since 1985.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Collections</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/watches" className="hover:text-foreground">Timepieces</Link></li>
                <li><Link href="/jewelry" className="hover:text-foreground">Fine Jewelry</Link></li>
                <li><Link href="/accessories" className="hover:text-foreground">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/concierge" className="hover:text-foreground">Concierge</Link></li>
                <li><Link href="/servicing" className="hover:text-foreground">Servicing</Link></li>
                <li><Link href="/appraisals" className="hover:text-foreground">Appraisals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>concierge@zenith.com</li>
                <li>+1 (800) ZENITH-1</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 Zenith. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Watches", href: "/watches", icon: Watch },
  { name: "Heritage", href: "/heritage", icon: Crown },
  { name: "Limited", href: "/limited", icon: Sparkles },
  { name: "Gifts", href: "/gifts", icon: Gift },
  { name: "Protection", href: "/protection", icon: Shield },
  { name: "Service", href: "/service", icon: Award },
];

const products = [
  { name: "Heritage Chronograph", category: "Timepiece", price: "$12,500", badge: "Limited" },
  { name: "Classic Collection", category: "Watch", price: "$5,900", badge: null },
  { name: "Executive Gift Set", category: "Gifts", price: "$2,400", badge: "New" },
  { name: "Servicing Kit", category: "Care", price: "$350", badge: null },
];

const features = [
  { title: "Authenticity", desc: "Certified genuine", icon: Shield },
  { title: "White Glove", desc: "Premium delivery", icon: Truck },
  { title: "Lifetime Care", desc: "Servicing included", icon: Award },
  { title: "5-Year Warranty", desc: "Full coverage", icon: Star },
];
