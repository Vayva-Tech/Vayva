"use client";

import { Building2, Users, Search, Filter, Star, MapPin, Phone, Mail, ChevronRight, Gavel, Scale, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const attorneys = [
  {
    id: 1,
    name: "Sarah Mitchell, Esq.",
    specialty: "Corporate Law",
    experience: "15 years",
    rating: 4.9,
    reviews: 127,
    image: "👩‍⚖️",
    education: "Harvard Law School",
    phone: "(555) 123-4567",
    email: "sarah@legalease.com",
  },
  {
    id: 2,
    name: "James Rodriguez, Esq.",
    specialty: "Criminal Defense",
    experience: "12 years",
    rating: 4.8,
    reviews: 98,
    image: "👨‍⚖️",
    education: "Yale Law School",
    phone: "(555) 234-5678",
    email: "james@legalease.com",
  },
  {
    id: 3,
    name: "Emily Chen, Esq.",
    specialty: "Family Law",
    experience: "10 years",
    rating: 4.9,
    reviews: 156,
    image: "👩‍⚖️",
    education: "Stanford Law School",
    phone: "(555) 345-6789",
    email: "emily@legalease.com",
  },
  {
    id: 4,
    name: "Michael Thompson, Esq.",
    specialty: "Intellectual Property",
    experience: "18 years",
    rating: 4.7,
    reviews: 89,
    image: "👨‍⚖️",
    education: "Columbia Law School",
    phone: "(555) 456-7890",
    email: "michael@legalease.com",
  },
];

const specialties = [
  "All",
  "Corporate Law",
  "Criminal Defense",
  "Family Law",
  "Intellectual Property",
  "Real Estate",
  "Immigration",
];

export default function AttorneysPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttorneys = attorneys.filter((attorney) => {
    const matchesSpecialty = selectedSpecialty === "All" || attorney.specialty === selectedSpecialty;
    const matchesSearch = attorney.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attorney.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Legalease</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/attorneys" className="text-indigo-600 font-medium">Attorneys</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/consultation" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Free Consultation
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Attorneys</h1>
          <p className="text-xl text-indigo-200 mb-8">
            Experienced legal professionals ready to help you
          </p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search attorneys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedSpecialty === specialty
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Attorneys Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAttorneys.map((attorney) => (
            <div key={attorney.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-6xl">
                {attorney.image}
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900">{attorney.name}</h3>
                <p className="text-indigo-600 mb-2">{attorney.specialty}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{attorney.rating}</span>
                  <span className="text-gray-500 text-sm">({attorney.reviews} reviews)</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">{attorney.education}</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {attorney.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {attorney.email}
                  </div>
                </div>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
