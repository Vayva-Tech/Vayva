import Link from "next/link";
import { HeartPulse, ShoppingBag, Stethoscope, Pill, Thermometer, Syringe, Bandage, Activity, Shield, Truck, Star, Plus, Award } from "lucide-react";

export default function MediBayHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MediBay</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/supplies" className="text-muted-foreground hover:text-foreground transition-colors">Medical Supplies</Link>
              <Link href="/equipment" className="text-muted-foreground hover:text-foreground transition-colors">Equipment</Link>
              <Link href="/wellness" className="text-muted-foreground hover:text-foreground transition-colors">Wellness</Link>
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

      <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Trusted Healthcare</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Healthcare You Can <span className="text-primary">Trust</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Medical supplies, equipment, and wellness products for professionals and families.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Shop Medical</Link>
                <Link href="/professionals" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">For Professionals</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">FDA</div>
                <div className="text-muted-foreground">Approved Products</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Medical Categories</h2>
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
          <h2 className="text-3xl font-bold mb-8">Essential Supplies</h2>
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
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Healthcare Professionals</h2>
          <p className="text-primary-foreground/80 mb-8">Get wholesale pricing and bulk ordering for your practice</p>
          <Link href="/apply" className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
            Apply for Account
          </Link>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <HeartPulse className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">MediBay</span>
              </div>
              <p className="text-sm text-muted-foreground">Trusted medical supplies for professionals and families.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/supplies" className="hover:text-foreground">Medical Supplies</Link></li>
                <li><Link href="/equipment" className="hover:text-foreground">Equipment</Link></li>
                <li><Link href="/wellness" className="hover:text-foreground">Wellness</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/shipping" className="hover:text-foreground">Shipping</Link></li>
                <li><Link href="/returns" className="hover:text-foreground">Returns</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>hello@medibay.com</li>
                <li>1-800-MEDIBAY</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 MediBay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: "Monitoring", href: "/monitoring", icon: Activity },
  { name: "First Aid", href: "/first-aid", icon: Bandage },
  { name: "Vitamins", href: "/vitamins", icon: Pill },
  { name: "Equipment", href: "/equipment", icon: Stethoscope },
  { name: "Diagnostics", href: "/diagnostics", icon: Thermometer },
  { name: "Supplies", href: "/supplies", icon: Syringe },
];

const products = [
  { name: "Digital Thermometer", category: "Diagnostics", price: "$29", badge: "Popular" },
  { name: "Blood Pressure Monitor", category: "Monitoring", price: "$59", badge: null },
  { name: "First Aid Kit", category: "First Aid", price: "$45", badge: "Essential" },
  { name: "Vitamin D3", category: "Supplements", price: "$24", badge: null },
];

const features = [
  { title: "FDA Approved", desc: "Certified products", icon: Shield },
  { title: "Fast Shipping", desc: "Next day available", icon: Truck },
  { title: "Wholesale", desc: "For professionals", icon: Award },
  { title: "Expert Support", desc: "Medical guidance", icon: Star },
];
