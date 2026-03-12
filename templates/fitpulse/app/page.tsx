"use client";

import { Dumbbell, Users, Calendar, Trophy, ArrowRight, Star, MapPin, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const classes = [
  { name: "HIIT Training", time: "45 min", level: "Advanced", icon: "🔥" },
  { name: "Yoga Flow", time: "60 min", level: "All Levels", icon: "🧘" },
  { name: "Strength", time: "50 min", level: "Intermediate", icon: "💪" },
  { name: "Spin Class", time: "45 min", level: "All Levels", icon: "🚴" },
  { name: "Boxing", time: "60 min", level: "Advanced", icon: "🥊" },
  { name: "Pilates", time: "50 min", level: "Beginner", icon: "🤸" },
];

const trainers = [
  { id: 1, name: "Alex Rivera", specialty: "HIIT & Cardio", exp: "8 years", image: "bg-gradient-to-br from-orange-100 to-red-100" },
  { id: 2, name: "Sarah Chen", specialty: "Yoga & Pilates", exp: "12 years", image: "bg-gradient-to-br from-purple-100 to-pink-100" },
  { id: 3, name: "Mike Johnson", specialty: "Strength Coach", exp: "15 years", image: "bg-gradient-to-br from-blue-100 to-cyan-100" },
  { id: 4, name: "Emma Davis", specialty: "Boxing", exp: "6 years", image: "bg-gradient-to-br from-green-100 to-emerald-100" },
];

const stats = [
  { value: "5K+", label: "Active Members" },
  { value: "50+", label: "Daily Classes" },
  { value: "25", label: "Expert Trainers" },
  { value: "15K+", label: "Workouts Completed" },
];

const features = [
  { icon: Dumbbell, title: "Modern Equipment", desc: "State-of-the-art machines" },
  { icon: Users, title: "Group Classes", desc: "Fun, motivating sessions" },
  { icon: Calendar, title: "Flexible Schedule", desc: "Classes all day long" },
  { icon: Trophy, title: "Goal Tracking", desc: "Monitor your progress" },
];

export default function FitPulseHome() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="bg-dark-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FitPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/classes" className="text-gray-400 hover:text-white transition-colors">Classes</Link>
              <Link href="/trainers" className="text-gray-400 hover:text-white transition-colors">Trainers</Link>
              <Link href="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
              <Link href="/membership" className="btn-primary">Join Now</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary-600/20 text-primary-500 rounded-full text-sm font-medium mb-4">Transform Your Life</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Unleash Your <span className="text-primary-500">Inner Strength</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Premium fitness facilities with world-class trainers and cutting-edge equipment
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/membership" className="btn-primary">Start Free Trial</Link>
                <Link href="/classes" className="px-8 py-3 bg-transparent text-white font-medium rounded-lg border border-white/30 hover:bg-white/10 transition-colors">View Classes</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">15K+</div>
                    <div className="text-gray-400">Workouts Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Classes</h2>
            <p className="text-gray-400">Diverse workouts for every fitness level and goal</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.name} className="p-6 bg-dark-800 rounded-2xl hover:bg-dark-800/80 hover:border-primary-600/50 border border-gray-800 transition-all group">
                <span className="text-4xl mb-4 block">{cls.icon}</span>
                <h3 className="font-semibold text-lg text-white mb-2">{cls.name}</h3>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.time}</span>
                  <span>{cls.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section className="section-padding bg-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Expert Trainers</h2>
            <Link href="/trainers" className="text-primary-500 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-dark-900 rounded-2xl overflow-hidden border border-gray-800 group hover:border-primary-600/50 transition-all">
                <div className={`h-48 ${trainer.image}`} />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-white">{trainer.name}</h3>
                  <p className="text-primary-500">{trainer.specialty}</p>
                  <p className="text-gray-500 text-sm">{trainer.exp} experience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose FitPulse</h2>
            <p className="text-gray-400">Everything you need to achieve your fitness goals</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform?</h2>
          <p className="text-white/80 mb-8">Start your fitness journey today with a free trial</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/membership" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">FitPulse</span>
              </div>
              <p className="text-sm">Transform your body and mind with our premium fitness experience.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/classes" className="hover:text-white">Classes</Link></li>
                <li><Link href="/trainers" className="hover:text-white">Trainers</Link></li>
                <li><Link href="/membership" className="hover:text-white">Membership</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 123 Fitness Ave</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Open 24/7</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-sm">
                <li>Mon-Sun: 24 Hours</li>
                <li>Classes: 6AM - 10PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 FitPulse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
