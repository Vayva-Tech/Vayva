"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, Plane, MapPin, ChevronLeft, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TRAVEL_PACKAGES } from "@/lib/travel-config";

export default function TravelBookingPage() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  const selectedPackage = TRAVEL_PACKAGES.find(p => p.id === selectedPackageId);

  const handleBooking = async () => {
    if (!selectedPackage || !travelDate) return;
    setIsBooking(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    toast.success(`Booking confirmed! Total: ₦${(selectedPackage.price * (adults + children * 0.5)).toLocaleString()}`);
    setIsBooking(false);
    setSelectedPackageId(null);
    setTravelDate("");
    setAdults(2);
    setChildren(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Back
              </Link>
            </Button>
            <span className="text-xl font-bold text-foreground flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Book Your Trip
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plan Your Journey</h1>
          <p className="text-muted-foreground">Select a package and customize your travel experience</p>
        </div>

        <div className="grid gap-6">
          {TRAVEL_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl overflow-hidden border hover:shadow-lg transition-all ${
                selectedPackageId === pkg.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{pkg.image}</div>
                    <div>
                      <h3 className="text-xl font-bold">{pkg.title}</h3>
                      <p className="text-muted-foreground">{pkg.destination} • {pkg.duration} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₦{pkg.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">per person</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Highlights</h4>
                    <ul className="space-y-2">
                      {pkg.highlights.slice(0, 4).map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Includes</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.inclusions.map((inc, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {inc}
                        </span>
                      ))}
                    </div>
                    
                    <h4 className="font-semibold mb-3">Excludes</h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.exclusions.map((exc, idx) => (
                        <span key={idx} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          {exc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      Easy
                    </span>
                    <span className="text-muted-foreground text-sm">•</span>
                    <span className="text-sm text-muted-foreground">All-inclusive experience</span>
                  </div>
                  
                  <Button
                    variant={selectedPackageId === pkg.id ? "default" : "outline"}
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    {selectedPackageId === pkg.id ? "Selected" : "Select Package"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPackage && (
          <div className="mt-8 p-6 bg-card rounded-2xl border">
            <h3 className="text-xl font-bold mb-6">Customize Your Booking</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Travel Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={travelDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg border-0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Adults</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdults(Math(1, adults - 1))}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{adults}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdults(adults + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Children</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{children}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChildren(children + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <span>Package Price:</span>
                <span className="font-semibold">₦{selectedPackage.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span>Travelers:</span>
                <span>{adults + children} ({adults} adults, {children} children)</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold pt-4 border-t">
                <span>Total:</span>
                <span className="text-primary">
                  ₦{(selectedPackage.price * (adults + children * 0.5)).toLocaleString()}
                </span>
              </div>
              
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleBooking}
                disabled={isBooking || !travelDate}
              >
                {isBooking ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}