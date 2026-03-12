"use client";

import { Play, Code, Terminal, BookOpen, ArrowRight, CheckCircle, Trophy, Users } from "lucide-react";
import Link from "next/link";

const tracks = [
  { name: "Web Development", courses: 12, level: "Beginner to Advanced", icon: Code },
  { name: "Data Science", courses: 8, level: "Intermediate", icon: Terminal },
  { name: "Mobile Development", courses: 6, level: "Beginner", icon: BookOpen },
];

const features = [
  "Interactive coding environment",
  "Real-time code validation",
  "Project-based learning",
  "Peer code reviews",
  "Industry mentor support",
  "Job placement assistance",
];

export default function CodeCampHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">CodeCamp</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/tracks" className="text-muted-foreground hover:text-foreground transition-colors">Tracks</Link>
              <Link href="/tutorials" className="text-muted-foreground hover:text-foreground transition-colors">Tutorials</Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Start Coding</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Learn to Code.<br />
                <span className="text-primary">Build Your Future.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Interactive coding bootcamp with hands-on projects, real-time feedback, and industry mentorship.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/signup" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors inline-flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors inline-flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Cancel anytime
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-card rounded-xl p-6 border font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2">main.js</span>
                </div>
                <pre className="text-foreground">
                  <span className="text-purple-500">function</span>{" "}
                  <span className="text-yellow-500">greet</span>
                  <span className="text-foreground">(</span>
                  <span className="text-orange-500">name</span>
                  <span className="text-foreground">) {"{"}</span>
                  {"\n"}  <span className="text-purple-500">return</span>{" "}
                  <span className="text-green-500">&ldquo;Hello, &ldquo;</span>{" "}
                  <span className="text-foreground">+</span>{" "}
                  <span className="text-orange-500">name</span>
                  <span className="text-foreground">;</span>
                  {"\n"}
                  <span className="text-foreground">{"}"}</span>
                  {"\n"}
                  {"\n"}
                  <span className="text-yellow-500">greet</span>
                  <span className="text-foreground">(</span>
                  <span className="text-green-500">&ldquo;Developer&ldquo;</span>
                  <span className="text-foreground">);</span>
                  {"\n"}
                  <span className="text-muted-foreground">// Output: Hello, Developer</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="section-padding bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Learning Tracks</h2>
            <p className="text-muted-foreground">Choose your path and start coding</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <div key={track.name} className="bg-card rounded-xl p-6 border hover:border-primary transition-colors">
                <track.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{track.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{track.level}</p>
                <p className="text-sm text-muted-foreground">{track.courses} courses</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Why CodeCamp?</h2>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-6 text-center border">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Graduates</div>
              </div>
              <div className="bg-card rounded-xl p-6 text-center border">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">200+</div>
                <div className="text-sm text-muted-foreground">Mentors</div>
              </div>
              <div className="bg-card rounded-xl p-6 text-center border">
                <Code className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Tutorials</div>
              </div>
              <div className="bg-card rounded-xl p-6 text-center border">
                <Terminal className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">1M+</div>
                <div className="text-sm text-muted-foreground">Code Runs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Start Coding?</h2>
          <p className="text-primary-foreground/80 mb-8">Join 50,000+ developers who started their journey with CodeCamp</p>
          <Link href="/auth/signup" className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2024 CodeCamp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
