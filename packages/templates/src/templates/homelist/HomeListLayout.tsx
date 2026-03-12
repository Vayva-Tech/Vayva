import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { PublicStore, PublicProduct } from "@vayva/templates/types/storefront";
import { RealEstateHeader } from "./components/RealEstateHeader";
import { HeroSearch } from "./components/HeroSearch";
import { ListingCard } from "./components/ListingCard";
import { ViewingModal } from "./components/ViewingModal";

interface HomeListLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const HomeListLayout = ({ store, products }: HomeListLayoutProps): React.JSX.Element => {
  const [viewingListing, setViewingListing] = useState<PublicProduct | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 font-inter">
      <RealEstateHeader
        storeName={store.name}
        contactPhone={store.contact?.phone}
      />

      <main>
        <HeroSearch />

        {/* Featured Listings */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[#2563EB] font-bold uppercase tracking-wider text-xs mb-2 block">
                Latest Properties
              </span>
              <h2 className="text-3xl font-black text-[#0F172A]">
                Featured Listings
              </h2>
            </div>
            <Button className="hidden md:block text-sm font-bold text-gray-500 hover:text-[#2563EB]">
              View All Properties
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {products.map((product: any) => (
              <ListingCard
                key={product.id}
                product={product}
                onViewClick={() => setViewingListing(product)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-transparent border border-gray-200 hover:border-[#2563EB] text-[#0F172A] hover:text-[#2563EB] px-8 py-3 rounded-lg font-bold transition-all md:hidden">
              View All Properties
            </Button>
          </div>
        </section>

        {/* Cities / Locations Tile (Test) */}
        <section className="bg-transparent py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-8">
              Browse by Location
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[300px]">
              <div className="col-span-1 md:col-span-2 bg-background/50 backdrop-blur-sm rounded-2xl relative overflow-hidden group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1577086664693-8945534a253d?auto=format&fit=crop&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                <span className="absolute bottom-6 left-6 text-white font-bold text-xl">
                  Lekki Phase 1
                </span>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-2xl relative overflow-hidden group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1596162953282-5953041a024e?auto=format&fit=crop&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                <span className="absolute bottom-6 left-6 text-white font-bold text-lg">
                  Ikoyi
                </span>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-2xl relative overflow-hidden group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1628155990264-b97c88e99496?auto=format&fit=crop&q=80"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                <span className="absolute bottom-6 left-6 text-white font-bold text-lg">
                  Abuja
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0F172A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">{store.name}</h3>
            <p className="text-gray-400 text-sm">
              Helping you find the perfect place to call home.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Properties</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  For Sale
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  For Rent
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Shortlets
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-sm text-gray-400 mb-2">{store.contact?.phone}</p>
            <p className="text-sm text-gray-400">{store.contact?.email}</p>
          </div>
        </div>
      </footer>

      <ViewingModal
        isOpen={!!viewingListing}
        onClose={() => setViewingListing(null)}
        listingTitle={viewingListing?.name || ""}
      />
    </div>
  );
};
