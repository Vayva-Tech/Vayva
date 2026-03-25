"use client";
import { useState } from "react";
import { Card, Button, Input, Label, Switch, Select, Badge, cn } from "@vayva/ui";
import { motion } from "framer-motion";
import {
  Scissors,
  Users,
  Calendar,
  Image,
  Package,
  Gift,
  CreditCard,
  Clock,
  Bell,
  Smartphone,
  Mail,
  Percent,
  ShieldCheck,
  Upload,
  Plus,
  Save,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

export default function BeautySettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Scissors },
    { id: "services", label: "Services", icon: Scissors },
    { id: "stylists", label: "Stylists", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "products", label: "Products", icon: Package },
    { id: "packages", label: "Packages", icon: Gift },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Beauty Salon Settings</h1>
        <p className="text-gray-700">Configure your salon operations, services, and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-green-50-primary/20 text-green-600-primary"
                  : "text-gray-700 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "services" && <ServicesSettings />}
        {activeTab === "stylists" && <StylistsSettings />}
        {activeTab === "appointments" && <AppointmentsSettings />}
        {activeTab === "gallery" && <GallerySettings />}
        {activeTab === "products" && <ProductsSettings />}
        {activeTab === "packages" && <PackagesSettings />}
      </div>
    </div>
  );
}

// ============================================================================
// General Settings Tab
// ============================================================================

function GeneralSettings() {
  return (
    <div className="space-y-6">
      {/* Salon Information */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Salon Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Salon Name</Label>
            <Input placeholder="e.g., Bella Beauty Salon" defaultValue="Bella Beauty Salon" />
          </div>

          <div>
            <Label>License Number</Label>
            <Input placeholder="COS-2026-12345" defaultValue="COS-2026-12345" />
          </div>

          <div>
            <Label>Expiry Date</Label>
            <Input type="date" defaultValue="2026-12-31" />
          </div>

          <div>
            <Label>Upload License</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button variant="outline" className="glass-button">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <Badge variant="success" className="flex items-center gap-2">
                <Check className="w-3 h-3" />
                Verified
              </Badge>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Services Offered</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Hair Styling",
                "Coloring",
                "Extensions",
                "Nail Care",
                "Skincare",
                "Makeup",
                "Spa Services",
                "Lashes",
                "Waxing",
              ].map((service) => (
                <label key={service} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Price Range</Label>
            <Select defaultValue="$$$">
              <option value="$">$ Budget</option>
              <option value="$$">$$ Moderate</option>
              <option value="$$$">$$$ Premium</option>
              <option value="$$$$">$$$$ Luxury</option>
            </Select>
          </div>

          <Button className="accent-gradient">
            <Save className="w-4 h-4 mr-2" />
            Save Salon Info
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Services Settings Tab
// ============================================================================

function ServicesSettings() {
  const categories = [
    { name: "Hair", count: 18 },
    { name: "Nails", count: 12 },
    { name: "Skincare", count: 8 },
    { name: "Makeup", count: 10 },
    { name: "Lashes & Brows", count: 4 },
    { name: "Spa Packages", count: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Service Menu Management */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Service Menu Management</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Service Categories</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{category.name}</span>
                    <span className="text-gray-700 text-sm ml-2">({category.count} services)</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass-button">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="glass-button">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Button variant="outline" className="glass-button w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Pricing Strategy</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Tiered pricing by stylist level</span>
              </label>
              <div className="flex items-center gap-4 pl-6">
                <Label>Weekend Surcharge:</Label>
                <Input type="number" defaultValue={15} className="w-20" />
                <span>%</span>
              </div>
              <div className="flex items-center gap-4 pl-6">
                <Label>Holiday Pricing:</Label>
                <Input type="number" defaultValue={25} className="w-20" />
                <span>%</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Duration Defaults</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Label>Buffer Time:</Label>
                <Input type="number" defaultValue={10} className="w-20" />
                <span className="text-gray-700">minutes</span>
              </div>
              <div className="flex items-center gap-4">
                <Label>Cleanup Time:</Label>
                <Input type="number" defaultValue={5} className="w-20" />
                <span className="text-gray-700">minutes</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="accent-gradient">
              Manage Services
            </Button>
            <Button variant="outline" className="glass-button">
              Import Menu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Stylists Settings Tab
// ============================================================================

function StylistsSettings() {
  return (
    <div className="space-y-6">
      {/* Staff Management */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Stylist Management</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Staff Levels</Label>
            <div className="space-y-3">
              {[
                { level: "Senior Stylist", count: 4, rate: "$80-120" },
                { level: "Stylist", count: 3, rate: "$60-90" },
                { level: "Junior Stylist", count: 2, rate: "$40-60" },
                { level: "Nail Tech", count: 1, rate: "$35-50" },
              ].map((staff) => (
                <div key={staff.level} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{staff.level}</span>
                    <span className="text-gray-700 text-sm ml-2">({staff.count} staff)</span>
                  </div>
                  <span className="text-green-600-primary">{staff.rate}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Button variant="outline" className="glass-button w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Level
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Commission Structure</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Label>Base Commission:</Label>
                <Input type="number" defaultValue={40} className="w-20" />
                <span>%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label>Tier 2 (&gt;$5K/mo):</Label>
                <Input type="number" defaultValue={45} className="w-20" />
                <span>%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label>Tier 3 (&gt;$8K/mo):</Label>
                <Input type="number" defaultValue={50} className="w-20" />
                <span>%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label>Tips:</Label>
                <Select defaultValue="100">
                  <option value="100">100% to stylist</option>
                  <option value="80">80/20 split</option>
                  <option value="50">50/50 split</option>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label>Retail Commission:</Label>
                <Input type="number" defaultValue={10} className="w-20" />
                <span>%</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Schedule Settings</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Label>Max Appointments/Day:</Label>
                <Input type="number" defaultValue={8} className="w-20" />
              </div>
              <div className="flex items-center gap-4">
                <Label>Min. Break Between:</Label>
                <Input type="number" defaultValue={15} className="w-20" />
                <span className="text-gray-700">minutes</span>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Allow double-booking</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="accent-gradient">
              Manage Stylists
            </Button>
            <Button variant="outline" className="glass-button">
              View Schedules
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Appointments Settings Tab
// ============================================================================

function AppointmentsSettings() {
  return (
    <div className="space-y-6">
      {/* Booking Settings */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Appointment Booking</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Booking Rules</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Enable online booking</span>
              </label>
              <div className="flex items-center gap-4 pl-6">
                <Label>Advance Booking:</Label>
                <Input type="number" defaultValue={30} className="w-20" />
                <span className="text-gray-700">days</span>
              </div>
              <div className="flex items-center gap-4 pl-6">
                <Label>Cutoff Time:</Label>
                <Input type="number" defaultValue={2} className="w-20" />
                <span className="text-gray-700">hours before</span>
              </div>
              <label className="flex items-center gap-2 pl-6">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Deposit required for services &gt;$100</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Cancellation Policy</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Label>Free Cancellation:</Label>
                <Input type="number" defaultValue={24} className="w-20" />
                <span className="text-gray-700">hours before</span>
              </div>
              <div className="flex items-center gap-4">
                <Label>Late Fee:</Label>
                <Input type="number" defaultValue={50} className="w-20" />
                <span>% of service</span>
              </div>
              <div className="flex items-center gap-4">
                <Label>No-show Fee:</Label>
                <Input type="number" defaultValue={100} className="w-20" />
                <span>% of service</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Confirmation Settings</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Send SMS confirmation
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Send email confirmation
                </span>
              </label>
              <div className="flex items-center gap-4 pl-6">
                <Bell className="w-4 h-4 text-gray-700" />
                <Label>Reminder:</Label>
                <Input type="number" defaultValue={24} className="w-20" />
                <span className="text-gray-700">hours before</span>
              </div>
              <div className="flex items-center gap-4 pl-6">
                <Bell className="w-4 h-4 text-gray-700" />
                <Label>Reminder:</Label>
                <Input type="number" defaultValue={2} className="w-20" />
                <span className="text-gray-700">hours before</span>
              </div>
            </div>
          </div>

          <Button className="accent-gradient">
            Manage Booking Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Gallery Settings Tab
// ============================================================================

function GallerySettings() {
  return (
    <div className="space-y-6">
      {/* Gallery Settings */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Gallery & Portfolio</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Photo Settings</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Require before/after for chemical services</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Require approval before publishing</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Add salon logo watermark</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Social Media Integration</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Auto-post to Instagram</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Auto-post to Facebook</span>
              </label>
              <div>
                <Label className="mt-2">Default Hashtags:</Label>
                <Input defaultValue="#BellaBeauty #NYCBeauty #SalonLife" />
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Client Consent</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Require photo release form
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Store signed consent forms</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Parent signature required for minors</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="accent-gradient">
              Manage Gallery
            </Button>
            <Button variant="outline" className="glass-button">
              Photo Release Forms
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Products Settings Tab
// ============================================================================

function ProductsSettings() {
  return (
    <div className="space-y-6">
      {/* Product & Inventory Settings */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Product & Inventory</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Retail Products</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Enable retail sales</span>
              </label>
              <div className="flex items-center gap-4 pl-6">
                <Label>Commission on Retail:</Label>
                <Input type="number" defaultValue={10} className="w-20" />
                <span>%</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Inventory Tracking</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Track product usage</span>
              </label>
              <div className="flex items-center gap-4 pl-6">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <Label>Low Stock Alerts:</Label>
                <Input type="number" defaultValue={20} className="w-20" />
                <span className="text-gray-700">% remaining</span>
              </div>
              <label className="flex items-center gap-2 pl-6">
                <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Auto-reorder (manual approval required)</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Preferred Suppliers</Label>
            <div className="space-y-2">
              {[
                "Olaplex (Authorized retailer)",
                "Pureology (Authorized retailer)",
                "Redken (Authorized retailer)",
              ].map((supplier) => (
                <div key={supplier} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-700">{supplier}</span>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="accent-gradient">
              Manage Inventory
            </Button>
            <Button variant="outline" className="glass-button">
              Supplier Contacts
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// Packages Settings Tab
// ============================================================================

function PackagesSettings() {
  return (
    <div className="space-y-6">
      {/* Packages & Memberships */}
      <Card className="glass-panel p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Packages & Memberships</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Service Packages</Label>
            <div className="space-y-3">
              {[
                { name: "Bridal Package", price: "$450", savings: "Save $80" },
                { name: "Spa Day", price: "$280", savings: "Save $50" },
                { name: "Color & Cut", price: "$180", savings: "Save $30" },
                { name: "Mani-Pedi", price: "$85", savings: "Save $15" },
              ].map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{pkg.name}</span>
                    <span className="text-green-600-primary ml-2">{pkg.price}</span>
                    <span className="text-green-400 text-sm ml-2">{pkg.savings}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass-button">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="glass-button">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Button variant="outline" className="glass-button w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create New Package
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Membership Plans</Label>
            <div className="space-y-3">
              {[
                { name: "VIP Monthly", price: "$99/mo", benefit: "20% off all services" },
                { name: "Beauty Pass", price: "$49/mo", benefit: "10% off + free products" },
                { name: "Unlimited Blowouts", price: "$149/mo", benefit: "Unlimited blowout services" },
              ].map((plan) => (
                <div key={plan.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-accent-primary/20">
                  <div>
                    <span className="text-white font-medium">{plan.name}</span>
                    <span className="text-green-600-primary ml-2">{plan.price}</span>
                    <p className="text-gray-700 text-sm mt-1">{plan.benefit}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass-button">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="glass-button">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Button variant="outline" className="glass-button w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Membership Plan
            </Button>
          </div>

          <div>
            <Label className="mb-2 block">Gift Cards</Label>
            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20" />
                <span className="text-gray-700">Sell gift cards</span>
              </label>
              <div>
                <Label className="mt-2">Denominations:</Label>
                <div className="flex gap-2 mt-2">
                  {["$50", "$100", "$200", "Custom"].map((amount) => (
                    <Badge key={amount} variant="outline" className="cursor-pointer">
                      {amount}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label>Expiration:</Label>
                <Select defaultValue="never">
                  <option value="never">Never</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="accent-gradient">
              Manage Packages
            </Button>
            <Button variant="outline" className="glass-button">
              Membership Benefits
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
