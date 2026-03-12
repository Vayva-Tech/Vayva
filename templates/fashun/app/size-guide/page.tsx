"use client";

import { Search, ShoppingBag, Heart, User, Menu, Ruler, Info, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sizeCharts = {
  women: {
    tops: [
      { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35" },
      { size: "S", bust: "34-35", waist: "26-27", hip: "36-37" },
      { size: "M", bust: "36-37", waist: "28-29", hip: "38-39" },
      { size: "L", bust: "38-40", waist: "30-32", hip: "40-42" },
      { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45" },
      { size: "XXL", bust: "44-46", waist: "36-38", hip: "46-48" },
    ],
    bottoms: [
      { size: "XS", waist: "24-25", hip: "34-35", inseam: "30" },
      { size: "S", waist: "26-27", hip: "36-37", inseam: "30" },
      { size: "M", waist: "28-29", hip: "38-39", inseam: "30" },
      { size: "L", waist: "30-32", hip: "40-42", inseam: "30" },
      { size: "XL", waist: "33-35", hip: "43-45", inseam: "30" },
      { size: "XXL", waist: "36-38", hip: "46-48", inseam: "30" },
    ],
    dresses: [
      { size: "XS", bust: "32-33", waist: "24-25", hip: "34-35", length: "34" },
      { size: "S", bust: "34-35", waist: "26-27", hip: "36-37", length: "34" },
      { size: "M", bust: "36-37", waist: "28-29", hip: "38-39", length: "34" },
      { size: "L", bust: "38-40", waist: "30-32", hip: "40-42", length: "35" },
      { size: "XL", bust: "41-43", waist: "33-35", hip: "43-45", length: "35" },
      { size: "XXL", bust: "44-46", waist: "36-38", hip: "46-48", length: "36" },
    ],
  },
};

const measurementGuide = [
  {
    title: "Bust",
    description: "Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
    image: "📏",
  },
  {
    title: "Waist",
    description: "Measure around your natural waistline, the narrowest part of your torso.",
    image: "📐",
  },
  {
    title: "Hip",
    description: "Measure around the fullest part of your hips, about 8 inches below your waist.",
    image: "📏",
  },
  {
    title: "Inseam",
    description: "Measure from the crotch seam to the bottom of the leg.",
    image: "📐",
  },
];

export default function SizeGuidePage() {
  const [activeCategory, setActiveCategory] = useState<"tops" | "bottoms" | "dresses">("dresses");
  const [unit, setUnit] = useState<"inches" | "cm">("inches");

  const convertToCm = (value: string) => {
    if (value === "—") return "—";
    const range = value.split("-");
    if (range.length === 2) {
      const min = Math.round(parseInt(range[0]) * 2.54);
      const max = Math.round(parseInt(range[1]) * 2.54);
      return `${min}-${max}`;
    }
    return Math.round(parseInt(value) * 2.54).toString();
  };

  const displayValue = (value: string) => {
    return unit === "cm" ? convertToCm(value) : value;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="text-2xl font-bold tracking-tight">
                FASHUN
              </Link>
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
                <Link href="/new-arrivals" className="text-gray-600 hover:text-black">New Arrivals</Link>
                <Link href="/lookbook" className="text-gray-600 hover:text-black">Lookbook</Link>
                <Link href="/about" className="text-gray-600 hover:text-black">About</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/account">
                <User className="w-5 h-5" />
              </Link>
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Ruler className="w-6 h-6" />
            <span className="text-sm font-medium tracking-wider uppercase">Size Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Fit</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use our comprehensive size guide to ensure the perfect fit every time.
            All measurements are in inches.
          </p>
        </div>
      </section>

      {/* Size Chart */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {(["dresses", "tops", "bottoms"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium capitalize ${
                  activeCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setUnit("inches")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                unit === "inches" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                unit === "cm" ? "bg-white shadow-sm" : "text-gray-600"
              }`}
            >
              CM
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Size</th>
                {activeCategory === "tops" && (
                  <>
                    <th className="px-6 py-4 text-left font-semibold">Bust</th>
                    <th className="px-6 py-4 text-left font-semibold">Waist</th>
                    <th className="px-6 py-4 text-left font-semibold">Hip</th>
                  </>
                )}
                {activeCategory === "bottoms" && (
                  <>
                    <th className="px-6 py-4 text-left font-semibold">Waist</th>
                    <th className="px-6 py-4 text-left font-semibold">Hip</th>
                    <th className="px-6 py-4 text-left font-semibold">Inseam</th>
                  </>
                )}
                {activeCategory === "dresses" && (
                  <>
                    <th className="px-6 py-4 text-left font-semibold">Bust</th>
                    <th className="px-6 py-4 text-left font-semibold">Waist</th>
                    <th className="px-6 py-4 text-left font-semibold">Hip</th>
                    <th className="px-6 py-4 text-left font-semibold">Length</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sizeCharts.women[activeCategory].map((row, idx) => (
                <tr key={row.size} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-6 py-4 font-medium">{row.size}</td>
                  {activeCategory === "tops" && (
                    <>
                      <td className="px-6 py-4">{displayValue(row.bust)}"</td>
                      <td className="px-6 py-4">{displayValue(row.waist)}"</td>
                      <td className="px-6 py-4">{displayValue(row.hip)}"</td>
                    </>
                  )}
                  {activeCategory === "bottoms" && (
                    <>
                      <td className="px-6 py-4">{displayValue(row.waist)}"</td>
                      <td className="px-6 py-4">{displayValue(row.hip)}"</td>
                      <td className="px-6 py-4">{displayValue(row.inseam)}"</td>
                    </>
                  )}
                  {activeCategory === "dresses" && (
                    <>
                      <td className="px-6 py-4">{displayValue(row.bust)}"</td>
                      <td className="px-6 py-4">{displayValue(row.waist)}"</td>
                      <td className="px-6 py-4">{displayValue(row.hip)}"</td>
                      <td className="px-6 py-4">{displayValue(row.length)}"</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>
            Measurements refer to body size, not garment dimensions. 
            For the best fit, measure yourself and compare to the chart above.
          </span>
        </div>
      </section>

      {/* How to Measure */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How to Measure</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {measurementGuide.map((guide) => (
              <div key={guide.title} className="bg-white p-6 rounded-xl">
                <div className="text-4xl mb-4">{guide.image}</div>
                <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                <p className="text-gray-600 text-sm">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fit Tips */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Fit Tips</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Between Sizes?",
              description: "If you're between sizes, we recommend sizing up for a more comfortable fit, or down for a more fitted silhouette.",
              icon: "⚖️",
            },
            {
              title: "Fabric Matters",
              description: "Stretch fabrics offer more give and can accommodate a wider range of measurements. Check the fabric composition on each product page.",
              icon: "🧵",
            },
            {
              title: "Alterations",
              description: "We partner with local tailors to offer complimentary basic alterations on full-price items. Contact customer service for details.",
              icon: "✂️",
            },
          ].map((tip) => (
            <div key={tip.title} className="text-center">
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
              <p className="text-gray-600">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Size Conversion */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">International Size Conversion</h2>
          <div className="bg-white rounded-xl overflow-hidden border">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Fashun Size</th>
                  <th className="px-6 py-4 text-left font-semibold">US</th>
                  <th className="px-6 py-4 text-left font-semibold">UK</th>
                  <th className="px-6 py-4 text-left font-semibold">EU</th>
                  <th className="px-6 py-4 text-left font-semibold">IT</th>
                  <th className="px-6 py-4 text-left font-semibold">FR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { fashun: "XS", us: "0-2", uk: "4-6", eu: "32-34", it: "36-38", fr: "32-34" },
                  { fashun: "S", us: "4-6", uk: "8-10", eu: "36-38", it: "40-42", fr: "36-38" },
                  { fashun: "M", us: "8-10", uk: "12-14", eu: "40-42", it: "44-46", fr: "40-42" },
                  { fashun: "L", us: "12-14", uk: "16-18", eu: "44-46", it: "48-50", fr: "44-46" },
                  { fashun: "XL", us: "16-18", uk: "20-22", eu: "48-50", it: "52-54", fr: "48-50" },
                  { fashun: "XXL", us: "20-22", uk: "24-26", eu: "52-54", it: "56-58", fr: "52-54" },
                ].map((row, idx) => (
                  <tr key={row.fashun} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-6 py-4 font-medium">{row.fashun}</td>
                    <td className="px-6 py-4">{row.us}</td>
                    <td className="px-6 py-4">{row.uk}</td>
                    <td className="px-6 py-4">{row.eu}</td>
                    <td className="px-6 py-4">{row.it}</td>
                    <td className="px-6 py-4">{row.fr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What if my measurements fall between two sizes?",
              a: "We generally recommend sizing up for a more comfortable fit. However, consider the garment's fabric and intended fit. Check the product description for specific fit guidance.",
            },
            {
              q: "How do I measure myself accurately?",
              a: "Use a flexible measuring tape and measure while wearing thin undergarments. Keep the tape snug but not tight, and ensure it's parallel to the floor for horizontal measurements.",
            },
            {
              q: "Do your sizes run true to size?",
              a: "Our sizing follows standard US sizing. Each product page includes specific fit notes to help guide your decision. Customer reviews also often mention fit.",
            },
            {
              q: "Can I get items altered?",
              a: "Yes! We offer complimentary basic alterations on full-price items at select locations. Contact our customer service team to inquire about alteration services.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">SHOP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
                <li><Link href="/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
                <li><Link href="/sale" className="hover:text-white">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">HELP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/size-guide" className="hover:text-white">Size Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping & Returns</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">COMPANY</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">NEWSLETTER</h4>
              <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers</p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Fashun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
