"use client";

import { Camera, Aperture, Focus, Image, Instagram, Facebook, Mail } from "lucide-react";
import Link from "next/link";

const galleries = [
  { title: "Weddings", count: "50+", color: "bg-rose-300" },
  { title: "Portraits", count: "200+", color: "bg-blue-300" },
  { title: "Nature", count: "150+", color: "bg-green-300" },
  { title: "Events", count: "80+", color: "bg-amber-300" },
];

const services = [
  { icon: Camera, title: "Photography", desc: "Professional shoots" },
  { icon: Aperture, title: "Editing", desc: "Photo retouching" },
  { icon: Focus, title: "Video", desc: "Cinematography" },
  { icon: Image, title: "Prints", desc: "Fine art prints" },
];

export default function PhotoFrameHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">PhotoFrame</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link>
              <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
            <Link href="/book" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Book Now</Link>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-muted/50 via-background to-accent/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Capturing <span className="text-primary">Life's</span> Moments
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional photography for every occasion
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/portfolio" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">View Portfolio</Link>
              <Link href="/contact" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Galleries</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleries.map((gallery) => (
              <div key={gallery.title} className={`${gallery.color} rounded-2xl p-6 aspect-square flex flex-col justify-end hover:shadow-lg transition-shadow cursor-pointer`}>
                <span className="text-sm font-medium text-gray-600">{gallery.count} Photos</span>
                <h3 className="text-2xl font-bold text-gray-900">{gallery.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <div key={s.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Camera className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl">PhotoFrame</span>
            </div>
            <div className="flex items-center gap-6">
              <Instagram className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Facebook className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Mail className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 PhotoFrame. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
