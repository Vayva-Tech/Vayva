import Link from "next/link";
import { Home, ShoppingBag, Paintbrush, Hammer, Sofa, Lamp, Flower2, ChefHat, Ruler, Truck, Heart, Plus } from "lucide-react";

export default function HomeCraftHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">HomeCraft</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/decor" className="text-muted-foreground hover:text-foreground transition-colors">Decor</Link>
              <Link href="/furniture" className="text-muted-foreground hover:text-foreground transition-colors">Furniture</Link>
              <Link href="/diy" className="text-muted-foreground hover:text-foreground transition-colors">DIY</Link>
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

      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Handmade with Love</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Make Your House a <span className="text-primary">Home</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Curated decor, furniture, and DIY supplies to create spaces you love.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Now</Link>
                <Link href="/inspiration" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Get Inspired</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-muted-foreground">Happy Homes</div>
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
          <h2 className="text-3xl font-bold mb-8">Popular Picks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-sm border group">
                <div className="h-48 bg-gradient-to-br from-muted to-muted-foreground/20 relative">
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">{product.badge}</span>
                  )}
                  <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                  </button>
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">DIY Workshop</h2>
          <p className="text-primary-foreground/80 mb-8">Join our weekly DIY classes and create something beautiful</p>
          <Link href="/workshops" className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
            View Schedule
          </Link>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">HomeCraft</span>
              </div>
              <p className="text-sm text-muted-foreground">Making home beautiful, one piece at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/decor" className="hover:text-foreground">Decor</Link></li>
                <li><Link href="/furniture" className="hover:text-foreground">Furniture</Link></li>
                <li><Link href="/diy" className="hover:text-foreground">DIY Supplies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Inspire</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/lookbook" className="hover:text-foreground">Lookbook</Link></li>
                <li><Link href="/workshops" className="hover:text-foreground">Workshops</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@homecraft.com</li>
                <li>1-800-HOME-01</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 HomeCraft. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Wall Art", href: "/wall-art", icon: Paintbrush },
  { name: "Lighting", href: "/lighting", icon: Lamp },
  { name: "Furniture", href: "/furniture", icon: Sofa },
  { name: "Plants", href: "/plants", icon: Flower2 },
  { name: "Kitchen", href: "/kitchen", icon: ChefHat },
  { name: "Tools", href: "/tools", icon: Ruler },
];

const products = [
  { name: "Macrame Wall Hanging", category: "Wall Decor", price: "$89", badge: "Handmade" },
  { name: "Ceramic Vase Set", category: "Decor", price: "$65", badge: null },
  { name: "Woven Storage Basket", category: "Organization", price: "$45", badge: "Popular" },
  { name: "Wooden Floating Shelves", category: "Furniture", price: "$120", badge: null },
];

const features = [
  { title: "Handmade Items", desc: "By local artisans", icon: Heart },
  { title: "Free Shipping", desc: "Orders over $75", icon: Truck },
  { title: "DIY Guides", desc: "Step-by-step tutorials", icon: Hammer },
  { title: "Custom Orders", desc: "Made just for you", icon: Paintbrush },
];
