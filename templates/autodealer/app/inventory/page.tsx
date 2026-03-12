"use client";

import { Search, Filter, Grid3X3, List, Heart, Share2, Phone, MapPin, ChevronDown, Gauge, Calendar, Fuel, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const cars = [
  {
    id: 1,
    name: "Mercedes-Benz C-Class",
    year: 2023,
    price: 45200,
    mileage: 12000,
    fuel: "Petrol",
    transmission: "Automatic",
    image: "⭐",
    featured: true,
    condition: "Used",
    location: "San Francisco, CA",
  },
  {
    id: 2,
    name: "BMW 3 Series",
    year: 2023,
    price: 41900,
    mileage: 8500,
    fuel: "Diesel",
    transmission: "Automatic",
    image: "🔵",
    featured: false,
    condition: "New",
    location: "Los Angeles, CA",
  },
  {
    id: 3,
    name: "Audi A4",
    year: 2022,
    price: 38900,
    mileage: 15000,
    fuel: "Petrol",
    transmission: "Automatic",
    image: "⚪",
    featured: true,
    condition: "Used",
    location: "New York, NY",
  },
  {
    id: 4,
    name: "Toyota Camry",
    year: 2023,
    price: 28900,
    mileage: 5000,
    fuel: "Hybrid",
    transmission: "Automatic",
    image: "🔴",
    featured: false,
    condition: "New",
    location: "Chicago, IL",
  },
  {
    id: 5,
    name: "Honda Accord",
    year: 2022,
    price: 26500,
    mileage: 18000,
    fuel: "Petrol",
    transmission: "CVT",
    image: "🟢",
    featured: false,
    condition: "Used",
    location: "Miami, FL",
  },
  {
    id: 6,
    name: "Ford Mustang",
    year: 2023,
    price: 42500,
    mileage: 3000,
    fuel: "Petrol",
    transmission: "Manual",
    image: "🔷",
    featured: true,
    condition: "New",
    location: "Dallas, TX",
  },
];

const filters = {
  make: ["All Makes", "Mercedes", "BMW", "Audi", "Toyota", "Honda", "Ford"],
  price: ["Any Price", "Under $30K", "$30K - $40K", "$40K - $50K", "Over $50K"],
  year: ["Any Year", "2024", "2023", "2022", "2021", "2020"],
  fuel: ["Any Fuel", "Petrol", "Diesel", "Hybrid", "Electric"],
};

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedCars, setSavedCars] = useState<number[]>([]);

  const toggleSave = (carId: number) => {
    setSavedCars(prev => 
      prev.includes(carId) ? prev.filter(id => id !== carId) : [...prev, carId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">AutoDealer</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/inventory" className="text-blue-600 font-medium">Inventory</Link>
              <Link href="/financing" className="text-gray-600 hover:text-gray-900">Financing</Link>
              <Link href="/sell" className="text-gray-600 hover:text-gray-900">Sell Your Car</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/contact" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Car Inventory</h1>
          <p className="text-gray-400">Find your perfect car from our selection of {cars.length}+ vehicles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cars..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            {Object.entries(filters).map(([key, options]) => (
              <div key={key} className="relative">
                <select className="w-full px-4 py-2 border rounded-lg appearance-none focus:outline-none focus:border-blue-500 capitalize">
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
              <span className="text-gray-600">{cars.length} cars found</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Car Grid */}
        <div className={`grid ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
          {cars.map((car) => (
            <div key={car.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all ${viewMode === "list" ? "flex" : ""}`}>
              <div className={`${viewMode === "list" ? "w-48" : "w-full"} h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl relative`}>
                {car.image}
                {car.featured && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                    FEATURED
                  </span>
                )}
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${
                  car.condition === "New" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                }`}>
                  {car.condition}
                </span>
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{car.name}</h3>
                    <p className="text-gray-500">{car.year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSave(car.id)}
                      className={`p-2 rounded-full ${savedCars.includes(car.id) ? "text-red-500 bg-red-50" : "text-gray-400 hover:bg-gray-100"}`}
                    >
                      <Heart className={`w-5 h-5 ${savedCars.includes(car.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-4">${car.price.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    {car.mileage.toLocaleString()} miles
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4" />
                    {car.fuel}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {car.transmission}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {car.location.split(",")[0]}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/car/${car.id}`}
                    className="flex-1 py-2 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
