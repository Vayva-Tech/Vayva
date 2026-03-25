"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
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

type AppointmentUiStatus =
  | "in-session"
  | "checked-in"
  | "available"
  | "no-show"
  | "filling-up"
  | "waiting-list";

interface WellnessDashboardData {
  todaysOverview: {
    appointments: number;
    staffOnDuty: number;
    revenue: number;
    appointmentTrend: number;
    revenueTrend: number;
  };
  appointments: Array<{
    id: string;
    time: string;
    service: string;
    staff: string;
    client: string;
    status: AppointmentUiStatus;
  }>;
  staffAvailability: Array<{
    name: string;
    role: string;
    status: string;
    availability: string;
  }>;
  servicePerformance: Array<{
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  retailSales: Array<{ category: string; amount: number; trend: number }>;
  classes: Array<{
    time: string;
    type: string;
    enrolled: number;
    capacity: number;
    instructor: string;
  }>;
  membershipMetrics: {
    total: number;
    newThisMonth: number;
    churned: number;
    netGrowth: number;
    tiers: { unlimited: number; classPack: number; monthly: number };
  };
}

const WELLNESS_EMPTY: WellnessDashboardData = {
  todaysOverview: {
    appointments: 0,
    staffOnDuty: 0,
    revenue: 0,
    appointmentTrend: 0,
    revenueTrend: 0,
  },
  appointments: [],
  staffAvailability: [],
  servicePerformance: [],
  retailSales: [],
  classes: [],
  membershipMetrics: {
    total: 0,
    newThisMonth: 0,
    churned: 0,
    netGrowth: 0,
    tiers: { unlimited: 0, classPack: 0, monthly: 0 },
  },
};

function mapBookingWellnessStatus(ui: string): AppointmentUiStatus {
  switch (ui) {
    case "Confirmed":
      return "checked-in";
    case "Completed":
      return "in-session";
    case "Pending":
      return "waiting-list";
    case "Cancelled":
      return "no-show";
    default:
      return "waiting-list";
  }
}

export default function WellnessDashboard() {
  const searchParams = useSearchParams();
  const theme = searchParams?.get("theme") || "serene-garden";
  const [dash, setDash] = useState<WellnessDashboardData>(WELLNESS_EMPTY);
  const [loading, setLoading] = useState(true);

  const loadWellness = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const start = new Date(`${today}T00:00:00.000Z`);
      const end = new Date(`${today}T23:59:59.999Z`);
      type BeautyOverview = {
        revenue?: number;
        appointments?: number;
        productSales?: number;
        topServices?: Array<{
          serviceName?: string;
          count?: number;
          revenue?: number;
        }>;
        totalStylists?: number;
        stylistsOnDuty?: number;
      };

      const [overviewRes, bookingsRes, stylistsRes] = await Promise.all([
        apiJson<{ success?: boolean; data?: BeautyOverview }>(
          `/api/beauty/dashboard/overview?date=${today}`,
        ),
        apiJson<{
          data?: Array<{
            id: string;
            customerName: string;
            service: string;
            time: string;
            status: string;
          }>;
        }>(
          `/api/bookings?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
        ),
        apiJson<{
          success?: boolean;
          data?: Array<{
            firstName?: string | null;
            lastName?: string | null;
            role?: string | null;
          }>;
        }>("/api/beauty/stylists?limit=30"),
      ]);

      const ov = overviewRes.data;
      const bookings = bookingsRes.data ?? [];
      const stylists = stylistsRes.data ?? [];

      const appointments = bookings.map((b) => ({
        id: b.id,
        time: b.time,
        service: b.service,
        staff: "Team",
        client: b.customerName,
        status: mapBookingWellnessStatus(b.status),
      }));

      const staffAvailability = stylists.map((s) => {
        const name = [s.firstName, s.lastName].filter(Boolean).join(" ").trim() || "Staff";
        return {
          name,
          role: s.role ?? "Staff",
          status: "active",
          availability: "See schedule",
        };
      });

      const topServices = ov?.topServices ?? [];
      const servicePerformance = topServices.map((t) => ({
        name: t.serviceName ?? "Service",
        bookings: t.count ?? 0,
        revenue: t.revenue ?? 0,
        rating: 0,
      }));

      const productSales = ov?.productSales ?? 0;
      const retailSales =
        productSales > 0
          ? [{ category: "Retail (today)", amount: Math.round(productSales), trend: 0 }]
          : [];

      setDash({
        todaysOverview: {
          appointments: ov?.appointments ?? 0,
          staffOnDuty: ov?.totalStylists ?? stylists.length,
          revenue: ov?.revenue ?? 0,
          appointmentTrend: 0,
          revenueTrend: 0,
        },
        appointments,
        staffAvailability,
        servicePerformance,
        retailSales,
        classes: [],
        membershipMetrics: WELLNESS_EMPTY.membershipMetrics,
      });
    } catch {
      toast.error("Could not load wellness data");
      setDash(WELLNESS_EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWellness();
  }, [loadWellness]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const rated = dash.servicePerformance.filter((s) => s.rating > 0);
  const avgServiceRating =
    rated.length > 0
      ? (rated.reduce((a, s) => a + s.rating, 0) / rated.length).toFixed(1)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`space-y-6 p-6 bg-white min-h-screen ${loading ? "opacity-60 pointer-events-none" : ""}`}
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
            Notifications
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
          value={dash.todaysOverview.appointments}
          trend={dash.todaysOverview.appointmentTrend}
          trendLabel="vs last week"
          icon={<Calendar className="w-5 h-5" />}
        />
        
        <WellnessKPICard 
          title="Staff On Duty"
          value={dash.todaysOverview.staffOnDuty}
          trend={undefined}
          icon={<Users className="w-5 h-5" />}
        />
        
        <WellnessKPICard 
          title="Revenue Today"
          value={`₦${dash.todaysOverview.revenue.toLocaleString()}`}
          trend={dash.todaysOverview.revenueTrend}
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
            {dash.appointments.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No appointments scheduled for today.</p>
            )}
            {dash.appointments.map((apt) => (
              <div key={apt.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
                <div className="flex-1">
                  <div className="font-medium">{apt.time}</div>
                  <div className="text-sm text-gray-500">{apt.service} - {apt.staff}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{apt.client || "Available"}</div>
                  <div className="mt-1">
                    <AppointmentStatus status={apt.status} size="sm" />
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
            {dash.staffAvailability.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No staff roster for this store yet.</p>
            )}
            {dash.staffAvailability.map((staff, idx) => (
              <div key={`${staff.name}-${idx}`} className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
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
            {dash.servicePerformance.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No service volume yet for today.</p>
            )}
            {dash.servicePerformance.map((service, idx) => (
              <div key={`${service.name}-${idx}`} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₦{Number(service.revenue).toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {service.rating > 0 ? `${service.rating}/5` : "—"}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Avg service rating</span>
                <span className="font-medium">{avgServiceRating ? `${avgServiceRating}/5` : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rebooking rate</span>
                <span className="font-medium">—</span>
              </div>
            </div>
          </div>
        </WellnessCard>

        {/* Retail Sales */}
        <WellnessCard title="🛍️ RETAIL SALES">
          <div className="space-y-4">
            {dash.retailSales.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No retail sales recorded for today.</p>
            )}
            {dash.retailSales.map((category, idx) => (
              <div key={`${category.category}-${idx}`} className="flex justify-between items-center">
                <div className="font-medium">{category.category}</div>
                <div className="text-right">
                  <div className="font-semibold">₦{category.amount.toLocaleString()}</div>
                  <div className={`text-sm flex items-center gap-1 ${
                    category.trend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {category.trend >= 0 ? '▲' : '▼'} {Math.abs(category.trend)}%
                  </div>
                </div>
              </div>
            ))}
            {dash.retailSales.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Attach rate</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="text-xs text-gray-500">Share of clients who bought retail (when tracked)</div>
              </div>
            )}
          </div>
        </WellnessCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Schedule */}
        <WellnessCard title="🧘 CLASS SCHEDULE">
          <div className="space-y-3">
            {dash.classes.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No class schedule synced yet.</p>
            )}
            {dash.classes.map((classItem, idx) => (
              <div key={`${classItem.time}-${idx}`} className="flex justify-between items-center p-3 rounded-lg bg-gray-100">
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
            {dash.classes.length > 0 && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">Top instructors appear here when class data is connected.</div>
              </div>
            )}
          </div>
        </WellnessCard>

        {/* Membership Metrics */}
        <WellnessCard title="🎯 MEMBERSHIP METRICS">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dash.membershipMetrics.total}</div>
                <div className="text-sm text-gray-500">Total Members</div>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+{dash.membershipMetrics.netGrowth}</div>
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
                  <span className="font-medium">{dash.membershipMetrics.tiers.unlimited} members</span>
                </div>
                <div className="flex justify-between">
                  <span>10-Class:</span>
                  <span className="font-medium">{dash.membershipMetrics.tiers.classPack} members</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly:</span>
                  <span className="font-medium">{dash.membershipMetrics.tiers.monthly} members</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t text-sm">
              <div className="flex justify-between mb-1">
                <span>New This Month:</span>
                <span className="font-medium text-green-600">+{dash.membershipMetrics.newThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span>Churned:</span>
                <span className="font-medium text-red-600">{dash.membershipMetrics.churned}</span>
              </div>
            </div>
          </div>
        </WellnessCard>
      </div>

      {/* Theme Selector */}
      <WellnessCard title="🎨 Theme Selection">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.values(wellnessThemes).map((wellnessTheme) => (
            <Button
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
            </Button>
          ))}
        </div>
      </WellnessCard>
    </motion.div>
  );
}
