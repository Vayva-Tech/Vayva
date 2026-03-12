import Link from "next/link";
import { Wrench, ShoppingBag, Hammer, Drill, Saw, HardHat, Truck, Star, Plus, Shield } from "lucide-react";

export default function ToolCraftHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ToolCraft</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/hand-tools" className="text-muted-foreground hover:text-foreground transition-colors">Hand Tools</Link>
              <Link href="/power-tools" className="text-muted-foreground hover:text-foreground transition-colors">Power Tools</Link>
              <Link href="/equipment" className="text-muted-foreground hover:text-foreground transition-colors">Equipment</Link>
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
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Pro Grade</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Tools That <span className="text-primary">Work</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Professional-grade tools and equipment for every job. Built tough for professionals and DIYers alike.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Tools</Link>
                <Link href="/pro-deals" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Pro Deals</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">Lifetime</div>
                <div className="text-muted-foreground">Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
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
          <h2 className="text-3xl font-bold mb-8">Featured Tools</h2>
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join Pro Rewards</h2>
          <p className="text-primary-foreground/80 mb-8">Exclusive deals for professionals</p>
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
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">ToolCraft</span>
              </div>
              <p className="text-sm text-muted-foreground">Professional tools since 1985.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/hand-tools" className="hover:text-foreground">Hand Tools</Link></li>
                <li><Link href="/power-tools" className="hover:text-foreground">Power Tools</Link></li>
                <li><Link href="/equipment" className="hover:text-foreground">Equipment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/warranty" className="hover:text-foreground">Warranty</Link></li>
                <li><Link href="/repairs" className="hover:text-foreground">Repairs</Link></li>
                <li><Link href="/pro" className="hover:text-foreground">Pro Program</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>pro@toolcraft.com</li>
                <li>1-800-TOOLCRAFT</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 ToolCraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Hand Tools", href: "/hand-tools", icon: Hammer },
  { name: "Power Tools", href: "/power-tools", icon: Drill },
  { name: "Saws", href: "/saws", icon: Saw },
  { name: "Safety", href: "/safety", icon: HardHat },
  { name: "Storage", href: "/storage", icon: Truck },
  { name: "Accessories", href: "/accessories", icon: Wrench },
];

const products = [
  { name: "Pro Drill Set", category: "Power Tools", price: "$199", badge: "Best Seller" },
  { name: "Hammer Set", category: "Hand Tools", price: "$89", badge: null },
  { name: "Safety Kit", category: "Safety", price: "$79", badge: "New" },
  { name: "Tool Chest", category: "Storage", price: "$299", badge: null },
];

const features = [
  { title: "Lifetime Warranty", desc: "On all tools", icon: Shield },
  { title: "Pro Pricing", desc: "Contractor rates", icon: Star },
  { title: "Fast Shipping", desc: "2-day delivery", icon: Truck },
  { title: "Free Returns", desc: "30 day policy", icon: Wrench },
];
