import Link from "next/link";
import { Leaf, ShoppingBag, Apple, Milk, Beef, Croissant, Package, Truck, CheckCircle, MapPin, Plus } from "lucide-react";

export default function FreshMarketHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FreshMarket</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/produce" className="text-muted-foreground hover:text-foreground transition-colors">Produce</Link>
              <Link href="/organic" className="text-muted-foreground hover:text-foreground transition-colors">Organic</Link>
              <Link href="/local" className="text-muted-foreground hover:text-foreground transition-colors">Local</Link>
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

      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Farm to Table</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Fresh & <span className="text-primary">Organic</span> Produce
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Locally sourced, sustainably grown. Delivered fresh to your door within 24 hours of harvest.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Now</Link>
                <Link href="/boxes" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Weekly Boxes</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-muted-foreground">Organic</div>
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
                <div className={`${cat.color} rounded-2xl p-6 text-center transition-transform hover:-translate-y-1`}>
                  <cat.icon className="w-8 h-8 mx-auto mb-3" />
                  <span className="font-medium">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Fresh Arrivals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-sm border group">
                <div className={`h-48 ${product.image} relative`}>
                  {product.organic && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">Organic</span>
                  )}
                  {product.local && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">Local</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.weight}</p>
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Join Our Farm Family</h2>
          <p className="text-primary-foreground/80 mb-8">Subscribe to weekly fresh produce boxes and save 20%</p>
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
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">FreshMarket</span>
              </div>
              <p className="text-sm text-muted-foreground">Fresh, organic produce from local farms to your table.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/produce" className="hover:text-foreground">Produce</Link></li>
                <li><Link href="/organic" className="hover:text-foreground">Organic</Link></li>
                <li><Link href="/boxes" className="hover:text-foreground">Weekly Boxes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/farmers" className="hover:text-foreground">Our Farmers</Link></li>
                <li><Link href="/sustainability" className="hover:text-foreground">Sustainability</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@freshmarket.com</li>
                <li>1-800-FRESH-01</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 FreshMarket. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Vegetables", href: "/vegetables", icon: Leaf, color: "bg-green-100 text-green-700" },
  { name: "Fruits", href: "/fruits", icon: Apple, color: "bg-red-100 text-red-700" },
  { name: "Dairy", href: "/dairy", icon: Milk, color: "bg-blue-100 text-blue-700" },
  { name: "Meat", href: "/meat", icon: Beef, color: "bg-orange-100 text-orange-700" },
  { name: "Bakery", href: "/bakery", icon: Croissant, color: "bg-yellow-100 text-yellow-700" },
  { name: "Pantry", href: "/pantry", icon: Package, color: "bg-amber-100 text-amber-700" },
];

const products = [
  { name: "Organic Avocados", weight: "3 pack", price: "$5.99", image: "bg-green-100", organic: true, local: true },
  { name: "Heirloom Tomatoes", weight: "1 lb", price: "$4.49", image: "bg-red-100", organic: true, local: false },
  { name: "Fresh Kale", weight: "1 bunch", price: "$2.99", image: "bg-green-200", organic: true, local: true },
  { name: "Honeycrisp Apples", weight: "2 lb", price: "$3.99", image: "bg-red-200", organic: false, local: true },
];

const features = [
  { title: "Fresh Harvest", desc: "Picked within 24 hours", icon: Leaf },
  { title: "Free Delivery", desc: "On orders over $35", icon: Truck },
  { title: "Organic Certified", desc: "USDA organic products", icon: CheckCircle },
  { title: "Local Farms", desc: "Supporting local growers", icon: MapPin },
];
