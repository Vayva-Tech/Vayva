"use client";

import { Stethoscope, Calendar, User, Clock, Star, MapPin, Phone, Mail, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Williams",
    specialty: "Cardiology",
    rating: 4.9,
    reviews: 234,
    image: "👩‍⚕️",
    available: "Today",
    nextSlot: "2:30 PM",
    experience: "15 years",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Pediatrics",
    rating: 4.8,
    reviews: 189,
    image: "👨‍⚕️",
    available: "Tomorrow",
    nextSlot: "9:00 AM",
    experience: "12 years",
  },
  {
    id: 3,
    name: "Dr. Emily Davis",
    specialty: "Dermatology",
    rating: 4.9,
    reviews: 156,
    image: "👩‍⚕️",
    available: "Today",
    nextSlot: "4:00 PM",
    experience: "10 years",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    rating: 4.7,
    reviews: 203,
    image: "👨‍⚕️",
    available: "Today",
    nextSlot: "11:30 AM",
    experience: "18 years",
  },
];

const specialties = [
  "All",
  "Cardiology",
  "Pediatrics",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Gynecology",
];

export default function DoctorsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Medicare</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/doctors" className="text-teal-600 font-medium">Find Doctors</Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/patient-portal" className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
              Patient Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Find a Doctor</h1>
          <p className="text-xl text-teal-100 mb-8">
            Book appointments with top healthcare professionals
          </p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <button className="px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800">
              Search
            </button>
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
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center text-6xl">
                {doctor.image}
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900">{doctor.name}</h3>
                <p className="text-teal-600 mb-2">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mb-3">{doctor.experience} experience</p>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{doctor.rating}</span>
                  <span className="text-gray-500 text-sm">({doctor.reviews} reviews)</span>
                </div>
                <div className={`text-sm mb-4 ${doctor.available === "Today" ? "text-green-600" : "text-gray-500"}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  {doctor.available === "Today" ? "Available today" : `Next: ${doctor.available}`} • {doctor.nextSlot}
                </div>
                <button className="w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
