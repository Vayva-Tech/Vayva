// ============================================================================
// Industry Settings Management UI
// ============================================================================
// Reusable admin interface for managing industry-specific configurations
// Supports all 22+ industries with extensible settings panels
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Building2, 
  Store, 
  Settings2, 
  Save, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users,
  Package,
  Calendar,
  DollarSign,
  ShoppingCart,
  Utensils,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Code,
  Palette,
  Megaphone,
  FileText,
  BarChart3,
  ShoppingBag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiJson } from '@/lib/api-client-shared';
import type { IndustryConfig } from '@/types/industry';
import type { IndustrySlug } from '@/lib/templates/types';

// ============================================================================
// Industry Icon Mapping
// ============================================================================

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  retail: Store,
  fashion: ShoppingBag,
  electronics: Code,
  beauty: Heart,
  grocery: ShoppingCart,
  one_product: Package,
  food: Utensils,
  restaurant: Utensils,
  services: Building2,
  real_estate: Home,
  automotive: Car,
  events: Calendar,
  travel_hospitality: Plane,
  education: GraduationCap,
  nonprofit: Heart,
  saas: Code,
  healthcare: Heart,
  nightlife: Sparkles,
  blog_media: FileText,
  creative_portfolio: Palette,
  marketplace: ShoppingCart,
  b2b: BarChart3,
};

// ============================================================================
// Settings Schema
// ============================================================================

const industrySettingsSchema = z.object({
  industrySlug: z.string(),
  displayName: z.string().min(2),
  enabledModules: z.array(z.string()),
  primaryObjectLabel: z.string(),
  customFields: z.record(z.unknown()).optional(),
  features: z.object({
    enableAnalytics: z.boolean(),
    enableAIInsights: z.boolean(),
    enableRealTimeUpdates: z.boolean(),
    enableCustomWidgets: z.boolean(),
  }),
});

type IndustrySettingsForm = z.infer<typeof industrySettingsSchema>;

type IndustrySettingsApiResponse = {
  industrySlug?: string;
  config?: IndustryConfig;
};

// ============================================================================
// Main Component
// ============================================================================

interface IndustrySettingsManagerProps {
  initialIndustry?: IndustrySlug;
  onSettingsChange?: (settings: IndustrySettingsForm) => void;
}

export function IndustrySettingsManager({
  initialIndustry = 'retail',
  onSettingsChange,
}: IndustrySettingsManagerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [industryConfig, setIndustryConfig] = useState<IndustryConfig | null>(null);

  const form = useForm<IndustrySettingsForm>({
    resolver: zodResolver(industrySettingsSchema),
    defaultValues: {
      industrySlug: initialIndustry,
      displayName: '',
      enabledModules: [],
      primaryObjectLabel: '',
      features: {
        enableAnalytics: true,
        enableAIInsights: true,
        enableRealTimeUpdates: true,
        enableCustomWidgets: false,
      },
    },
  });

  // Load current industry settings
  useEffect(() => {
    async function loadIndustrySettings() {
      try {
        const data = await apiJson<IndustrySettingsApiResponse>('/api/settings/industry');

        if (data.industrySlug) {
          const cfg = data.config;
          const aiInsights =
            cfg?.features &&
            typeof cfg.features === 'object' &&
            !Array.isArray(cfg.features) &&
            'aiInsights' in cfg.features
              ? Boolean((cfg.features as Record<string, boolean>).aiInsights)
              : true;
          form.reset({
            industrySlug: data.industrySlug,
            displayName: cfg?.displayName || '',
            enabledModules: [...(cfg?.modules ?? [])],
            primaryObjectLabel: cfg?.primaryObject || '',
            features: {
              enableAnalytics: true,
              enableAIInsights: aiInsights,
              enableRealTimeUpdates: true,
              enableCustomWidgets: false,
            },
          });
          setIndustryConfig(cfg ?? null);
        }
      } catch (error) {
        console.error('Failed to load industry settings:', error);
        toast.error('Failed to load industry settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadIndustrySettings();
  }, []);

  // Handle industry change
  const handleIndustryChange = async (value: string) => {
    form.setValue('industrySlug', value as IndustrySlug);
    
    // Update config preview
    try {
      const response = await fetch(`/api/settings/industry?preview=${value}`);
      const data = (await response.json()) as { config?: IndustryConfig };
      setIndustryConfig(data.config ?? null);
      
      form.setValue('displayName', data.config?.displayName || '');
      form.setValue('primaryObjectLabel', data.config?.primaryObject || '');
      form.setValue('enabledModules', [...(data.config?.modules ?? [])]);
    } catch (error) {
      console.error('Failed to load industry preview:', error);
    }
  };

  // Save settings
  const onSubmit = async (data: IndustrySettingsForm) => {
    setIsSaving(true);
    try {
      await apiJson('/api/settings/industry', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('Industry settings updated successfully');
      onSettingsChange?.(data);
      router.refresh();
    } catch (error) {
      console.error('Failed to save industry settings:', error);
      toast.error('Failed to save industry settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading industry settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industry Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure your industry-specific dashboard and features
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {form.getValues('industrySlug')}
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Configuration</CardTitle>
                  <CardDescription>
                    Select and configure your business industry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="industrySlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Type</FormLabel>
                        <Select onValueChange={handleIndustryChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Commerce & Retail</SelectLabel>
                              <SelectItem value="retail">Retail Store</SelectItem>
                              <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                              <SelectItem value="grocery">Grocery & Food Market</SelectItem>
                              <SelectItem value="one_product">Single Product</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Food & Services</SelectLabel>
                              <SelectItem value="food">Restaurant & Food</SelectItem>
                              <SelectItem value="services">Professional Services</SelectItem>
                              <SelectItem value="real_estate">Real Estate</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Events & Hospitality</SelectLabel>
                              <SelectItem value="events">Events & Experiences</SelectItem>
                              <SelectItem value="travel_hospitality">Travel & Hospitality</SelectItem>
                              <SelectItem value="nightlife">Nightlife & Entertainment</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Specialized</SelectLabel>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="nonprofit">Nonprofit</SelectItem>
                              <SelectItem value="saas">SaaS</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="automotive">Automotive</SelectItem>
                              <SelectItem value="blog_media">Blog & Media</SelectItem>
                              <SelectItem value="creative_portfolio">Creative Portfolio</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines your dashboard layout, widgets, and available features
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {industryConfig && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {React.createElement(INDUSTRY_ICONS[form.getValues('industrySlug')] || Store, {
                            className: 'w-5 h-5 text-green-500',
                          })}
                          <span className="font-semibold">Primary Object</span>
                        </div>
                        <p className="text-2xl font-bold">{industryConfig.primaryObject}</p>
                      </div>

                      <div className="p-4 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <span className="font-semibold">Industry Archetype</span>
                        </div>
                        <p className="text-2xl font-bold capitalize">{industryConfig.archetype || 'Standard'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enabled Modules</CardTitle>
                  <CardDescription>
                    Toggle industry-specific modules on or off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(industryConfig?.modules || []).map((module) => (
                      <FormField
                        key={module}
                        control={form.control}
                        name="enabledModules"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(module);
                          
                          return (
                            <FormItem
                              key={module}
                              className="flex flex-row items-center justify-between rounded-lg border p-4"
                            >
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {industryConfig?.moduleLabels?.[module] || module}
                                </FormLabel>
                                <FormDescription>
                                  {getModuleDescription(module, form.getValues('industrySlug'))}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), module]);
                                    } else {
                                      field.onChange(
                                        (field.value || []).filter((m) => m !== module)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Enable or disable advanced features for your industry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="features.enableAnalytics"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Advanced Analytics</FormLabel>
                          <FormDescription>
                            Track detailed metrics and conversion funnels
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features.enableAIInsights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">AI-Powered Insights</FormLabel>
                          <FormDescription>
                            Get predictive analytics and smart recommendations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features.enableRealTimeUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Real-Time Updates</FormLabel>
                          <FormDescription>
                            Live dashboard updates via WebSocket
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features.enableCustomWidgets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Custom Widgets</FormLabel>
                          <FormDescription>
                            Build and integrate custom dashboard widgets
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Configuration</CardTitle>
                  <CardDescription>
                    Fine-tune industry-specific settings and custom fields
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      These settings are for advanced users. Changes may affect dashboard behavior.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="customFields"
                    render={() => (
                      <FormItem>
                        <FormLabel>Custom Fields Configuration</FormLabel>
                        <FormDescription>
                          Define custom fields specific to your industry
                        </FormDescription>
                        <div className="p-4 border rounded-lg bg-gray-100">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(form.getValues('customFields') || {}, null, 2)}
                          </pre>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSaving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getModuleDescription(module: string, industry: string): string {
  const descriptions: Record<string, string> = {
    catalog: 'Product/service catalog management',
    orders: 'Order processing and fulfillment',
    customers: 'Customer relationship management',
    bookings: 'Appointment and reservation booking',
    inventory: 'Stock and inventory tracking',
    menu: 'Menu management and pricing',
    tables: 'Table management and seating',
    kds: 'Kitchen display system',
    properties: 'Property listings management',
    courses: 'Course creation and management',
    events: 'Event planning and ticketing',
  };

  return descriptions[module] || `${module} management`;
}

export default IndustrySettingsManager;
