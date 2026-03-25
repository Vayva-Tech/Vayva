'use client';
import { Button } from "@vayva/ui";

/**
 * Checkout Flow Add-On Components
 * 
 * Provides complete checkout experience including:
 * - CheckoutForm: Main checkout page with multi-step flow
 * - ShippingForm: Address collection and validation
 * - PaymentMethods: Paystack and other payment integrations
 * - OrderSummary: Cart items and totals display
 * - CheckoutProgress: Step indicator for multi-step checkout
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  CreditCard,
  MapPin,
  User,
  Check,
  ChevronRight,
  Shield,
  Lock,
  Clock,
  Package,
  ChevronLeft,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '../shopping-cart';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'wallet' | 'cod';
  label: string;
  icon: string;
  last4?: string;
  brand?: string;
}

interface CheckoutConfig {
  steps: ('information' | 'shipping' | 'payment' | 'review')[];
  requirePhoneVerification?: boolean;
  enableGuestCheckout?: boolean;
  enableSaveAddress?: boolean;
  defaultCountry?: string;
  shippingRates: ShippingRate[];
}

interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  provider: string;
}

interface CheckoutState {
  step: number;
  shippingAddress: ShippingAddress | null;
  shippingMethod: string | null;
  paymentMethod: string | null;
  isProcessing: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// CHECKOUT FORM (Main Component)
// ============================================================================

interface CheckoutFormProps {
  config?: CheckoutConfig;
  onComplete?: (orderId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function CheckoutForm({ 
  config, 
  onComplete, 
  onError,
  className 
}: CheckoutFormProps) {
  const { items, clearCart } = useCart();
  const [state, setState] = useState<CheckoutState>({
    step: 0,
    shippingAddress: null,
    shippingMethod: null,
    paymentMethod: null,
    isProcessing: false,
    errors: {},
  });

  const steps = config?.steps || ['information', 'shipping', 'payment', 'review'];

  const handleNext = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.min(prev.step + 1, steps.length - 1) }));
  }, [steps.length]);

  const handleBack = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 0) }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const orderId = `ORD_${Date.now()}`;
      clearCart();
      onComplete?.(orderId);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [clearCart, onComplete, onError]);

  if (items.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <div className={cn('max-w-6xl mx-auto', className)}>
      {/* Progress */}
      <CheckoutProgress steps={steps} currentStep={state.step} />

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {steps[state.step] === 'information' && (
                <InformationStep
                  address={state.shippingAddress}
                  onSubmit={(address) => {
                    setState(prev => ({ ...prev, shippingAddress: address }));
                    handleNext();
                  }}
                  config={config}
                />
              )}
              
              {steps[state.step] === 'shipping' && (
                <ShippingStep
                  address={state.shippingAddress!}
                  selectedMethod={state.shippingMethod}
                  rates={config?.shippingRates}
                  onSelect={(method) => setState(prev => ({ ...prev, shippingMethod: method }))}
                  onContinue={handleNext}
                  onBack={handleBack}
                />
              )}
              
              {steps[state.step] === 'payment' && (
                <PaymentStep
                  selectedMethod={state.paymentMethod}
                  onSelect={(method) => setState(prev => ({ ...prev, paymentMethod: method }))}
                  onContinue={handleNext}
                  onBack={handleBack}
                />
              )}
              
              {steps[state.step] === 'review' && (
                <ReviewStep
                  state={state}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  isProcessing={state.isProcessing}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary 
            shippingMethod={config?.shippingRates.find(r => r.id === state.shippingMethod)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHECKOUT PROGRESS
// ============================================================================

interface CheckoutProgressProps {
  steps: string[];
  currentStep: number;
}

function CheckoutProgress({ steps, currentStep }: CheckoutProgressProps) {
  const stepLabels: Record<string, string> = {
    information: 'Information',
    shipping: 'Shipping',
    payment: 'Payment',
    review: 'Review',
  };

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              index < currentStep ? 'bg-green-500 text-white' :
              index === currentStep ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            )}>
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              'ml-2 text-sm hidden sm:block',
              index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {stepLabels[step] || step}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <ChevronRight className={cn(
              'w-4 h-4 mx-2 sm:mx-4',
              index < currentStep ? 'text-green-500' : 'text-muted-foreground'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================================
// INFORMATION STEP
// ============================================================================

interface InformationStepProps {
  address: ShippingAddress | null;
  onSubmit: (address: ShippingAddress) => void;
  config?: CheckoutConfig;
}

function InformationStep({ address, onSubmit, config }: InformationStepProps) {
  const [formData, setFormData] = useState<ShippingAddress>(address || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: config?.defaultCountry || 'NG',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address1.trim()) newErrors.address1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClass = (field: string) => cn(
    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors',
    errors[field] ? 'border-destructive' : 'border-input'
  );

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Contact Information
      </h2>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={inputClass('firstName')}
              placeholder="John"
            />
            {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className={inputClass('lastName')}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={inputClass('email')}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={inputClass('phone')}
              placeholder="+234 801 234 5678"
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => setFormData(prev => ({ ...prev, address1: e.target.value }))}
                className={inputClass('address1')}
                placeholder="123 Main Street"
              />
              {errors.address1 && <p className="text-sm text-destructive mt-1">{errors.address1}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apartment, suite, etc. (optional)</label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData(prev => ({ ...prev, address2: e.target.value }))}
                className={inputClass('address2')}
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={inputClass('city')}
                  placeholder="Lagos"
                />
                {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className={inputClass('state')}
                  placeholder="Lagos"
                />
                {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  className={inputClass('postalCode')}
                  placeholder="100001"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          Your information is securely encrypted
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Shipping
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// SHIPPING STEP
// ============================================================================

interface ShippingStepProps {
  address: ShippingAddress;
  selectedMethod: string | null;
  rates?: ShippingRate[];
  onSelect: (method: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

function ShippingStep({ 
  address, 
  selectedMethod, 
  rates = [],
  onSelect, 
  onContinue, 
  onBack 
}: ShippingStepProps) {
  const defaultRates: ShippingRate[] = [
    { id: 'standard', name: 'Standard Shipping', description: '5-7 business days', price: 2500, estimatedDays: '5-7 days', provider: 'DHL' },
    { id: 'express', name: 'Express Shipping', description: '2-3 business days', price: 5000, estimatedDays: '2-3 days', provider: 'FedEx' },
    { id: 'overnight', name: 'Next Day Delivery', description: 'Next business day', price: 8000, estimatedDays: '1 day', provider: 'UPS' },
  ];

  const shippingRates = rates.length > 0 ? rates : defaultRates;

  return (
    <div className="bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5" />
        Select Shipping Method
      </h2>

      {/* Address Summary */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{address.firstName} {address.lastName}</p>
            <p className="text-sm text-muted-foreground">{address.address1}</p>
            {address.address2 && <p className="text-sm text-muted-foreground">{address.address2}</p>}
            <p className="text-sm text-muted-foreground">{address.city}, {address.state}</p>
            <p className="text-sm text-muted-foreground">{address.phone}</p>
          </div>
          <Button onClick={onBack} className="text-sm text-primary hover:underline">
            Change
          </Button>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="space-y-3">
        {shippingRates.map((rate) => (
          <label
            key={rate.id}
            className={cn(
              'flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
              selectedMethod === rate.id 
                ? 'border-primary bg-primary/5' 
                : 'hover:bg-accent'
            )}
          >
            <input
              type="radio"
              name="shipping"
              value={rate.id}
              checked={selectedMethod === rate.id}
              onChange={() => onSelect(rate.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{rate.name}</p>
                  <p className="text-sm text-muted-foreground">{rate.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {rate.estimatedDays}
                  </p>
                </div>
                <p className="font-semibold">₦{rate.price.toLocaleString()}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {!selectedMethod && (
        <p className="flex items-center gap-2 text-sm text-destructive mt-4">
          <AlertCircle className="w-4 h-4" />
          Please select a shipping method to continue
        </p>
      )}

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onBack}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedMethod}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue to Payment
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PAYMENT STEP
// ============================================================================

interface PaymentStepProps {
  selectedMethod: string | null;
  onSelect: (method: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

function PaymentStep({ selectedMethod, onSelect, onContinue, onBack }: PaymentStepProps) {
  const paymentMethods = [
    { id: 'paystack', name: 'Pay with Card', description: 'Visa, Mastercard, Verve', icon: CreditCard },
    { id: 'bank_transfer', name: 'Bank Transfer', description: 'Transfer to our account', icon: Package },
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive', icon: MapPin },
  ];

  return (
    <div className="bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment Method
      </h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <label
              key={method.id}
              className={cn(
                'flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                selectedMethod === method.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:bg-accent'
              )}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => onSelect(method.id)}
                className="mt-1"
              />
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-6 pt-4 border-t">
        <Lock className="w-4 h-4" />
        All transactions are secure and encrypted
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={onBack}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={!selectedMethod}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Review Order
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// REVIEW STEP
// ============================================================================

interface ReviewStepProps {
  state: CheckoutState;
  onSubmit: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

function ReviewStep({ state, onSubmit, onBack, isProcessing }: ReviewStepProps) {
  const { items } = useCart();

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Review Your Order
        </h2>

        {/* Order Items */}
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground m-auto" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                {item.variant && item.variant.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {item.variant.map(v => `${v.value}`).join(', ')}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Address & Shipping Summary */}
        <div className="mt-6 pt-6 border-t space-y-4">
          {state.shippingAddress && (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Shipping Address</p>
                <p className="text-sm text-muted-foreground">
                  {state.shippingAddress.firstName} {state.shippingAddress.lastName}<br />
                  {state.shippingAddress.address1}<br />
                  {state.shippingAddress.city}, {state.shippingAddress.state}
                </p>
              </div>
              <Button onClick={onBack} className="text-sm text-primary hover:underline">
                Change
              </Button>
            </div>
          )}

          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Payment Method</p>
              <p className="text-sm text-muted-foreground capitalize">
                {state.paymentMethod?.replace('_', ' ')}
              </p>
            </div>
            <Button onClick={onBack} className="text-sm text-primary hover:underline">
              Change
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          disabled={isProcessing}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isProcessing}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Complete Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// ORDER SUMMARY (Sidebar)
// ============================================================================

interface OrderSummaryProps {
  shippingMethod?: ShippingRate;
}

export function OrderSummary({ shippingMethod }: OrderSummaryProps) {
  const { items, subtotal } = useCart();
  const shipping = shippingMethod?.price || 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-card rounded-xl border p-6 sticky top-4">
      <h3 className="font-semibold mb-4">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-4 h-4 text-muted-foreground m-auto" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-sm text-muted-foreground">
            +{items.length - 3} more items
          </p>
        )}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping > 0 ? `₦${shipping.toLocaleString()}` : 'Calculated'}</span>
        </div>
        {shippingMethod && (
          <p className="text-xs text-muted-foreground">{shippingMethod.name}</p>
        )}
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          <span>Fast delivery</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY CHECKOUT
// ============================================================================

function EmptyCheckout() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">
        Add some items to your cart to proceed with checkout.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Continue Shopping
      </a>
    </div>
  );
}

