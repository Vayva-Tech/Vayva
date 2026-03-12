"use client";

import { Palette, Brush, Camera, PenTool, ArrowRight, Instagram, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

const works = [
  { title: "Brand Identity", category: "Branding", color: "bg-orange-200" },
  { title: "Web Design", category: "UI/UX", color: "bg-blue-200" },
  { title: "Illustration", category: "Digital Art", color: "bg-green-200" },
  { title: "Photography", category: "Photo", color: "bg-purple-200" },
];

const services = [
  { icon: Palette, title: "Brand Design", desc: "Logo & identity" },
  { icon: Brush, title: "Illustration", desc: "Custom artwork" },
  { icon: Camera, title: "Photography", desc: "Product shoots" },
  { icon: PenTool, title: "UI/UX Design", desc: "Web & mobile" },
];

export default function ArtistryHome() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Palette className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Artistry</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/work" className="text-gray-700 hover:text-primary-600">Work</Link>
              <Link href="/services" className="text-gray-700 hover:text-primary-600">Services</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600">Contact</Link>
            </div>
            <Link href="/hire" className="btn-primary">Hire Me</Link>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Creative <span className="text-primary-600">Designer</span> & Artist
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Crafting beautiful brands and digital experiences
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/work" className="btn-primary">View Work</Link>
              <Link href="/contact" className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50">Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Work</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {works.map((work) => (
              <div key={work.title} className={`${work.color} rounded-2xl p-8 aspect-square flex flex-col justify-end hover:shadow-lg transition-shadow cursor-pointer`}>
                <span className="text-sm font-medium text-gray-600 mb-2">{work.category}</span>
                <h3 className="text-2xl font-bold text-gray-900">{work.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <div key={s.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-dark-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Palette className="w-8 h-8 text-primary-600" />
              <span className="text-white font-bold text-xl">Artistry</span>
            </div>
            <div className="flex items-center gap-6">
              <Instagram className="w-6 h-6 hover:text-white cursor-pointer" />
              <Twitter className="w-6 h-6 hover:text-white cursor-pointer" />
              <Linkedin className="w-6 h-6 hover:text-white cursor-pointer" />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2024 Artistry. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
