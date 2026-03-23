// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@vayva/ui";
import {
  Calendar,
  Users,
  CurrencyDollar as DollarSign,
  TrendUp as TrendingUp,
  Star,
  Package,
  Bell,
  Gear as Settings
} from "@phosphor-icons/react/ssr";
import { applyTheme, wellnessThemes } from "@vayva/theme";
import { 
  WellnessCard, 
  AppointmentStatus, 
  StaffStatus, 
  WellnessKPICard 
} from "@/components/wellness";

// Mock data for demonstration
const mockData = {
  todaysOverview: {
    appointments: 47,
    staffOnDuty: 12,
    revenue: 6847,
    appointmentTrend: 8,
    revenueTrend: 12
  },
  appointments: [
    { time: "9:00 AM", service: "Deep Tissue", staff: "Sarah", client: "Jennifer", status: "in-session" },
    { time: "9:30 AM", service: "Facial", staff: "Maria", client: "Lisa", status: "checked-in" },
    { time: "10:00 AM", service: "Massage", staff: "James", client: "", status: "available" },
    { time: "10:30 AM", service: "Manicure", staff: "Emma", client: "Rachel", status: "no-show" },
    { time: "11:00 AM", service: "Yoga Class", staff: "All", client: "14/20", status: "filling-up" },
  ],
  staffAvailability: [
    { name: "Sarah Johnson", role: "Massage Therapist", status: "active", availability: "9:00 AM - 5:00 PM" },
    { name: "Maria Garcia", role: "Esthetician", status: "active", availability: "10:00 AM - 6:00 PM" },
    { name: "James Wilson", role: "Massage Therapist", status: "break", availability: "Back at 11:30 AM" },
    { name: "Emma Thompson", role: "Nail Technician", status: "active", availability: "8:00 AM - 4:00 PM" },
  ],
  servicePerformance: [
    { name: "Swedish Massage", bookings: 34, revenue: 2380, rating: 4.8 },
    { name: "Deep Tissue", bookings: 28, revenue: 1960, rating: 4.7 },
    { name: "Hot Stone", bookings: 22, revenue: 1540, rating: 4.9 },
    { name: "Facials", bookings: 19, revenue: 1330, rating: 4.6 },
    { name: "Manicures/Pedi", bookings: 31, revenue: 1860, rating: 4.8 },
  ],
  retailSales: [
    { category: "Skincare", amount: 1247, trend: 18 },
    { category: "Supplements", amount: 847, trend: 12 },
    { category: "Aromatherapy", amount: 623, trend: -5 },
    { category: "Wellness", amount: 445, trend: 22 },
  ],
  classes: [
    { time: "6:00 AM", type: "Vinyasa", enrolled: 18, capacity: 20, instructor: "Jessica" },
    { time: "8:00 AM", type: "Hatha", enrolled: 12, capacity: 15, instructor: "Mike" },
    { time: "5:30 PM", type: "Power", enrolled: 16, capacity: 20, instructor: "Anna" },
    { time: "7:00 PM", type: "Restorative", enrolled: 14, capacity: 15, instructor: "Sarah" },
  ],
  membershipMetrics: {
    total: 847,
    newThisMonth: 67,
    churned: 23,
    netGrowth: 44,
    tiers: {
      unlimited: 234,
      classPack: 312,
      monthly: 301
    }
  }
};

export default function WellnessDashboard() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') || 'serene-garden';
  
  useEffect(() => {
    // Apply wellness theme
    applyTheme(theme);
  }, [theme]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-6 bg-white min-h-screen"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">VAYVA WELLNESS</h1>
          <p className="text-gray-500 mt-1">Natural Warmth Design</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Bell className="w-4 h-4" />
            6 Notifications
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WellnessKPICard 
          title="Today's Appointments"
          value={mockData.todaysOverview.appointments}
          trend={mockData.todaysOverview.appointmentTrend}
          trendLabel="vs last week"
          icon={<Calendar className="w-5 h-5" />}
        />
        
        <WellnessKPICard 
          title="Staff On Duty"
          value={mockData.todaysOverview.staffOnDuty}
          trend={undefined}
          icon={<Users className="w-5 h-5" />}
        />
        
        <WellnessKPICard 
          title="Revenue Today"
          value={`$${mockData.todaysOverview.revenue.toLocaleString()}`}
          trend={mockData.todaysOverview.revenueTrend}
          trendLabel="vs avg"
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Schedule */}
        <WellnessCard 
          title="📅 APPOINTMENT SCHEDULE"
          headerAction={<Button variant="outline" size="sm">Quick Add</Button>}
        >
          <div className="space-y-3">
            {mockData.appointments.map((apt, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
                <div className="flex-1">
                  <div className="font-medium">{apt.time}</div>
                  <div className="text-sm text-gray-500">{apt.service} - {apt.staff}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{apt.client || "Available"}</div>
                  <div className="mt-1">
                    <AppointmentStatus 
                      status={apt.status as any} 
                      size="sm" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WellnessCard>

        {/* Staff Availability */}
        <WellnessCard 
          title="👥 STAFF AVAILABILITY"
          headerAction={<Button variant="outline" size="sm">Schedule Editor</Button>}
        >
          <div className="space-y-3">
            {mockData.staffAvailability.map((staff, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
                <div>
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-sm text-gray-500">{staff.role}</div>
                </div>
                <StaffStatus 
                  status={staff.status as any} 
                  availability={staff.availability}
                />
              </div>
            ))}
          </div>
        </WellnessCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <WellnessCard title="💆 SERVICE PERFORMANCE">
          <div className="space-y-4">
            {mockData.servicePerformance.map((service, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${service.revenue}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {service.rating}/5
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Avg Service Rating:</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rebooking Rate:</span>
                <span className="font-medium">67%</span>
              </div>
            </div>
          </div>
        </WellnessCard>

        {/* Retail Sales */}
        <WellnessCard title="🛍️ RETAIL SALES">
          <div className="space-y-4">
            {mockData.retailSales.map((category, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="font-medium">{category.category}</div>
                <div className="text-right">
                  <div className="font-semibold">${category.amount}</div>
                  <div className={`text-sm flex items-center gap-1 ${
                    category.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {category.trend >= 0 ? '▲' : '▼'} {Math.abs(category.trend)}%
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Attach Rate:</span>
                <span className="font-medium">34%</span>
              </div>
              <div className="text-xs text-gray-500">(clients purchasing products)</div>
            </div>
          </div>
        </WellnessCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Schedule */}
        <WellnessCard title="🧘 CLASS SCHEDULE">
          <div className="space-y-3">
            {mockData.classes.map((classItem, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
                <div>
                  <div className="font-medium">{classItem.time} {classItem.type}</div>
                  <div className="text-sm text-gray-500">Instructor: {classItem.instructor}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{classItem.enrolled}/{classItem.capacity}</div>
                  <div className="text-xs text-gray-500">students</div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium">Popular Instructors:</span>
                <div className="mt-1 text-gray-500">
                  • Jessica (avg 18/class)<br/>
                  • Mike (avg 16/class)<br/>
                  • Anna (avg 15/class)
                </div>
              </div>
            </div>
          </div>
        </WellnessCard>

        {/* Membership Metrics */}
        <WellnessCard title="🎯 MEMBERSHIP METRICS">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mockData.membershipMetrics.total}</div>
                <div className="text-sm text-gray-500">Total Members</div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+{mockData.membershipMetrics.netGrowth}</div>
                <div className="text-sm text-gray-500">Net Growth</div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm mb-3">
                <span className="font-medium">Membership Tiers:</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Unlimited:</span>
                  <span className="font-medium">{mockData.membershipMetrics.tiers.unlimited} members</span>
                </div>
                <div className="flex justify-between">
                  <span>10-Class:</span>
                  <span className="font-medium">{mockData.membershipMetrics.tiers.classPack} members</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly:</span>
                  <span className="font-medium">{mockData.membershipMetrics.tiers.monthly} members</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t text-sm">
              <div className="flex justify-between mb-1">
                <span>New This Month:</span>
                <span className="font-medium text-green-600">+{mockData.membershipMetrics.newThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span>Churned:</span>
                <span className="font-medium text-red-600">{mockData.membershipMetrics.churned}</span>
              </div>
            </div>
          </div>
        </WellnessCard>
      </div>

      {/* Theme Selector */}
      <WellnessCard title="🎨 Theme Selection">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.values(wellnessThemes).map((wellnessTheme) => (
            <button
              key={wellnessTheme.id}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('theme', wellnessTheme.id);
                window.location.href = url.toString();
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                theme === wellnessTheme.id 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-gray-200 hover:border-green-500/50'
              }`}
            >
              <div 
                className="w-full h-8 rounded mb-2" 
                style={{ backgroundColor: wellnessTheme.colors.primary }}
              />
              <div className="text-sm font-medium text-gray-900">{wellnessTheme.name}</div>
              <div className="text-xs text-gray-500">{wellnessTheme.description}</div>
            </button>
          ))}
        </div>
      </WellnessCard>
    </motion.div>
  );
}