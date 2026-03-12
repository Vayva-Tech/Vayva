"use client";

import { Dumbbell, Star, Award, Users, Instagram, ArrowRight } from "lucide-react";
import Link from "next/link";

const trainers = [
  {
    id: 1,
    name: "Alex Rivera",
    specialty: "HIIT & Cardio",
    experience: "8 years",
    clients: 500,
    rating: 4.9,
    image: "🏋️",
    certifications: ["NASM-CPT", "CrossFit L2"],
  },
  {
    id: 2,
    name: "Sarah Chen",
    specialty: "Yoga & Pilates",
    experience: "10 years",
    clients: 750,
    rating: 4.9,
    image: "🧘",
    certifications: ["RYT-500", "Pilates Mat"],
  },
  {
    id: 3,
    name: "Mike Johnson",
    specialty: "Strength Training",
    experience: "12 years",
    clients: 600,
    rating: 4.8,
    image: "💪",
    certifications: ["NSCA-CSCS", "USAW"],
  },
  {
    id: 4,
    name: "Emma Davis",
    specialty: "Spin & Cycling",
    experience: "6 years",
    clients: 400,
    rating: 4.7,
    image: "🚴",
    certifications: ["Spinning", "ACE-CPT"],
  },
  {
    id: 5,
    name: "Carlos Martinez",
    specialty: "Boxing & MMA",
    experience: "15 years",
    clients: 350,
    rating: 4.9,
    image: "🥊",
    certifications: ["USAB", "NASM-MMA"],
  },
  {
    id: 6,
    name: "Lisa Wong",
    specialty: "Pilates & Barre",
    experience: "7 years",
    clients: 480,
    rating: 4.8,
    image: "🤸",
    certifications: ["STOTT Pilates", "Barre Above"],
  },
];

export default function TrainersPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FitPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/classes" className="text-gray-400 hover:text-white">Classes</Link>
              <Link href="/trainers" className="text-orange-500 font-medium">Trainers</Link>
              <Link href="/membership" className="text-gray-400 hover:text-white">Membership</Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            </div>
            <Link href="/membership" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-red-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Expert Trainers</h1>
          <p className="text-xl text-orange-100 mb-8">
            Learn from the best. Our certified trainers are here to help you reach your goals.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Trainers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
              <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-8xl">
                {trainer.image}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{trainer.name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {trainer.rating}
                  </div>
                </div>
                <p className="text-orange-400 font-medium mb-4">{trainer.specialty}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {trainer.experience}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {trainer.clients}+ clients
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {trainer.certifications.map((cert) => (
                    <span key={cert} className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
                <button className="w-full py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors">
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
