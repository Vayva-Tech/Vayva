"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  HeartPulse,
  Settings,
  Bell,
  Lock,
  Users,
  Calendar,
  Clock,
  Pill,
  TestTube,
  DollarSign,
  Shield,
  Check,
  X,
  Upload,
  FileText,
} from "lucide-react";

export const dynamic = 'force-dynamic';

const sidebarItems = [
  { icon: Settings, label: "General", active: true },
  { icon: FileText, label: "Branding", active: false },
  { icon: Bell, label: "Notifications", active: false },
  { icon: Lock, label: "Security/HIPAA", active: false },
  { icon: Users, label: "Team", active: false },
  { icon: DollarSign, label: "Billing", active: false },
];

const healthcareSpecItems = [
  { icon: Users, label: "Patients" },
  { icon: Calendar, label: "Appointments" },
  { icon: Clock, label: "Queue Mgmt" },
  { icon: Pill, label: "E-Prescribe" },
  { icon: TestTube, label: "Labs" },
  { icon: DollarSign, label: "Billing" },
];

export default function HealthcareSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-600 flex items-center gap-2">
            <HeartPulse className="h-6 w-6" />
            HEALTH+
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-teal-600">
              Dashboard
            </Link>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold">
              SJ
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">
              Healthcare Practice Configuration (HIPAA Secure)
            </p>
          </div>
          <Badge variant="info" className="flex items-center gap-2">
            <Lock className="h-3 w-3" />
            HIPAA Compliant
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}

              <div className="my-4 border-t"></div>

              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Healthcare Specific
              </div>

              {healthcareSpecItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Practice Information */}
            <Card>
              <CardHeader>
                <CardTitle>Practice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Practice Name
                    </label>
                    <Input defaultValue="Johnson Medical Center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      NPI Number
                    </label>
                    <Input defaultValue="1234567890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tax ID
                    </label>
                    <Input defaultValue="XX-XXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Practice Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>Primary Care</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>Family Medicine</span>
                      </label>
                    </div>
                  </div>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Save Practice Info
                </Button>
              </CardContent>
            </Card>

            {/* HIPAA Compliance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-teal-600" />
                    HIPAA Compliance
                  </CardTitle>
                  <Badge variant="success">Compliant</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Auto-logout (minutes)
                    </label>
                    <Input type="number" defaultValue="15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Password expiry (days)
                    </label>
                    <Input type="number" defaultValue="90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Session timeout (minutes)
                    </label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Two-factor auth
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" defaultChecked />
                      <span>Required for all users</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Audit Trail</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Log all PHI access</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Log prescription changes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Log patient messages</span>
                    </label>
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">
                        Record retention (years)
                      </label>
                      <Input type="number" defaultValue="7" />
                    </div>
                  </div>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700">
                  HIPAA Compliance Checklist
                </Button>
              </CardContent>
            </Card>

            {/* Patient Management */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Registration Settings</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Allow online registration</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Require insurance verification</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Digital consent forms</span>
                  </label>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Patient Portal</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Enable patient portal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Allow online scheduling</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Enable secure messaging</span>
                  </label>
                  <div className="ml-6">
                    <label className="block text-sm font-medium mb-2">
                      Lab results release (business days)
                    </label>
                    <Input type="number" defaultValue="3" />
                  </div>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700">
                  Manage Patient Forms
                </Button>
              </CardContent>
            </Card>

            {/* Appointment Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Slot duration (minutes)
                    </label>
                    <Input type="number" defaultValue="15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Buffer time (minutes)
                    </label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max advance booking (days)
                    </label>
                    <Input type="number" defaultValue="60" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Appointment Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Annual Physical (min)
                      </label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Follow-up (min)
                      </label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Acute Visit (min)
                      </label>
                      <Input type="number" defaultValue="20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Telehealth (min)
                      </label>
                      <Input type="number" defaultValue="30" />
                    </div>
                  </div>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700">
                  Manage Schedule Templates
                </Button>
              </CardContent>
            </Card>

            {/* E-Prescribing */}
            <Card>
              <CardHeader>
                <CardTitle>E-Prescribing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Connected to Surescripts</span>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Controlled Substances</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Enable C-II-V prescribing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Check PDMP before prescribing</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      DEA Number
                    </label>
                    <Input defaultValue="AB1234567" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Default duration (days)
                    </label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Default refills
                    </label>
                    <Input type="number" defaultValue="3" />
                  </div>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700">
                  Manage Formulary
                </Button>
              </CardContent>
            </Card>

            {/* Lab Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Lab Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 mb-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Quest Diagnostics</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>LabCorp</span>
                  </label>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Order Settings</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Electronic lab orders</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Auto-import results</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Flag abnormal results</span>
                  </label>
                </div>

                <Button className="bg-teal-600 hover:bg-teal-700">
                  Manage Lab Panels
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
