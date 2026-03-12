"use client";

import { Play, BookOpen, Clock, Award, Users, Star, ChevronRight, CheckCircle, Code, Terminal, Database, Globe, Smartphone, Layers, Cpu, GitBranch } from "lucide-react";
import Link from "next/link";

const tracks = [
  {
    id: "web-dev",
    title: "Full-Stack Web Development",
    description: "Master modern web development from frontend to backend",
    courses: 24,
    hours: 180,
    level: "Beginner to Advanced",
    icon: Globe,
    color: "blue",
    skills: ["React", "Next.js", "Node.js", "PostgreSQL", "TypeScript"],
    students: 12500,
    rating: 4.9,
    image: "/tracks/web-dev.jpg"
  },
  {
    id: "data-science",
    title: "Data Science & AI",
    description: "Learn data analysis, machine learning, and AI applications",
    courses: 18,
    hours: 160,
    level: "Intermediate",
    icon: Database,
    color: "purple",
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn", "SQL"],
    students: 8900,
    rating: 4.8,
    image: "/tracks/data-science.jpg"
  },
  {
    id: "mobile-dev",
    title: "Mobile App Development",
    description: "Build native and cross-platform mobile applications",
    courses: 15,
    hours: 120,
    level: "Beginner to Intermediate",
    icon: Smartphone,
    color: "green",
    skills: ["React Native", "Swift", "Kotlin", "Flutter", "Firebase"],
    students: 6700,
    rating: 4.7,
    image: "/tracks/mobile-dev.jpg"
  },
  {
    id: "devops",
    title: "DevOps & Cloud Engineering",
    description: "Master deployment, CI/CD, and cloud infrastructure",
    courses: 12,
    hours: 100,
    level: "Advanced",
    icon: Layers,
    color: "orange",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
    students: 5400,
    rating: 4.9,
    image: "/tracks/devops.jpg"
  },
  {
    id: "ai-ml",
    title: "Machine Learning Engineering",
    description: "Deep dive into ML algorithms and MLOps practices",
    courses: 20,
    hours: 200,
    level: "Advanced",
    icon: Cpu,
    color: "pink",
    skills: ["PyTorch", "MLflow", "Kubeflow", "Spark", "Airflow"],
    students: 4200,
    rating: 4.8,
    image: "/tracks/ai-ml.jpg"
  },
  {
    id: "systems",
    title: "Systems Programming",
    description: "Low-level programming and system architecture",
    courses: 14,
    hours: 140,
    level: "Advanced",
    icon: Terminal,
    color: "gray",
    skills: ["C++", "Rust", "Go", "Linux", "Network Programming"],
    students: 3100,
    rating: 4.9,
    image: "/tracks/systems.jpg"
  }
];

const features = [
  {
    icon: Code,
    title: "Interactive Code Editor",
    description: "Write, run, and debug code directly in your browser with our powerful IDE"
  },
  {
    icon: Users,
    title: "Peer Code Reviews",
    description: "Get feedback from peers and mentors to improve your code quality"
  },
  {
    icon: Award,
    title: "Industry-Recognized Certificates",
    description: "Earn certificates that are valued by top tech companies worldwide"
  },
  {
    icon: GitBranch,
    title: "Real-World Projects",
    description: "Build portfolio-worthy projects using industry-standard tools and workflows"
  }
];

const stats = [
  { value: "50,000+", label: "Active Students" },
  { value: "500+", label: "Courses" },
  { value: "95%", label: "Job Placement Rate" },
  { value: "4.9/5", label: "Average Rating" }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content: "CodeCamp completely transformed my career. The project-based learning and mentor support helped me land my dream job.",
    avatar: "SC",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "Full-Stack Developer at Stripe",
    content: "The curriculum is incredibly well-structured. I went from knowing nothing about coding to building production apps in 6 months.",
    avatar: "MJ",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist at Netflix",
    content: "The data science track is comprehensive and practical. I use skills I learned here every day in my job.",
    avatar: "ER",
    rating: 5
  }
];

export default function TracksPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="border-b border-dark-700 bg-dark-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-500">CodeCamp</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/tracks" className="text-primary-500 font-medium">Tracks</Link>
              <Link href="/tutorials" className="text-gray-300 hover:text-white">Tutorials</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
              <Link href="/community" className="text-gray-300 hover:text-white">Community</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Learning <span className="text-primary-500">Tracks</span>
            </h1>
            <p className="text-xl text-gray-400">
              Choose your path and master in-demand tech skills with our comprehensive, project-based curriculum
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <div key={track.id} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden hover:border-primary-500/50 transition-colors group">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-${track.color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 text-${track.color}-500`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-white">{track.title}</h3>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{track.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{track.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {track.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-dark-700 text-gray-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {track.courses} courses
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {track.hours} hours
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {track.students.toLocaleString()} students
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{track.level}</span>
                      <Link 
                        href={`/tracks/${track.id}`}
                        className="inline-flex items-center gap-2 text-primary-500 font-medium hover:text-primary-400"
                      >
                        View Track
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose CodeCamp?
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to become a professional developer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-dark-900 border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="text-xl font-bold text-primary-500 mb-4 block">CodeCamp</span>
              <p className="text-gray-400 text-sm">Master coding skills with interactive, project-based learning.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Learning</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tracks" className="text-gray-400 hover:text-white">Tracks</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-white">Tutorials</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/community" className="text-gray-400 hover:text-white">Forum</Link></li>
                <li><Link href="/mentors" className="text-gray-400 hover:text-white">Mentors</Link></li>
                <li><Link href="/events" className="text-gray-400 hover:text-white">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-700 pt-8 text-center text-sm text-gray-400">
            © 2024 CodeCamp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
