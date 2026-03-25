'use client';
/**
 * Add-On Detail Modal
 * 
 * Displays full details about an add-on with screenshots,
 * reviews, and installation options.
 */

import React, { useState } from 'react';
import { X, Star, Download, Check, ExternalLink, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ADDON_CATEGORIES, type AddOnDefinition } from '@vayva/addons/types';

interface AddOnDetailModalProps {
  addon: AddOnDefinition;
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  onInstall: () => void;
  storeId: string;
}

export function AddOnDetailModal({
  addon,
  isOpen,
  onClose,
  isInstalled,
  onInstall,
  storeId,
}: AddOnDetailModalProps) {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const screenshots = [addon.previewImages?.thumbnail, ...(addon.previewImages?.screenshots ?? [])].filter(Boolean);
  const categoryLabel = ADDON_CATEGORIES.find(c => c.slug === addon.category)?.label || addon.category;

  const handleInstall = async () => {
    setIsInstalling(true);
    await onInstall();
    setIsInstalling(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 "
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <Button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>

            <ScrollArea className="h-[90vh]">
              <div className="flex flex-col">
                {/* Hero / Screenshots */}
                <div className="relative aspect-video bg-gray-100">
                  {screenshots[activeScreenshot] ? (
                    <img
                      src={screenshots[activeScreenshot]}
                      alt={`${addon.name} screenshot ${activeScreenshot + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {addon.icon}
                    </div>
                  )}

                  {/* Screenshot navigation */}
                  {screenshots.length > 1 && (
                    <>
                      <Button
                        onClick={() => setActiveScreenshot(i => (i - 1 + screenshots.length) % screenshots.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={() => setActiveScreenshot(i => (i + 1) % screenshots.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {screenshots.map((_, i) => (
                          <Button
                            key={i}
                            onClick={() => setActiveScreenshot(i)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              i === activeScreenshot ? "bg-white" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {addon.author?.isOfficial && (
                      <Badge className="bg-green-500 text-green-600-foreground">
                        <Shield className="w-3 h-3 mr-1" />
                        Official
                      </Badge>
                    )}
                    {addon.pricing?.type === 'free' && (
                      <Badge variant="secondary">Free</Badge>
                    )}
                    {addon.pricing?.type === 'subscription' && (
                      <Badge variant="secondary">
                        ${(addon.pricing?.basePrice ?? 0) / 100}/mo
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{categoryLabel}</Badge>
                        <span className="text-sm text-gray-500">v{addon.version}</span>
                      </div>
                      <h2 className="text-2xl font-bold">{addon.name}</h2>
                      <p className="text-gray-500">{addon.tagline}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{addon.stats?.rating ?? 0}</span>
                        </div>
                        <span className="text-xs text-gray-500">{addon.stats?.reviewCount ?? 0} reviews</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Download className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold">{((addon.stats?.installCount ?? 0) / 1000).toFixed(1)}k</span>
                        </div>
                        <span className="text-xs text-gray-500">installs</span>
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-6 p-3 bg-gray-100 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center font-semibold text-green-600">
                      {addon.author?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="font-medium">{addon.author?.name ?? 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {addon.author?.isVerified && 'Verified Developer'}
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="mb-6">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-500 whitespace-pre-line">
                          {addon.description}
                        </p>
                      </div>

                      {(addon.highlights?.length ?? 0) > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Highlights</h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {addon.highlights?.map((highlight, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="features" className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addon.provides?.pages && addon.provides.pages.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Pages</h4>
                            <ul className="space-y-1">
                              {addon.provides.pages.map((page, i) => (
                                <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                                  <ExternalLink className="w-3 h-3" />
                                  {page.title} ({page.route})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {addon.provides?.components && addon.provides.components.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Components</h4>
                            <ul className="space-y-1">
                              {addon.provides.components.slice(0, 5).map((comp, i) => (
                                <li key={i} className="text-sm text-gray-500">
                                  • {comp.componentName} at {comp.mountPoint}
                                </li>
                              ))}
                              {addon.provides.components.length > 5 && (
                                <li className="text-sm text-gray-500">
                                  +{addon.provides.components.length - 5} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {addon.provides?.apiRoutes && addon.provides.apiRoutes.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">API Routes</h4>
                            <ul className="space-y-1">
                              {addon.provides.apiRoutes.slice(0, 3).map((route, i) => (
                                <li key={i} className="text-sm text-gray-500">
                                  • {route.methods.join(',')} {route.path}
                                </li>
                              ))}
                              {addon.provides.apiRoutes.length > 3 && (
                                <li className="text-sm text-gray-500">
                                  +{addon.provides.apiRoutes.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="compatibility" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Compatible Templates</h4>
                          <div className="flex flex-wrap gap-2">
                            {addon.compatibleTemplates.includes('*') ? (
                              <Badge>All Templates</Badge>
                            ) : (
                              addon.compatibleTemplates.slice(0, 20).map(templateId => (
                                <Badge key={templateId} variant="outline">
                                  {templateId}
                                </Badge>
                              ))
                            )}
                            {addon.compatibleTemplates.length > 20 && (
                              <Badge variant="outline">
                                +{addon.compatibleTemplates.length - 20} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {(addon.requires?.length ?? 0) > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Required Add-ons</h4>
                            <div className="flex flex-wrap gap-2">
                              {addon.requires?.map(req => (
                                <Badge key={req} variant="secondary">{req}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          Estimated install time: {addon.installTimeEstimate ?? 5} minutes
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-4">
                      <div className="space-y-4">
                        {(addon.stats?.reviews ?? 0) > 0 ? (
                          <>
                            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
                              <div className="text-3xl font-bold">{addon.stats?.rating?.toFixed(1) ?? '0.0'}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${star <= Math.round(addon.stats?.rating ?? 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`}
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{addon.stats?.reviews ?? 0} reviews</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {/* Sample reviews - in production, fetch from API */}
                              {[
                                { name: "John D.", rating: 5, date: "2 weeks ago", comment: "Excellent add-on, saved us hours of development time." },
                                { name: "Sarah M.", rating: 4, date: "1 month ago", comment: "Great functionality, documentation could be improved." },
                                { name: "Mike R.", rating: 5, date: "2 months ago", comment: "Works perfectly with our setup. Highly recommended!" },
                              ].map((review, idx) => (
                                <div key={idx} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-medium">
                                        {review.name.charAt(0)}
                                      </div>
                                      <span className="font-medium text-sm">{review.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{review.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`w-3 h-3 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`}
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-500">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Footer / Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Last updated: {new Date(addon.stats?.lastUpdated ?? 0).toLocaleDateString()}</span>
                      {addon.docs?.setup && (
                        <a href={addon.docs.setup} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                          Documentation
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isInstalled ? (
                        <Button size="lg" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          Installed
                        </Button>
                      ) : (
                        <Button 
                          size="lg" 
                          onClick={handleInstall}
                          disabled={isInstalling}
                        >
                          {isInstalling ? (
                            <>
                              <span className="animate-spin mr-2">◌</span>
                              Installing...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Install {addon.pricing?.type === 'free' ? 'Free' : `$${(addon.pricing?.basePrice ?? 0) / 100}/mo`}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

