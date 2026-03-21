import { TemplateProps } from "@/components/templates/registry";
import { useStore } from "@/context/StoreContext";
import { Button, Icon, Input } from "@vayva/ui";
import React from "react";
import { formatCurrency } from "@vayva/shared";

interface AutoPartItem {
  id: string;
  name: string;
  price: number;
  type: string;
  condition: string;
  tags: string[];
  img: string;
  images?: string[];
  category?: string;
  searchTags?: string[];
}

export const AutoPartsTemplate: React.FC<TemplateProps> = ({
  businessName,
  demoMode,
}) => {
  const {
    products,
    addToCart,
    itemCount,
    checkout,
    isCheckoutProcessing,
    currency,
  } = useStore();

  const partItems = demoMode
    ? [
        {
          id: "ap_1",
          name: "Toyota Camry Engine (2009)",
          price: 450000,
          type: "retail",
          condition: "Tokunbo Grade A",
          tags: ["Warranty Included"],
          img: "https://images.unsplash?.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
        },
        {
          id: "ap_2",
          name: "Brake Pad",
          price: 18000,
          type: "retail",
          condition: "Brand New",
          tags: ["OEM"],
          img: "https://images.unsplash?.com/photo-1552176625-e47ff529b595?w=800&q=80",
        },
        {
          id: "ap_3",
          name: "Lexus RX350 Headlamp",
          price: 180000,
          type: "retail",
          condition: "Belgium Used",
          tags: [],
          img: "https://images.unsplash?.com/photo-1506469717960-433cebe3f181?w=800&q=80",
        },
      ]
    : (products as unknown as AutoPartItem[])
        .filter((p) => p.type === "retail")
        .map((p) => ({
          ...p,
          img: p.images?.[0] ||
            "https://images.unsplash?.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
          condition: p.category || "Used",
          tags: p.searchTags || [],
        }));

  return (
    <div className="font-sans min-h-screen bg-gray-50 text-gray-900 pb-20">
      <header className="bg-gray-900 text-white py-4 px-4 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-xl tracking-tight uppercase flex items-center gap-2">
            <span className="bg-red-600 px-2 py-1 rounded text-xs">PRO</span>
            {businessName || "Ladipo Auto Spares"}
          </div>
          {itemCount > 0 && (
            <div className="text-xs font-bold bg-white text-black px-2 py-1 rounded">
              Cart: {itemCount}
            </div>
          )}
        </div>
        <div className="relative">
          <Input type="text"
            placeholder="Search by Part Number, VIN, or Model..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
          />
          <Icon
            name="Search"
            size={20}
            className="absolute left-3 top-3.5 text-gray-400"
          />
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex px-4 py-3 gap-3 min-w-max">
          {[
            "Engine & Transmission",
            "Brakes",
            "Suspension",
            "Electrical",
            "Body Parts",
          ].map((cat) => (
            <Button
              key={cat}
              className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 border border-gray-200 whitespace-nowrap h-auto"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <section className="p-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
          New Arrivals (Tokunbo)
        </h2>

        {partItems.map((item: AutoPartItem) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-3 flex gap-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-md shrink-0 overflow-hidden relative">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.tags?.includes("Warranty Included") && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[8px] font-bold text-center py-0.5">
                  WARRANTY
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1 truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                    {item.condition || "Used"}
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-bold text-red-600 text-sm">
                  {formatCurrency(item.price, currency)}
                </span>
                <Button
                  onClick={() =>
                    addToCart({ ...item, quantity: 1, productId: item.id })
                  }
                  className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-green-600 h-auto"
                >
                  Select Part
                </Button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="px-4 py-8">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">
            <Icon name="MessageCircle" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-green-900 text-sm mb-1">
              Verify compatibility first!
            </h4>
            <p className="text-xs text-green-700 leading-relaxed mb-3">
              Send us your VIN or a picture of the part you need replaced before
              payment.
            </p>
            <Button
              onClick={() => checkout("whatsapp")}
              disabled={isCheckoutProcessing}
              className="bg-green-600 text-white w-full rounded-md py-2 font-bold text-xs hover:bg-green-700 transition-colors h-auto"
            >
              {itemCount > 0
                ? `Request Inspection for ${itemCount} Item(s)`
                : "Chat on WhatsApp"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
