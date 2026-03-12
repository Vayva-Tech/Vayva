import React from "react";
import { TemplateProps } from "@/components/templates/registry";
import { useStore } from "@/context/StoreContext";
import { Icon, Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";

export const ElectronicsMarketTemplate: React.FC<TemplateProps> = ({
  businessName,
  demoMode,
}) => {
  const { products, addToCart, currency } = useStore();

  const electronicsItems = demoMode
    ? [
        {
          id: "el_1",
          name: "MacBook Pro M3",
          price: 1850000,
          type: "retail",
          metadata: { specs: "16GB RAM, 512GB SSD", color: "Space Gray" },
          image:
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        },
        {
          id: "el_2",
          name: "Sony WH-1000XM5",
          price: 450000,
          type: "retail",
          metadata: { specs: "Noise Cancelling, 30h Battery" },
          image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        },
        {
          id: "el_3",
          name: "Logitech MX Master 3S",
          price: 125000,
          type: "retail",
          metadata: { specs: "8K DPI, Silent Clicks" },
          image:
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        },
      ]
    : products.filter((p) => p.type === "retail");

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Tech Navigation */}
      <nav className="bg-black text-white py-4 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vayva-green rounded-xl flex items-center justify-center text-black font-black">
              E
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              {businessName || "Electronics Hub"}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
            <span className="text-vayva-green cursor-pointer">Explore</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Computers
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Audio
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Deals
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Icon name="Search" size={20} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Futuristic Hero */}
      <header className="relative py-24 overflow-hidden bg-black text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-vayva-green/50 to-transparent animate-pulse" />
        </div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 bg-vayva-green/10 border border-vayva-green/30 rounded-full text-vayva-green text-xs font-black uppercase tracking-[0.2em]">
              Next Gen Performance
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter">
              ELEVATE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vayva-green to-emerald-400">
                TECH STACK
              </span>
            </h1>
            <p className="text-gray-400 max-w-lg text-lg leading-relaxed font-medium">
              The ultimate destination for tech enthusiasts. Discover curated,
              high-performance electronics with Vayva verified warranty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button className="bg-vayva-green text-black hover:bg-vayva-green/90 px-10 py-7 rounded-2xl font-black text-lg shadow-xl shadow-green-500/20">
                Shop Now
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-10 py-7 rounded-2xl font-black text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-vayva-green blur-[100px] opacity-20" />
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
                alt="Tech Hero"
                className="w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 border border-white/10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* High-Tech Grid */}
      <main className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black tracking-tight">FEATURED GEAR</h2>
          <div className="h-0.5 flex-1 mx-8 bg-gray-200 hidden md:block" />
          <Button
            variant="ghost"
            className="font-black text-sm uppercase tracking-widest text-gray-500 hover:text-black"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {electronicsItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-[2rem] p-4 border border-gray-100 hover:border-vayva-green/30 hover:shadow-2xl hover:shadow-green-500/5 transition-all duration-500"
            >
              <div className="aspect-[16/10] bg-gray-50 rounded-[1.5rem] mb-6 overflow-hidden relative">
                <img
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  src={item.image || (item as any).images?.[0] || ""}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4">
                  <div className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {/* In Stock */}
                  </div>
                </div>
              </div>

              <div className="px-2 space-y-4">
                <div>
                  <h3 className="text-xl font-black mb-1 group-hover:text-vayva-green transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {typeof (item.metadata as { specs?: unknown } | undefined)?.specs === "string"
                      ? (item.metadata as { specs?: string }).specs
                      : ""}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      Price
                    </span>
                    <span className="text-2xl font-black text-black">
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>
                  <Button
                    onClick={() =>
                      addToCart({ ...item, quantity: 1, productId: item.id })
                    }
                    className="bg-black text-white hover:bg-vayva-green hover:text-black w-14 h-14 rounded-2xl transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-green-500/20"
                  >
                    <Icon name="Plus" size={24} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Specs */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <Icon name="Cpu" size={32} />
              <span className="font-black text-sm uppercase tracking-widest">
                Authentic Components
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="Zap" size={32} />
              <span className="font-black text-sm uppercase tracking-widest">
                Express Shipping
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="ShieldCheck" size={32} />
              <span className="font-black text-sm uppercase tracking-widest">
                Global Warranty
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
