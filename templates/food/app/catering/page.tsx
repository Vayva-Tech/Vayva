"use client";

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Utensils, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function CateringPage() {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    guestCount: '',
    date: '',
    time: '',
    location: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    specialRequests: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would submit to an API
    console.log('Catering request submitted:', formData);
    alert('Thank you! We\'ll contact you within 24 hours to discuss your catering needs.');
  };

  const cateringPackages = [
    {
      name: "Basic Package",
      price: "₦15,000",
      perPerson: true,
      features: [
        "Main dish selection",
        "Two side dishes",
        "Basic setup and serving",
        "Disposable plates and utensils"
      ]
    },
    {
      name: "Premium Package",
      price: "₦25,000",
      perPerson: true,
      features: [
        "Main dish selection",
        "Three side dishes",
        "Professional setup",
        "Reusable plates and utensils",
        "Basic decoration"
      ]
    },
    {
      name: "VIP Package",
      price: "₦40,000",
      perPerson: true,
      features: [
        "Custom menu planning",
        "Unlimited side dishes",
        "Full-service staff",
        "Premium tableware",
        "Complete decoration",
        "Cleanup service"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            FLAVOR
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/menu" className="text-sm font-medium hover:text-orange-600">
              Menu
            </Link>
            <Link href="/deals" className="text-sm font-medium hover:text-orange-600">
              Deals
            </Link>
            <Link href="/catering" className="text-sm font-medium hover:text-orange-600 text-orange-600">
              Catering
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Utensils className="h-16 w-16 mx-auto mb-6 text-orange-200" />
          <h1 className="text-5xl font-bold mb-6">Professional Catering Services</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Make your event unforgettable with our professional catering services. 
            From corporate meetings to weddings, we deliver exceptional food and service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
              <Link href="#packages">View Packages</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="#contact">Get Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Catering?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12 text-orange-500" />,
                title: "Expert Chefs",
                description: "Professional culinary team with years of experience"
              },
              {
                icon: <Clock className="h-12 w-12 text-orange-500" />,
                title: "On-Time Service",
                description: "Reliable delivery and setup within your timeline"
              },
              {
                icon: <Utensils className="h-12 w-12 text-orange-500" />,
                title: "Quality Ingredients",
                description: "Fresh, locally-sourced ingredients for the best taste"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Catering Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cateringPackages.map((pkg, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-orange-600">{pkg.price}</span>
                    {pkg.perPerson && <span className="text-gray-600">/person</span>}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, featIndex) => (
                      <li key={featIndex} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                    <Link href="#contact">Get Quote</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">We Cater All Occasions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Weddings", "Corporate Events", "Birthday Parties", 
              "Baby Showers", "Graduations", "Anniversaries", 
              "Meetings", "Social Gatherings"
            ].map((eventType, index) => (
              <div key={index} className="bg-orange-50 p-6 rounded-lg text-center hover:bg-orange-100 transition-colors">
                <div className="text-orange-600 font-semibold">{eventType}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Get Your Custom Quote</h2>
            <p className="text-center text-orange-100 mb-12">
              Tell us about your event and we'll create a personalized catering proposal
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Name *</label>
                  <Input
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="Corporate Lunch Meeting"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Event Type *</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-md bg-white/20 border border-white/30 text-white"
                  >
                    <option value="" className="text-gray-800">Select event type</option>
                    <option value="wedding" className="text-gray-800">Wedding</option>
                    <option value="corporate" className="text-gray-800">Corporate Event</option>
                    <option value="birthday" className="text-gray-800">Birthday Party</option>
                    <option value="other" className="text-gray-800">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Guest Count *</label>
                  <Input
                    name="guestCount"
                    type="number"
                    value={formData.guestCount}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Time *</label>
                  <Input
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="Event venue address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name *</label>
                  <Input
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <Input
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <Input
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="+234 801 234 5678"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Special Requests</label>
                  <Textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="bg-white/20 border-white/30 text-white placeholder-white/70"
                    placeholder="Any dietary restrictions, special menu requests, or other requirements..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-white text-orange-600 hover:bg-orange-50"
                  >
                    Submit Catering Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">+234 801 234 5678</p>
            </div>
            <div>
              <Mail className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">catering@flavor.ng</p>
            </div>
            <div>
              <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Food Street, Lagos</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}