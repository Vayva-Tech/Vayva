import { TemplateProps } from "@/components/templates/registry";
import { useStore } from "@/context/StoreContext";
import { Icon, Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";

export const SimpleRetailTemplate: React.FC<TemplateProps> = ({
  businessName,
  demoMode,
}) => {
  const {
    products,
    addToCart,
    cartTotal,
    itemCount,
    isCartOpen,
    toggleCart,
    checkout,
    isCheckoutProcessing,
    currency,
  } = useStore();

  // Demo Data Override for Simple Retail
  const retailProducts = demoMode
    ? [
        {
          id: "demo_1",
          name: "Polo Shirt",
          price: 7500,
          type: "retail",
          itemsSold: 20,
          isTodaysSpecial: true,
        },
        {
          id: "demo_2",
          name: "Handbag",
          price: 15000,
          type: "retail",
          itemsSold: 15,
        },
        {
          id: "demo_3",
          name: "Sneakers",
          price: 28000,
          type: "retail",
          itemsSold: 10,
        },
        {
          id: "demo_4",
          name: "Wristwatch",
          price: 12000,
          type: "retail",
          itemsSold: 5,
        },
      ]
    : products.filter((p: any) => p.type === "retail");

  // Featured Splice
  const featuredProducts = retailProducts.slice(0, 4);

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 pb-20">
      {/* Minimal Header */}
      <header className="py-6 px-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="font-bold text-xl tracking-tight">
          {businessName || "Store Name"}
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-auto w-auto p-2"
            onClick={() => toggleCart()}
          >
            <Icon name="ShoppingBag" size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {itemCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-auto w-auto p-2">
            <Icon name="Menu" size={24} />
          </Button>
        </div>
      </header>

      {/* Cart Drawer (Simple Inline for now) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Bag</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleCart(false)}
                className="h-auto w-auto p-0"
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {/* Cart Items would go here */}
              {itemCount === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  Your bag is empty.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    {itemCount} items ready for checkout.
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>{formatCurrency(cartTotal, currency)}</span>
              </div>
              <Button
                onClick={() => checkout("whatsapp")}
                disabled={isCheckoutProcessing || itemCount === 0}
                className="w-full bg-green-500 text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 h-auto"
              >
                {isCheckoutProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Icon name="MessageCircle" size={20} /> Checkout on WhatsApp
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-4 py-8 md:py-16">
        <div className="aspect-[4/3] md:aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden relative mb-8">
          <img
            src="https://images.unsplash?.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
            alt="Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white px-6">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                New Arrivals
              </h1>
              <Button className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors h-auto border-none">
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 pb-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold">Best Sellers</h2>
          <a href="#products" className="text-sm border-b border-black pb-0.5">
            View all
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
          {featuredProducts.map((product: any) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden mb-3 relative">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() =>
                      addToCart({
                        ...product,
                        quantity: 1,
                        productId: product.id,
                      })
                    }
                    className="bg-white text-black p-2 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors h-auto w-auto min-w-0"
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
                <img
                  src={
                    "https://placehold.co/600x800/f3f4f6/a1a1aa?text=" +
                    product.name?.split(" ")[0]
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={product.name}
                />
                {demoMode && product.isTodaysSpecial && (
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                    Special
                  </span>
                )}
              </div>
              <h3 className="font-medium text-sm text-gray-900 leading-snug line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm font-bold text-gray-500 mt-1">
                {formatCurrency(product.price, currency)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4 border-t border-gray-100">
        <div className="text-center">
          <div className="font-bold text-lg mb-2">{businessName}</div>
          <p className="text-gray-500 text-sm mb-6">Lagos, Nigeria</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <Icon name="Instagram" size={20} />
            <Icon name="Twitter" size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
};
