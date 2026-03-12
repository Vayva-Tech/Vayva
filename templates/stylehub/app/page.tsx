import Link from "next/link";
import { Sparkles, ShoppingBag, Shirt, Footprints, Crown, Glasses, Watch, Bag, Truck, Star, Plus, TrendingUp } from "lucide-react";

export default function StyleHubHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">StyleHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/new" className="text-muted-foreground hover:text-foreground transition-colors">New</Link>
              <Link href="/trending" className="text-muted-foreground hover:text-foreground transition-colors">Trending</Link>
              <Link href="/sale" className="text-muted-foreground hover:text-foreground transition-colors">Sale</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">3</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-muted via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">New Season</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Define Your <span className="text-secondary">Style</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Trendy streetwear and fashion essentials. Express yourself with our curated collections.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Now</Link>
                <Link href="/lookbook" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Lookbook</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-muted to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">200K+</div>
                <div className="text-muted-foreground">Style Icons</div>
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <Link href="/trending" className="text-primary hover:underline flex items-center gap-1">
              View All <TrendingUp className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-sm border group">
                <div className="h-64 bg-gradient-to-br from-muted to-muted-foreground/20 relative">
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-secondary text-white text-xs rounded-full font-medium">{product.badge}</span>
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join the Style Club</h2>
          <p className="text-primary-foreground/80 mb-8">Get early access to drops and exclusive discounts</p>
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
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">StyleHub</span>
              </div>
              <p className="text-sm text-muted-foreground">Trendy fashion for the bold and beautiful.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/new" className="hover:text-foreground">New Arrivals</Link></li>
                <li><Link href="/trending" className="hover:text-foreground">Trending</Link></li>
                <li><Link href="/sale" className="hover:text-foreground">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/size-guide" className="hover:text-foreground">Size Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-foreground">Shipping</Link></li>
                <li><Link href="/returns" className="hover:text-foreground">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@stylehub.com</li>
                <li>1-800-STYLE-01</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 StyleHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Tops", href: "/tops", icon: Shirt },
  { name: "Bottoms", href: "/bottoms", icon: Footprints },
  { name: "Accessories", href: "/accessories", icon: Crown },
  { name: "Eyewear", href: "/eyewear", icon: Glasses },
  { name: "Watches", href: "/watches", icon: Watch },
  { name: "Bags", href: "/bags", icon: Bag },
];

const products = [
  { name: "Oversized Tee", category: "Streetwear", price: "$45", badge: "Hot" },
  { name: "Cargo Pants", category: "Bottoms", price: "$89", badge: null },
  { name: "Retro Sunglasses", category: "Accessories", price: "$35", badge: "New" },
  { name: "Canvas Tote", category: "Bags", price: "$55", badge: null },
];

const features = [
  { title: "Free Returns", desc: "30-day hassle free", icon: Truck },
  { title: "Trending Styles", desc: "Updated weekly", icon: TrendingUp },
  { title: "VIP Perks", desc: "Exclusive access", icon: Crown },
  { title: "5-Star Rated", desc: "By 100K+ shoppers", icon: Star },
];
