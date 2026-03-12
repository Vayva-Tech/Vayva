"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowRight, Scale, Users, Clock, Award, Phone, Mail, Calendar, FileText, Shield, Star } from "lucide-react";
import { useState } from "react";

// Mock data that would come from @vayva/industry-services in real implementation
const practiceAreas = [
  {
    id: "family",
    name: "Family Law",
    description: "Divorce, child custody, adoption, and domestic relations matters.",
    price: 250000,
    icon: <Users className="h-8 w-8" />
  },
  {
    id: "criminal",
    name: "Criminal Defense",
    description: "Defense against criminal charges and representation in court proceedings.",
    price: 300000,
    icon: <Shield className="h-8 w-8" />
  },
  {
    id: "business",
    name: "Business Law",
    description: "Corporate formation, contracts, mergers, and commercial disputes.",
    price: 350000,
    icon: <Scale className="h-8 w-8" />
  },
  {
    id: "real-estate",
    name: "Real Estate Law",
    description: "Property transactions, title issues, and landlord-tenant disputes.",
    price: 200000,
    icon: <FileText className="h-8 w-8" />
  },
  {
    id: "personal-injury",
    name: "Personal Injury",
    description: "Compensation claims for accidents, negligence, and wrongful acts.",
    price: 275000,
    icon: <Award className="h-8 w-8" />
  },
  {
    id: "immigration",
    name: "Immigration Law",
    description: "Visas, citizenship, deportation defense, and immigration appeals.",
    price: 400000,
    icon: <Users className="h-8 w-8" />
  }
];

const attorneys = [
  {
    id: "1",
    name: "James Mitchell",
    specialty: "Senior Partner - Criminal Defense",
    rating: 4.9,
    reviews: 243,
    experience: "15 years",
    image: "bg-gradient-to-br from-blue-100 to-indigo-100"
  },
  {
    id: "2",
    name: "Sarah Thompson",
    specialty: "Family Law Specialist",
    rating: 5.0,
    reviews: 187,
    experience: "12 years",
    image: "bg-gradient-to-br from-pink-100 to-rose-100"
  },
  {
    id: "3",
    name: "Robert Johnson",
    specialty: "Business & Corporate Law",
    rating: 4.8,
    reviews: 156,
    experience: "18 years",
    image: "bg-gradient-to-br from-green-100 to-emerald-100"
  }
];

export default function HomePage() {
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string | null>(null);
  const [consultationForm, setConsultationForm] = useState({
    name: "",
    email: "",
    phone: "",
    caseType: "",
    urgency: "normal",
    description: ""
  });

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would integrate with @vayva/industry-services case management service
    console.log("Consultation request:", { ...consultationForm, practiceArea: selectedPracticeArea });
    alert("Consultation request submitted! We'll contact you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Scale className="h-8 w-8" />
            LEGALPARTNERS
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/practice-areas" className="text-sm font-medium hover:text-blue-700">
              Practice Areas
            </Link>
            <Link href="/attorneys" className="text-sm font-medium hover:text-blue-700">
              Our Attorneys
            </Link>
            <Link href="/resources" className="text-sm font-medium hover:text-blue-700">
              Resources
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-blue-700">
              About
            </Link>
          </nav>
          <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
            Free Consultation
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 to-indigo-900 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-blue-300 font-medium mb-4 uppercase tracking-wider">Trusted Legal Representation</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Justice You Can Count On
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Experienced attorneys dedicated to protecting your rights and achieving the best possible outcome for your case.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="#practice-areas">Our Practice Areas</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="#consultation">Free Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-700">5000+</p>
              <p className="text-sm text-gray-600">Cases Won</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700">200+</p>
              <p className="text-sm text-gray-600">Expert Attorneys</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700">25+</p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700">98%</p>
              <p className="text-sm text-gray-600">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      <section id="practice-areas" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Practice Areas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive legal services across multiple areas of law
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {practiceAreas.map((area) => (
              <PracticeAreaCard 
                key={area.id}
                area={area}
                onSelect={() => setSelectedPracticeArea(area.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Free Consultation */}
      <section id="consultation" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Free Legal Consultation</h2>
              <p className="text-gray-600">
                Speak with an experienced attorney today - no obligation
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleConsultationSubmit} className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={consultationForm.name}
                    onChange={(e) => setConsultationForm({...consultationForm, name: e.target.value})}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={consultationForm.email}
                    onChange={(e) => setConsultationForm({...consultationForm, email: e.target.value})}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={consultationForm.phone}
                    onChange={(e) => setConsultationForm({...consultationForm, phone: e.target.value})}
                    placeholder="+234 801 234 5678"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Area
                  </label>
                  <select
                    value={selectedPracticeArea || ""}
                    onChange={(e) => setSelectedPracticeArea(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select practice area</option>
                    {practiceAreas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={consultationForm.urgency}
                    onChange={(e) => setConsultationForm({...consultationForm, urgency: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">Normal - Within 48 hours</option>
                    <option value="urgent">Urgent - Within 24 hours</option>
                    <option value="emergency">Emergency - Immediate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type
                  </label>
                  <Input
                    value={consultationForm.caseType}
                    onChange={(e) => setConsultationForm({...consultationForm, caseType: e.target.value})}
                    placeholder="Brief description of your case"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Details
                  </label>
                  <textarea
                    value={consultationForm.description}
                    onChange={(e) => setConsultationForm({...consultationForm, description: e.target.value})}
                    placeholder="Provide more details about your legal matter..."
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-700 hover:bg-blue-800 py-3 text-lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Free Consultation
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Confidential consultation - No fees or obligations
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Attorneys */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Attorneys</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experienced legal professionals ready to fight for your rights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {attorneys.map((attorney) => (
              <div key={attorney.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center">
                <div className={`w-24 h-24 ${attorney.image} rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-gray-700`}>
                  {attorney.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold mb-1">{attorney.name}</h3>
                <p className="text-blue-700 mb-2">{attorney.specialty}</p>
                <p className="text-gray-500 text-sm mb-3">{attorney.experience} experience</p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{attorney.rating}</span>
                  <span className="text-gray-500">({attorney.reviews} reviews)</span>
                </div>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose LegalPartners</h2>
              <p className="text-gray-600">
                We combine experience, dedication, and innovation to deliver exceptional legal services
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  {
                    icon: <Scale className="h-6 w-6" />,
                    title: "Proven Track Record",
                    description: "Thousands of successful cases and satisfied clients nationwide"
                  },
                  {
                    icon: <Shield className="h-6 w-6" />,
                    title: "Confidential & Secure",
                    description: "Your privacy is our priority with military-grade security measures"
                  },
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Responsive Communication",
                    description: "Direct access to your attorney with 24/7 case updates"
                  },
                  {
                    icon: <Award className="h-6 w-6" />,
                    title: "Transparent Pricing",
                    description: "Clear fee structures with no hidden costs or surprise bills"
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-6">Client Testimonials</h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-700 pl-4">
                    <p className="text-gray-700 italic mb-2">
                      "The team at LegalPartners helped me navigate a complex business dispute. Their expertise and dedication resulted in a favorable settlement that saved my company hundreds of thousands of dollars."
                    </p>
                    <p className="font-semibold">- Michael T., CEO</p>
                  </div>
                  <div className="border-l-4 border-blue-700 pl-4">
                    <p className="text-gray-700 italic mb-2">
                      "During my difficult divorce proceedings, Sarah provided compassionate yet fierce representation. She secured custody arrangements that prioritized my children's wellbeing."
                    </p>
                    <p className="font-semibold">- Jennifer K., Client</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PracticeAreaCard({ area, onSelect }: { area: any; onSelect: () => void }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border group">
      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-700 group-hover:text-white transition-colors">
        {area.icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{area.name}</h3>
      <p className="text-gray-600 mb-4 text-sm">{area.description}</p>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-blue-700">₦{(area.price / 100).toFixed(0)}</p>
        <span className="text-sm text-gray-500">Starting rate</span>
      </div>
      <Button 
        onClick={onSelect}
        className="w-full mt-4 bg-blue-700 hover:bg-blue-800"
      >
        Consult Attorney
      </Button>
    </div>
  );
}