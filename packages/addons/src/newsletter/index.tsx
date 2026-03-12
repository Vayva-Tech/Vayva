'use client';

/**
 * Newsletter Add-On Components
 * 
 * Provides email subscription and marketing functionality including:
 * - NewsletterSignup: Various signup form styles (inline, popup, footer, sidebar)
 * - NewsletterPopup: Exit-intent and timed popup modal
 * - NewsletterWidget: Floating widget with quick signup
 * - NewsletterPreferences: Subscription preferences management
 * - SubscriberCount: Social proof display
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  X,
  Check,
  Sparkles,
  Gift,
  Bell,
  AlertCircle,
  Loader2,
  Heart,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface NewsletterConfig {
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  successMessage?: string;
  incentive?: {
    enabled: boolean;
    type: 'discount' | 'free_shipping' | 'ebook' | 'guide';
    value?: string;
    description: string;
  };
  doubleOptIn?: boolean;
  tags?: string[];
}

interface SubscriptionState {
  email: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
  subscribedAt?: string;
}

// ============================================================================
// NEWSLETTER SIGNUP (INLINE)
// ============================================================================

interface NewsletterSignupProps {
  config?: NewsletterConfig;
  variant?: 'default' | 'minimal' | 'card' | 'hero';
  className?: string;
  onSubmit?: (email: string) => Promise<void>;
}

export function NewsletterSignup({ 
  config = {}, 
  variant = 'default',
  className,
  onSubmit
}: NewsletterSignupProps) {
  const [state, setState] = useState<SubscriptionState>({
    email: '',
    status: 'idle',
  });

  const defaults: Required<NewsletterConfig> = {
    title: 'Subscribe to our newsletter',
    description: 'Get the latest updates, deals, and exclusive offers delivered to your inbox.',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email',
    successMessage: 'Thanks for subscribing! Check your inbox for confirmation.',
    incentive: {
      enabled: false,
      type: 'discount',
      value: '10%',
      description: 'Get 10% off your first order',
    },
    doubleOptIn: true,
    tags: ['newsletter'],
  };

  const mergedConfig = { ...defaults, ...config };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: 'Please enter a valid email address',
      }));
      return;
    }

    setState(prev => ({ ...prev, status: 'loading' }));

    try {
      if (onSubmit) {
        await onSubmit(state.email);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        status: 'success',
        subscribedAt: new Date().toISOString(),
      }));
    } catch {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: 'Something went wrong. Please try again.',
      }));
    }
  };

  if (state.status === 'success') {
    return (
      <SuccessMessage 
        message={mergedConfig.successMessage}
        className={className}
      />
    );
  }

  const variants = {
    default: 'bg-card border rounded-xl p-6',
    minimal: '',
    card: 'bg-gradient-to-br from-primary/5 to-primary/10 border rounded-2xl p-8',
    hero: 'bg-primary text-primary-foreground rounded-2xl p-8 lg:p-12',
  };

  return (
    <div className={cn(variants[variant], className)}>
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        {variant !== 'minimal' && (
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
            variant === 'hero' ? 'bg-white/20' : 'bg-primary/10'
          )}>
            <Mail className={cn(
              'w-6 h-6',
              variant === 'hero' ? 'text-white' : 'text-primary'
            )} />
          </div>
        )}

        {/* Incentive Badge */}
        {mergedConfig.incentive.enabled && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4',
              variant === 'hero' 
                ? 'bg-white/20 text-white' 
                : 'bg-green-100 text-green-700'
            )}
          >
            <Gift className="w-4 h-4" />
            {mergedConfig.incentive.description}
          </motion.div>
        )}

        {/* Title */}
        <h3 className={cn(
          'font-bold mb-2',
          variant === 'hero' ? 'text-2xl lg:text-3xl' : 'text-xl'
        )}>
          {mergedConfig.title}
        </h3>

        {/* Description */}
        <p className={cn(
          'mb-6',
          variant === 'hero' ? 'text-white/80' : 'text-muted-foreground'
        )}>
          {mergedConfig.description}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5',
                variant === 'hero' ? 'text-white/60' : 'text-muted-foreground'
              )} />
              <input
                type="email"
                value={state.email}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  email: e.target.value,
                  status: 'idle',
                }))}
                placeholder={mergedConfig.placeholder}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-colors',
                  variant === 'hero'
                    ? 'bg-white/20 text-white placeholder:text-white/60 focus:bg-white/30'
                    : 'bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  state.status === 'error' && 'border-destructive focus:border-destructive'
                )}
                disabled={state.status === 'loading'}
              />
            </div>
            
            <button
              type="submit"
              disabled={state.status === 'loading'}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap',
                variant === 'hero'
                  ? 'bg-white text-primary hover:bg-white/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
                state.status === 'loading' && 'opacity-70 cursor-wait'
              )}
            >
              {state.status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Subscribing...</span>
                </>
              ) : (
                <>
                  {mergedConfig.buttonText}
                  <ArrowRight className="w-4 h-4 hidden sm:block" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {state.status === 'error' && state.errorMessage && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {state.errorMessage}
            </p>
          )}
        </form>

        {/* Trust Note */}
        <p className={cn(
          'text-xs mt-4',
          variant === 'hero' ? 'text-white/60' : 'text-muted-foreground'
        )}>
          No spam, unsubscribe at any time. We respect your privacy.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUCCESS MESSAGE
// ============================================================================

function SuccessMessage({ message, className }: { message: string; className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('bg-green-50 border border-green-200 rounded-xl p-6 text-center', className)}
    >
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-6 h-6 text-green-600" />
      </div>
      <h4 className="font-semibold text-green-800 mb-2">You&apos;re Subscribed!</h4>
      <p className="text-green-700">{message}</p>
    </motion.div>
  );
}

// ============================================================================
// NEWSLETTER POPUP
// ============================================================================

interface NewsletterPopupProps {
  config?: NewsletterConfig;
  trigger?: 'exit_intent' | 'time_delay' | 'scroll_percentage';
  delayMs?: number;
  scrollPercentage?: number;
  showOnce?: boolean;
  cookieDurationDays?: number;
  className?: string;
}

export function NewsletterPopup({
  config,
  trigger = 'exit_intent',
  delayMs = 5000,
  scrollPercentage = 50,
  showOnce = true,
  cookieDurationDays = 7,
  className
}: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown
    if (showOnce) {
      const shown = localStorage.getItem('newsletter_popup_shown');
      const shownDate = shown ? new Date(shown) : null;
      const now = new Date();
      
      if (shownDate && (now.getTime() - shownDate.getTime()) < cookieDurationDays * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    if (trigger === 'time_delay') {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }

    if (trigger === 'exit_intent') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY < 10 && !hasShown) {
          setIsVisible(true);
          setHasShown(true);
          if (showOnce) {
            localStorage.setItem('newsletter_popup_shown', new Date().toISOString());
          }
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }

    if (trigger === 'scroll_percentage') {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= scrollPercentage && !hasShown) {
          setIsVisible(true);
          setHasShown(true);
          if (showOnce) {
            localStorage.setItem('newsletter_popup_shown', new Date().toISOString());
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [trigger, delayMs, scrollPercentage, showOnce, hasShown, cookieDurationDays]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50',
              className
            )}
          >
            <div className="bg-background rounded-2xl shadow-2xl overflow-hidden mx-4">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-5">
                {/* Image Side */}
                <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
                  <div className="h-full flex flex-col justify-center">
                    <Gift className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Join Our Community</h3>
                    <p className="text-white/80 text-sm">
                      Get exclusive deals, early access to sales, and expert tips.
                    </p>
                  </div>
                </div>

                {/* Form Side */}
                <div className="col-span-3 p-6 md:p-8">
                  <NewsletterSignup 
                    config={config} 
                    variant="minimal"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// NEWSLETTER WIDGET (Floating)
// ============================================================================

interface NewsletterWidgetProps {
  config?: NewsletterConfig;
  position?: 'bottom_right' | 'bottom_left';
  className?: string;
}

export function NewsletterWidget({ 
  config, 
  position = 'bottom_right',
  className 
}: NewsletterWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const positionClasses = {
    bottom_right: 'right-4',
    bottom_left: 'left-4',
  };

  if (isSubscribed) return null;

  return (
    <div className={cn('fixed bottom-4 z-40', positionClasses[position], className)}>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-background rounded-xl shadow-xl border p-4 w-80"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-medium">Stay Updated</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <NewsletterSignup
              config={{
                ...config,
                title: undefined,
                description: 'Get notified about new products and offers.',
                buttonText: 'Join',
              }}
              variant="minimal"
            />
          </motion.div>
        ) : (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Subscribe</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUBSCRIBER COUNT (Social Proof)
// ============================================================================

interface SubscriberCountProps {
  count: number;
  className?: string;
}

export function SubscriberCount({ count, className }: SubscriberCountProps) {
  const formatCount = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 border-2 border-background"
          />
        ))}
      </div>
      <span>
        Join <span className="font-semibold text-foreground">{formatCount(count)}+</span> subscribers
      </span>
    </div>
  );
}

// ============================================================================
// NEWSLETTER PREFERENCES (Settings)
// ============================================================================

interface NewsletterPreferencesProps {
  email: string;
  preferences: {
    marketing: boolean;
    promotions: boolean;
    newProducts: boolean;
    blogUpdates: boolean;
  };
  onUpdate: (preferences: NewsletterPreferencesProps['preferences']) => void;
  onUnsubscribe: () => void;
  className?: string;
}

export function NewsletterPreferences({
  email,
  preferences,
  onUpdate,
  onUnsubscribe,
  className
}: NewsletterPreferencesProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onUpdate(localPrefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const categories = [
    { key: 'marketing' as const, label: 'Marketing Emails', description: 'General marketing and brand updates' },
    { key: 'promotions' as const, label: 'Promotions & Sales', description: 'Exclusive deals and limited-time offers' },
    { key: 'newProducts' as const, label: 'New Products', description: 'Be the first to know about new arrivals' },
    { key: 'blogUpdates' as const, label: 'Blog Updates', description: 'Latest articles, guides, and tips' },
  ];

  return (
    <div className={cn('bg-card rounded-xl border p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Email Preferences</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map(({ key, label, description }) => (
          <label
            key={key}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              checked={localPrefs[key]}
              onChange={() => handleToggle(key)}
              className="mt-1 rounded border-input"
            />
            <div className="flex-1">
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <button
          onClick={handleSave}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            isSaved 
              ? 'bg-green-100 text-green-700' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {isSaved ? 'Saved!' : 'Save Preferences'}
        </button>

        <button
          onClick={onUnsubscribe}
          className="text-sm text-destructive hover:underline"
        >
          Unsubscribe from all
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// FOOTER NEWSLETTER
// ============================================================================

interface FooterNewsletterProps {
  config?: NewsletterConfig;
  className?: string;
}

export function FooterNewsletter({ config, className }: FooterNewsletterProps) {
  return (
    <div className={cn('', className)}>
      <NewsletterSignup
        config={{
          ...config,
          title: 'Subscribe to our newsletter',
          description: 'Get updates on new products and exclusive offers.',
        }}
        variant="minimal"
      />
    </div>
  );
}

// ============================================================================
// SOCIAL PROOF NEWSLETTER (With stats)
// ============================================================================

interface SocialProofNewsletterProps {
  subscriberCount: number;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  config?: NewsletterConfig;
  className?: string;
}

export function SocialProofNewsletter({
  subscriberCount,
  testimonial,
  config,
  className
}: SocialProofNewsletterProps) {
  return (
    <div className={cn('bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8', className)}>
      <div className="max-w-2xl mx-auto text-center">
        <SubscriberCount count={subscriberCount} className="justify-center mb-6" />
        
        <NewsletterSignup
          config={{
            ...config,
            title: 'Join the Community',
          }}
          variant="minimal"
        />

        {testimonial && (
          <blockquote className="mt-8 pt-8 border-t border-primary/10">
            <p className="text-muted-foreground italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
            <footer>
              <p className="font-medium">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </footer>
          </blockquote>
        )}
      </div>
    </div>
  );
}
