"use client";

import { Mail, Lock, Github, Chrome } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-dark-800 rounded-2xl border border-dark-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue coding</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors">
            <Chrome className="w-5 h-5 text-white" />
            <span className="text-sm text-white">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors">
            <Github className="w-5 h-5 text-white" />
            <span className="text-sm text-white">GitHub</span>
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-700" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-dark-800 text-gray-400">Or continue with email</span></div>
        </div>

        <form className="space-y-4">
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
              <input type="password" placeholder="Enter your password" className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary">Sign In</button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-primary-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
