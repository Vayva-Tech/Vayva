"use client";

import { Mail, Lock, User, Github, Chrome } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-dark-800 rounded-2xl border border-dark-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2">Start coding today</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600">
            <Chrome className="w-5 h-5 text-white" />
            <span className="text-sm text-white">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600">
            <Github className="w-5 h-5 text-white" />
            <span className="text-sm text-white">GitHub</span>
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-700" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-dark-800 text-gray-400">Or sign up with email</span></div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="password" placeholder="Create a password" className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded bg-dark-900 border-dark-700" />
            <span className="text-sm text-gray-400">I agree to the <Link href="/terms" className="text-primary-500 hover:underline">Terms</Link> and <Link href="/privacy" className="text-primary-500 hover:underline">Privacy</Link></span>
          </label>
          <button type="submit" className="w-full btn-primary">Create Account</button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link href="/auth/login" className="text-primary-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
