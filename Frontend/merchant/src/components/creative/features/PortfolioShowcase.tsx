'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Image as ImageIcon, 
  Share2, 
  Globe, 
  Eye, 
  Edit3, 
  Trash2,
  Plus,
  ExternalLink,
  Settings,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  clientName?: string;
  projectDate: string;
  services: string[];
  isFeatured: boolean;
  isPublic: boolean;
  testimonial?: string;
}

export default function PortfolioShowcase() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'Acme Corp Website Redesign',
      description: 'Complete brand refresh and e-commerce platform build',
      category: 'Web Design',
      imageUrl: '/placeholder-1.jpg',
      clientName: 'Acme Corp',
      projectDate: '2024-02',
      services: ['Web Design', 'Development', 'Branding'],
      isFeatured: true,
      isPublic: true,
      testimonial: 'Exceptional work! Our conversion rate increased by 45%.'
    },
    {
      id: '2',
      title: 'TechStart Brand Identity',
      description: 'Modern brand system for fintech startup',
      category: 'Branding',
      imageUrl: '/placeholder-2.jpg',
      clientName: 'TechStart',
      projectDate: '2024-01',
      services: ['Logo Design', 'Brand Guidelines', 'Marketing Assets'],
      isFeatured: true,
      isPublic: true,
    },
    {
      id: '3',
      title: 'GlobalRetail Marketing Campaign',
      description: 'Multi-channel social media campaign',
      category: 'Marketing',
      imageUrl: '/placeholder-3.jpg',
      clientName: 'GlobalRetail',
      projectDate: '2023-12',
      services: ['Social Media', 'Content Creation', 'Ad Design'],
      isFeatured: false,
      isPublic: true,
    },
  ]);

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [portfolioSettings, setPortfolioSettings] = useState({
    publicUrl: 'agency.vayva.io/portfolio',
    customDomain: '',
    showPricing: false,
    requirePassword: false,
    password: '',
    enableContactForm: true,
    layout: 'grid' as 'grid' | 'masonry' | 'carousel',
    theme: 'light' as 'light' | 'dark' | 'auto',
  });

  const handleToggleFeatured = (id: string) => {
    setPortfolioItems(items => items.map(item => 
      item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
    ));
    toast.success('Featured status updated');
  };

  const handleTogglePublic = (id: string) => {
    setPortfolioItems(items => items.map(item => 
      item.id === id ? { ...item, isPublic: !item.isPublic } : item
    ));
    toast.success('Visibility updated');
  };

  const handleDelete = (id: string) => {
    setPortfolioItems(items => items.filter(item => item.id !== id));
    toast.success('Portfolio item removed');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(portfolioSettings.publicUrl);
    toast.success('Portfolio URL copied to clipboard');
  };

  const featuredCount = portfolioItems.filter(i => i.isFeatured).length;
  const publicCount = portfolioItems.filter(i => i.isPublic).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Palette className="h-8 w-8 text-green-500" />
            Portfolio Showcase
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage your public portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={() => window.open(portfolioSettings.publicUrl, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Live
          </Button>
          <Button onClick={() => toast.info('Add project modal coming soon')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portfolioItems.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {featuredCount} featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Public Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{publicCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Visible to public
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Portfolio Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-xs text-gray-500 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Settings</CardTitle>
              <CardDescription>
                Customize your public portfolio page
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCustomizer(!showCustomizer)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showCustomizer ? 'Hide' : 'Customize'}
            </Button>
          </div>
        </CardHeader>
        {showCustomizer && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publicUrl">Public URL</Label>
                <Input
                  id="publicUrl"
                  value={portfolioSettings.publicUrl}
                  onChange={(e) => setPortfolioSettings({...portfolioSettings, publicUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain (optional)</Label>
                <Input
                  id="customDomain"
                  placeholder="portfolio.youragency.com"
                  value={portfolioSettings.customDomain}
                  onChange={(e) => setPortfolioSettings({...portfolioSettings, customDomain: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="layout">Layout Style</Label>
                <select
                  id="layout"
                  value={portfolioSettings.layout}
                  onChange={(e) => setPortfolioSettings({...portfolioSettings, layout: e.target.value as any})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="grid">Grid</option>
                  <option value="masonry">Masonry</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={portfolioSettings.theme}
                  onChange={(e) => setPortfolioSettings({...portfolioSettings, theme: e.target.value as any})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Pricing Information</Label>
                  <p className="text-sm text-gray-500">
                    Display project budgets and packages
                  </p>
                </div>
                <Switch
                  checked={portfolioSettings.showPricing}
                  onCheckedChange={(checked) => setPortfolioSettings({...portfolioSettings, showPricing: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Protection</Label>
                  <p className="text-sm text-gray-500">
                    Require password to view portfolio
                  </p>
                </div>
                <Switch
                  checked={portfolioSettings.requirePassword}
                  onCheckedChange={(checked) => setPortfolioSettings({...portfolioSettings, requirePassword: checked})}
                />
              </div>
              {portfolioSettings.requirePassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Portfolio Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={portfolioSettings.password}
                    onChange={(e) => setPortfolioSettings({...portfolioSettings, password: e.target.value})}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Contact Form</Label>
                  <p className="text-sm text-gray-500">
                    Allow visitors to send inquiries
                  </p>
                </div>
                <Switch
                  checked={portfolioSettings.enableContactForm}
                  onCheckedChange={(checked) => setPortfolioSettings({...portfolioSettings, enableContactForm: checked})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Preview</Button>
              <Button onClick={() => toast.success('Portfolio settings saved')}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Portfolio Items Grid */}
      <div className="grid gap-4">
        {portfolioItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                    <CardTitle>{item.title}</CardTitle>
                    {item.isFeatured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                    {item.isPublic ? (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={item.isFeatured ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleFeatured(item.id)}
                  >
                    ⭐
                  </Button>
                  <Button
                    variant={item.isPublic ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTogglePublic(item.id)}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-medium">{item.clientName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{new Date(item.projectDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Services</p>
                  <div className="flex flex-wrap gap-1">
                    {item.services.map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {item.testimonial && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg italic text-sm">
                  "{item.testimonial}"
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
