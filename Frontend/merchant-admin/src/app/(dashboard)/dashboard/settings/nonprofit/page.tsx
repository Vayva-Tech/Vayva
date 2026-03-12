// ============================================================================
// Nonprofit Settings Page
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Heart,
  CreditCard,
  Users,
  Target,
  Briefcase,
  Calendar,
  Settings,
  Bell,
  Shield,
  FileText
} from 'lucide-react';

export default function NonprofitSettingsPage() {
  const [activeTab, setActiveTab] = useState('donation');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nonprofit Settings</h1>
        <p className="text-muted-foreground">
          Configure your nonprofit organization's donation and fundraising settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="donation" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Donations</span>
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Donors</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="grants" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Grants</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Programs</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donation" className="space-y-6">
          <DonationSettings />
        </TabsContent>

        <TabsContent value="donors" className="space-y-6">
          <DonorManagementSettings />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignSettings />
        </TabsContent>

        <TabsContent value="grants" className="space-y-6">
          <GrantSettings />
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <ProgramSettings />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventSettings />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DonationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Payment Processing
          </CardTitle>
          <CardDescription>
            Configure how your organization accepts donations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
              <Input id="stripe-key" placeholder="pk_live_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-email">PayPal Email</Label>
              <Input id="paypal-email" type="email" placeholder="donations@yourorg.org" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Donation Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recurring Donations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow donors to set up monthly/yearly giving
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tribute Gifts</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable honorary/memorial gift options
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cryptocurrency Donations</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept Bitcoin, Ethereum, and other cryptocurrencies
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Suggested Amounts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['$25', '$50', '$100', '$250'].map((amount) => (
                <div key={amount} className="border rounded-lg p-3 text-center">
                  <span className="font-medium">{amount}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-min">Custom Amount Minimum</Label>
              <Input id="custom-min" type="number" defaultValue="5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DonorManagementSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Donor Management
          </CardTitle>
          <CardDescription>
            Configure donor relationship and communication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Donor Segmentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-emerald-700">Major Donors</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Gifts over $1,000 annually
                </p>
                <Input 
                  type="number" 
                  defaultValue="1000" 
                  className="mt-2"
                  placeholder="Threshold amount"
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-blue-700">Mid-Level Donors</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Gifts between $100-$999 annually
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-purple-700">Annual Donors</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Gifts under $100 annually
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Communication Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Thank You Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send immediate acknowledgment for donations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Quarterly Impact Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Regular updates on how donations are used
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Birthday/Anniversary Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Personal milestone acknowledgments
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Campaign Management
          </CardTitle>
          <CardDescription>
            Configure fundraising campaign settings and defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Campaign Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="default-goal">Default Campaign Goal</Label>
                <Input id="default-goal" type="number" defaultValue="50000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-duration">Default Duration (days)</Label>
                <Input id="default-duration" type="number" defaultValue="90" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Thermometer Display</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Progress Thermometer</Label>
                  <p className="text-sm text-muted-foreground">
                    Visual progress indicator on campaign pages
                </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Display Donor Wall</Label>
                  <p className="text-sm text-muted-foreground">
                    Show recent donors publicly (anonymized)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Peer-to-Peer Fundraising</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Team Fundraising</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow supporters to create personal fundraising pages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Leaderboard Display</Label>
                  <p className="text-sm text-muted-foreground">
                    Show top fundraisers publicly
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GrantSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            Grant Management
          </CardTitle>
          <CardDescription>
            Configure grant tracking and reporting settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Grant Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Deadline Reminder (days)</Label>
                <Input id="reminder-days" type="number" defaultValue="14" />
                <p className="text-sm text-muted-foreground">
                  Send reminders this many days before deadlines
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-frequency">Report Frequency</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Annually</option>
                </select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Foundation Database</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-sync Foundation Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep foundation profiles updated automatically
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred-foundations">Preferred Foundations</Label>
                <Textarea 
                  id="preferred-foundations" 
                  placeholder="Enter foundation names, one per line"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProgramSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600" />
            Program Management
          </CardTitle>
          <CardDescription>
            Configure program tracking and impact measurement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Program Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Education', color: 'emerald' },
                { name: 'Healthcare', color: 'blue' },
                { name: 'Community', color: 'purple' },
                { name: 'Research', color: 'indigo' }
              ].map((program) => (
                <div key={program.name} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${program.color}-500`} />
                    <span className="font-medium">{program.name}</span>
                  </div>
                  <Input placeholder="Allocation %" type="number" min="0" max="100" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Impact Tracking</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Beneficiary Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track individuals served by program
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Outcome Surveys</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect feedback from program participants
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Event Management
          </CardTitle>
          <CardDescription>
            Configure event planning and ticketing settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Event Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Fundraising Gala', defaultPrice: 150 },
                { name: 'Community Walk', defaultPrice: 25 },
                { name: 'Auction', defaultPrice: 100 }
              ].map((event) => (
                <div key={event.name} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{event.name}</h4>
                  <div className="space-y-2">
                    <Label>Default Ticket Price</Label>
                    <Input 
                      type="number" 
                      defaultValue={event.defaultPrice}
                      prefix="$"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Registration Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Early Bird Discounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Offer discounted rates for early registrants
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Group Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow bulk registrations for groups
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Financial Compliance
          </CardTitle>
          <CardDescription>
            Configure financial reporting and compliance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Fund Accounting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
                <Input id="ein" placeholder="XX-XXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal Year End</Label>
                <Input id="fiscal-year" type="date" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Tax Receipts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-generate Tax Receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send tax-deductible receipts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Paperless Preference</Label>
                  <p className="text-sm text-muted-foreground">
                    Encourage electronic receipts by default
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Audit Preparation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Document Repository</Label>
                  <p className="text-sm text-muted-foreground">
                    Maintain organized records for audits
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Donation Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Immediate Donation Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify for every new donation
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Donation Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily donation totals
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Campaign Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campaign Milestone Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert at 25%, 50%, 75%, 90% of goals
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campaign Ending Soon</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify 7 days before campaign ends
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Grant Deadlines</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Grant Application Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Advance notice for upcoming deadlines
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}