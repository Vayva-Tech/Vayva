"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";
import { Button } from "@vayva/ui";

const roles = [
  { name: "Owner", desc: "Full access to everything", color: "bg-slate-900" },
  { name: "Manager", desc: "Manage orders, products, and team", color: "bg-blue-600" },
  { name: "Sales", desc: "Process orders and chat with customers", color: "bg-green-600" },
  { name: "Support", desc: "Handle disputes and customer issues", color: "bg-amber-600" },
  { name: "Inventory", desc: "Manage stock and suppliers", color: "bg-purple-600" },
  { name: "Finance", desc: "View reports and manage payouts", color: "bg-rose-600" },
];

const permissions = [
  { feature: "Orders", owner: "✓", manager: "✓", sales: "✓", support: "View", inventory: "", finance: "" },
  { feature: "Products", owner: "✓", manager: "✓", sales: "", support: "", inventory: "✓", finance: "" },
  { feature: "Inventory", owner: "✓", manager: "✓", sales: "View", support: "", inventory: "✓", finance: "View" },
  { feature: "Customers", owner: "✓", manager: "✓", sales: "✓", support: "✓", inventory: "", finance: "" },
  { feature: "Analytics", owner: "✓", manager: "✓", sales: "", support: "", inventory: "", finance: "✓" },
  { feature: "Payouts", owner: "✓", manager: "View", sales: "", support: "", inventory: "", finance: "✓" },
  { feature: "Team Settings", owner: "✓", manager: "", sales: "", support: "", inventory: "", finance: "" },
];

export default function TeamPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
                Team Management
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Team & Permissions
                <br />
                <span className="text-indigo-600">Done Right</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                Give your team access to what they need—and only what they need. 
                Role-based permissions for secure collaboration.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`${APP_URL}/signup`}>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-base font-semibold rounded-xl">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl">
                    See All Features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Pre-built roles
            </h2>
            <p className="text-lg text-slate-600">
              Ready-to-use roles for common business functions
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {roles.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all h-full"
              >
                <div className={`w-3 h-3 rounded-full ${r.color} mb-4`} />
                <h3 className="font-bold text-slate-900 mb-1">{r.name}</h3>
                <p className="text-sm text-slate-600">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Permissions Table */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Feature access by role
            </h2>
            <p className="text-lg text-slate-600">
              Granular permissions for secure operations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Owner</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Manager</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Sales</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Support</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Inventory</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Finance</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.feature} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium text-slate-900">{p.feature}</td>
                    <td className="text-center py-3 px-4 text-slate-600">{p.owner}</td>
                    <td className="text-center py-3 px-4 text-slate-600">{p.manager}</td>
                    <td className="text-center py-3 px-4 text-slate-600">{p.sales}</td>
                    <td className="text-center py-3 px-4 text-slate-600">{p.support}</td>
                    <td className="text-center py-3 px-4 text-slate-600">{p.inventory}</td>
                    <td className="text-center py-3 px-4 text-slate-600">{p.finance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            ✓ = Full access • View = Read-only • Blank = No access
          </p>
        </div>
      </section>

      {/* Custom Roles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Need custom roles?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Pro plan includes custom role creation. 
            Define exactly what each team member can access.
          </p>
          <Link href="/pricing">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 text-lg font-semibold rounded-xl">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Ready to collaborate securely?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Add your team and set permissions in minutes.
          </p>
          <Link href={`${APP_URL}/signup`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg font-semibold rounded-xl">
              Get Started Free
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            7-day free trial • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
