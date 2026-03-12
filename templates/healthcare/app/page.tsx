"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Calendar, Clock, Shield, Phone, HeartPulse, UserPlus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-600 flex items-center gap-2">
            <HeartPulse className="h-6 w-6" />
            HEALTH+
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-sm font-medium hover:text-teal-600">
              Services
            </Link>
            <Link href="/doctors" className="text-sm font-medium hover:text-teal-600">
              Find a Doctor
            </Link>
            <Link href="/pharmacy" className="text-sm font-medium hover:text-teal-600">
              Pharmacy
            </Link>
            <Link href="/emergency" className="text-sm font-medium text-red-600 hover:text-red-700">
              Emergency
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-teal-50 to-cyan-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Trusted Healthcare Partner
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Health Is Our
                <span className="text-teal-600"> Priority</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Book appointments with top specialists, order medications, 
                and access quality healthcare services from the comfort of your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/book">Book Appointment</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/telemedicine">Video Consultation</Link>
                </Button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Find a Specialist</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input placeholder="Search doctors, clinics, specialties..." className="pl-10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="border rounded-md px-3 py-2 text-sm">
                    <option>Specialty</option>
                    <option>Cardiology</option>
                    <option>Dentistry</option>
                    <option>Dermatology</option>
                  </select>
                  <select className="border rounded-md px-3 py-2 text-sm">
                    <option>Location</option>
                    <option>Lagos</option>
                    <option>Abuja</option>
                    <option>Port Harcourt</option>
                  </select>
                </div>
                <Button className="w-full bg-teal-600 hover:bg-teal-700">Search</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ServiceCard
              icon={<Stethoscope className="h-8 w-8" />}
              title="General Practice"
              description="Comprehensive primary care for the whole family"
            />
            <ServiceCard
              icon={<Calendar className="h-8 w-8" />}
              title="Specialist Consultation"
              description="Expert care from board-certified specialists"
            />
            <ServiceCard
              icon={<Phone className="h-8 w-8" />}
              title="Telemedicine"
              description="Virtual consultations from anywhere"
            />
            <ServiceCard
              icon={<Clock className="h-8 w-8" />}
              title="24/7 Emergency"
              description="Round-the-clock emergency services"
            />
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-teal-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Top Doctors</h2>
              <p className="text-gray-600">Book appointments with verified specialists</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/doctors">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DoctorCard
              name="Dr. Sarah Johnson"
              specialty="Cardiologist"
              experience="15 years"
              rating={4.9}
              reviews={128}
            />
            <DoctorCard
              name="Dr. Michael Chen"
              specialty="Orthopedic Surgeon"
              experience="12 years"
              rating={4.8}
              reviews={96}
            />
            <DoctorCard
              name="Dr. Amina Bello"
              specialty="Pediatrician"
              experience="10 years"
              rating={5.0}
              reviews={156}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function DoctorCard({
  name,
  specialty,
  experience,
  rating,
  reviews,
}: {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-600">
          {name.split(" ")[1][0]}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-teal-600 text-sm">{specialty}</p>
          <p className="text-gray-500 text-sm">{experience} experience</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-500">★</span>
        <span className="font-semibold">{rating}</span>
        <span className="text-gray-500 text-sm">({reviews} reviews)</span>
      </div>
      <Button className="w-full bg-teal-600 hover:bg-teal-700">Book Appointment</Button>
    </div>
  );
}
