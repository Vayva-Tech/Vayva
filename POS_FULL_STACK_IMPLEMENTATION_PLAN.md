# 🏪 Universal Point of Sale (POS) System - Full Stack Implementation Plan

## Executive Summary

This document outlines the complete implementation strategy for industry-specific POS systems across the Vayva platform, covering:
- **Frontend UI/UX Design System** (React + Next.js + Tailwind)
- **Backend Fastify API Architecture** (TypeScript + Prisma)
- **Integration Patterns** (API contracts, state management, real-time sync)
- **35+ Industry Vertical Coverage** with tailored checkout flows

---

## 📊 Current State Analysis

### ✅ Existing Infrastructure

#### Frontend (Merchant Dashboard)
- **Design System**: `@vayva/ui` component library with shadcn/radix primitives
- **Theming**: Industry-based design categories (signature, glass, bold, dark, natural)
- **State Management**: React hooks + context providers
- **API Client**: Axios-based client with interceptors
- **Tailwind Config**: Unified preset (`vayvaPreset`) across all apps

#### Backend (Fastify Server)
- **Service Architecture**: Class-based services (e.g., `OrdersService`, `CheckoutService`)
- **Route Pattern**: RESTful v1 API with Zod validation
- **Authentication**: JWT via `@fastify/jwt` with preHandler hooks
- **Database**: Prisma ORM with PostgreSQL
- **Existing Routes**: 60+ route files covering commerce, finance, industries

#### POS Foundation
- **Package**: `@vayva/pos` (sync service + cash management)
- **UI Page**: `/dashboard/pos` (retail-focused stats + transactions)
- **Mobile Screen**: Retail POS with barcode scanning
- **Gap**: One-size-fits-all approach doesn't serve salons, restaurants, healthcare

---

## 🎯 Strategic Architecture Decision

### Hybrid Approach: Core Engine + Industry Adapters

```
┌─────────────────────────────────────────────────────────┐
│              @vayva/pos-core (Shared Logic)             │
│  • Checkout State Machine                               │
│  • Payment Processing                                   │
│  • Tax Calculation                                      │
│  • Discount Engine                                      │
│  • Receipt Generation                                   │
│  • Offline Queue                                        │
└─────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ pos-retail       │ │ pos-restaurant   │ │ pos-beauty       │
│ • Barcode scan   │ │ • Table orders   │ │ • Service + prod │
│ • Quick cart     │ │ • Course firing  │ │ • Staff booking  │
│ • Layaway        │ │ • Split bills    │ │ • Deposits       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🏗️ Phase 1: Core Infrastructure (Weeks 1-2)

### 1.1 Database Schema Enhancements

**File**: `packages/db/prisma/schema.prisma`

```prisma
// New Models for Universal POS

model POSTable {
  id              String   @id @default(cuid())
  storeId         String
  type            String   // PRODUCT | SERVICE | TIME_SLOT | BUNDLE
  productId       String?
  serviceId       String?
  name            String
  price           Decimal
  taxCategory     String?
  metadata        Json?
  createdAt       DateTime @default(now())
  
  // Relations
  store           Store    @relation(fields: [storeId], references: [id])
  product         Product? @relation(fields: [productId], references: [id])
  lineItems       POSLineItem[]
}

model POSOrder {
  id              String   @id @default(cuid())
  storeId         String
  orderId         String?  // Link to existing Order model
  tableId         String?  // For restaurants
  customerId      String?
  cashierId       String?
  status          String   // DRAFT | COMPLETED | VOIDED | REFUNDED
  
  // Pricing
  subtotal        Decimal
  tax             Decimal
  discount        Decimal
  tip             Decimal?
  serviceCharge   Decimal?
  total           Decimal
  
  // Payment
  paymentMethod   String?
  paymentStatus   String   // UNPAID | PARTIAL | PAID | REFUNDED
  splitPayments   Json?    // [{method: "cash", amount: 5000}, {method: "card", amount: 10000}]
  
  // Metadata
  receiptNumber   String?
  notes           String?
  metadata        Json?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  store           Store    @relation(fields: [storeId], references: [id])
  items           POSLineItem[]
  payments        POSPayment[]
}

model POSLineItem {
  id              String   @id @default(cuid())
  orderId         String
  posItemId       String
  quantity        Int
  unitPrice       Decimal
  discount        Decimal  @default(0)
  tax             Decimal  @default(0)
  subtotal        Decimal
  notes           String?
  modifiers       Json?    // Extra cheese, No onions, etc.
  
  order           POSOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  posItem         POSTable @relation(fields: [posItemId], references: [id])
}

model POSPayment {
  id              String   @id @default(cuid())
  orderId         String
  method          String   // CASH | CARD | TRANSFER | WALLET | SPLIT
  amount          Decimal
  reference       String?  // Paystack ref, transaction ID
  status          String   // PENDING | COMPLETED | FAILED | REFUNDED
  metadata        Json?
  createdAt       DateTime @default(now())
  
  order           POSOrder @relation(fields: [orderId], references: [id])
}

model CashSession {
  // Already exists but needs enhancement
  id              String   @id @default(cuid())
  storeId         String
  deviceId        String
  cashierId       String?
  status          String   // OPEN | CLOSED | RECONCILED
  openingFloat    Decimal
  closingFloat    Decimal?
  expectedFloat   Decimal?
  variance        Decimal?
  totalCashSales  Decimal  @default(0)
  totalCashRefunds Decimal @default(0)
  totalPaidIn     Decimal  @default(0)
  totalPaidOut    Decimal  @default(0)
  openedAt        DateTime @default(now())
  closedAt        DateTime?
  reconciledAt    DateTime?
  notes           String?
  
  movements       CashMovement[]
}
```

### 1.2 Backend Service Layer

**File**: `Backend/fastify-server/src/services/pos/pos-core.service.ts`

```typescript
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { z } from 'zod';

// Validation Schemas
const CreatePOSTableSchema = z.object({
  storeId: z.string(),
  type: z.enum(['PRODUCT', 'SERVICE', 'TIME_SLOT', 'BUNDLE']),
  productId: z.string().optional(),
  name: z.string(),
  price: z.number(),
  taxCategory: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const CreatePOSOrderSchema = z.object({
  storeId: z.string(),
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(z.object({
    posItemId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number(),
    discount: z.number().optional(),
    notes: z.string().optional(),
    modifiers: z.array(z.object({
      name: z.string(),
      value: z.string(),
      price: z.number().optional(),
    })).optional(),
  })),
  paymentMethod: z.string().optional(),
  splitPayments: z.array(z.object({
    method: z.string(),
    amount: z.number(),
  })).optional(),
  tip: z.number().optional(),
  serviceCharge: z.number().optional(),
  notes: z.string().optional(),
});

export class POSCoreService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a POS-able item (product, service, or time slot)
   */
  async createPOSTable(data: z.infer<typeof CreatePOSTableSchema>) {
    const parsed = CreatePOSTableSchema.parse(data);
    
    const posItem = await this.db.pOSTable.create({
      data: parsed,
    });

    logger.info(`[POS] Created POSTable ${posItem.id}`);
    return posItem;
  }

  /**
   * Get all POS items for a store
   */
  async getStorePOSItems(storeId: string, filters?: { type?: string; search?: string }) {
    const where: any = { storeId };
    
    if (filters?.type) {
      where.type = filters.type;
    }
    
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return this.db.pOSTable.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create POS order from cart
   */
  async createPOSOrder(data: z.infer<typeof CreatePOSOrderSchema>) {
    const parsed = CreatePOSOrderSchema.parse(data);
    
    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of parsed.items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      const itemTax = (itemSubtotal - itemDiscount) * 0.075; // 7.5% VAT
      
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    }

    const tip = parsed.tip || 0;
    const serviceCharge = parsed.serviceCharge || 0;
    const total = subtotal - totalDiscount + totalTax + tip + serviceCharge;

    // Create order
    const order = await this.db.pOSOrder.create({
      data: {
        storeId: parsed.storeId,
        tableId: parsed.tableId,
        customerId: parsed.customerId,
        status: 'COMPLETED',
        paymentMethod: parsed.paymentMethod,
        paymentStatus: parsed.splitPayments ? 'PARTIAL' : parsed.paymentMethod ? 'PAID' : 'UNPAID',
        splitPayments: parsed.splitPayments,
        subtotal,
        tax: totalTax,
        discount: totalDiscount,
        tip,
        serviceCharge,
        total,
        receiptNumber: `POS-${Date.now()}`,
        notes: parsed.notes,
        items: {
          create: parsed.items.map(item => ({
            posItemId: item.posItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            subtotal: item.quantity * item.unitPrice,
            notes: item.notes,
            modifiers: item.modifiers,
          })),
        },
      },
      include: {
        items: {
          include: {
            posItem: true,
          },
        },
      },
    });

    logger.info(`[POS] Created order ${order.id} with total ₦${total}`);
    return order;
  }

  /**
   * Process split payment
   */
  async processSplitPayment(orderId: string, payments: Array<{ method: string; amount: number }>) {
    const order = await this.db.pOSOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (Math.abs(totalPaid - Number(order.total)) > 0.01) {
      throw new Error(`Payment amounts don't match order total. Expected: ₦${order.total}, Got: ₦${totalPaid}`);
    }

    // Create payment records
    const createdPayments = await Promise.all(
      payments.map(payment => 
        this.db.pOSPayment.create({
          data: {
            orderId,
            method: payment.method,
            amount: payment.amount,
            status: 'COMPLETED',
          },
        })
      )
    );

    // Update order status
    await this.db.pOSOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        payments: {
          connect: createdPayments.map(p => ({ id: p.id })),
        },
      },
    });

    logger.info(`[POS] Processed split payment for order ${orderId}`);
    return createdPayments;
  }

  /**
   * Generate receipt
   */
  async generateReceipt(orderId: string) {
    const order = await this.db.pOSOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            posItem: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Format receipt data
    const receipt = {
      receiptNumber: order.receiptNumber,
      storeName: 'Store Name', // Fetch from store
      date: order.createdAt,
      items: order.items.map(item => ({
        name: item.posItem.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      tip: order.tip,
      serviceCharge: order.serviceCharge,
      total: order.total,
      payments: order.payments.map(payment => ({
        method: payment.method,
        amount: payment.amount,
      })),
      balance: 0,
    };

    return receipt;
  }
}

export const posCoreService = new POSCoreService();
```

### 1.3 Fastify Routes

**File**: `Backend/fastify-server/src/routes/api/v1/pos/pos-core.routes.ts`

```typescript
import { FastifyPluginAsync } from 'fastify';
import { posCoreService } from '../../../services/pos/pos-core.service';
import { z } from 'zod';

const posCoreRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/pos/items
   * Get all POS items for store
   */
  server.get('/items', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const { type, search } = request.query as { type?: string; search?: string };

      try {
        const items = await posCoreService.getStorePOSItems(user.storeId, { type, search });
        return reply.send({ success: true, data: items, count: items.length });
      } catch (error) {
        server.log.error({ error }, 'Failed to fetch POS items');
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch items' 
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/items
   * Create a new POS item
   */
  server.post('/items', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const body = request.body as any;

      try {
        const item = await posCoreService.createPOSTable({
          ...body,
          storeId: user.storeId,
        });
        return reply.code(201).send({ success: true, data: item });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create item' 
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/orders
   * Create POS order
   */
  server.post('/orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const user = request.user as { storeId: string };
      const body = request.body as any;

      try {
        const order = await posCoreService.createPOSOrder({
          ...body,
          storeId: user.storeId,
        });
        return reply.code(201).send({ success: true, data: order });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create order' 
        });
      }
    },
  });

  /**
   * POST /api/v1/pos/orders/:orderId/payments/split
   * Process split payment
   */
  server.post('/orders/:orderId/payments/split', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { orderId } = request.params as { orderId: string };
      const { payments } = request.body as { payments: Array<{ method: string; amount: number }> };

      try {
        const result = await posCoreService.processSplitPayment(orderId, payments);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process payment' 
        });
      }
    },
  });

  /**
   * GET /api/v1/pos/orders/:orderId/receipt
   * Generate receipt
   */
  server.get('/orders/:orderId/receipt', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { orderId } = request.params as { orderId: string };

      try {
        const receipt = await posCoreService.generateReceipt(orderId);
        return reply.send({ success: true, data: receipt });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Receipt not found' 
        });
      }
    },
  });
};

export default posCoreRoutes;
```

---

## 🎨 Phase 2: Frontend UI Components (Weeks 3-4)

### 2.1 POS Component Architecture

```
Frontend/merchant/src/components/pos/
├── POSProvider.tsx              # Context provider for POS state
├── universal/
│   ├── POSCart.tsx              # Shared cart component
│   ├── POSCheckout.tsx          # Checkout flow wrapper
│   ├── POSPaymentSelector.tsx   # Payment method selection
│   ├── POSReceipt.tsx           # Receipt display/print
│   └── POSSplitPayment.tsx      # Split payment UI
├── retail/
│   ├── RetailPOS.tsx            # Main retail POS screen
│   ├── BarcodeScanner.tsx       # Barcode scanning
│   ├── QuickProductGrid.tsx     # Grid of products
│   └── RetailCart.tsx           # Retail-specific cart
├── restaurant/
│   ├── RestaurantPOS.tsx        # Restaurant POS screen
│   ├── TableSelector.tsx        # Floor plan / table picker
│   ├── CourseFiring.tsx         # Appetizer → Main → Dessert
│   ├── SplitBill.tsx            # Split by seat/item
│   └── KitchenTicketPreview.tsx # KDS preview
├── beauty/
│   ├── BeautyPOS.tsx            # Salon POS screen
│   ├── ServiceSelector.tsx      # Service menu with duration
│   ├── StaffSelector.tsx        # Choose stylist/therapist
│   ├── DateTimePicker.tsx       # Booking scheduler
│   └── DepositCalculator.tsx    # Deposit vs balance
└── shared/
    ├── POSTenderKeypad.tsx      # Numeric keypad for amounts
    ├── POSCustomerSelector.tsx  # Customer lookup/add
    ├── POSDiscountModal.tsx     % Apply discounts
    └── POSNotesModal.tsx        # Add order notes
```

### 2.2 Universal POS Context

**File**: `Frontend/merchant/src/components/pos/POSProvider.tsx`

```typescript
'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface POSCartItem {
  posItemId: string;
  type: 'PRODUCT' | 'SERVICE' | 'TIME_SLOT' | 'BUNDLE';
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  notes?: string;
  modifiers?: Array<{ name: string; value: string; price?: number }>;
}

interface POSState {
  cart: POSCartItem[];
  customer?: { id: string; name: string };
  tableId?: string;          // For restaurants
  staffId?: string;          // For salons
  scheduledTime?: Date;      // For bookings
  discountCode?: string;
  discountAmount?: number;
  tip?: number;
  serviceCharge?: number;
  notes?: string;
}

type POSAction =
  | { type: 'ADD_ITEM'; payload: POSCartItem }
  | { type: 'REMOVE_ITEM'; payload: { index: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'SET_CUSTOMER'; payload: { id: string; name: string } | undefined }
  | { type: 'SET_TABLE'; payload: string | undefined }
  | { type: 'SET_STAFF'; payload: string | undefined }
  | { type: 'SET_SCHEDULED_TIME'; payload: Date | undefined }
  | { type: 'SET_DISCOUNT'; payload: { code?: string; amount?: number } }
  | { type: 'SET_TIP'; payload: number | undefined }
  | { type: 'SET_SERVICE_CHARGE'; payload: number | undefined }
  | { type: 'SET_NOTES'; payload: string | undefined }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState: POSState = {
  cart: [],
};

// Reducer
function posReducer(state: POSState, action: POSAction): POSState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, cart: [...state.cart, action.payload] };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter((_, i) => i !== action.payload.index),
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item, i) =>
          i === action.payload.index
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    
    case 'SET_TABLE':
      return { ...state, tableId: action.payload };
    
    case 'SET_STAFF':
      return { ...state, staffId: action.payload };
    
    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload };
    
    case 'SET_DISCOUNT':
      return { ...state, discountCode: action.payload.code, discountAmount: action.payload.amount };
    
    case 'SET_TIP':
      return { ...state, tip: action.payload };
    
    case 'SET_SERVICE_CHARGE':
      return { ...state, serviceCharge: action.payload };
    
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    
    case 'CLEAR_CART':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Context
const POSContext = createContext<{
  state: POSState;
  dispatch: React.Dispatch<POSAction>;
  addItem: (item: POSCartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  calculateTotals: () => { subtotal: number; tax: number; discount: number; total: number };
  clearCart: () => void;
} | null>(null);

// Provider
export function POSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  const addItem = (item: POSCartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (index: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { index } });
  };

  const updateQuantity = (index: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  };

  const calculateTotals = () => {
    const subtotal = state.cart.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      const modifierTotal = item.modifiers?.reduce((mSum, mod) => mSum + (mod.price || 0), 0) || 0;
      return sum + itemTotal + modifierTotal;
    }, 0);

    const discount = state.discountAmount || 0;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.075; // 7.5% VAT
    const tip = state.tip || 0;
    const serviceCharge = state.serviceCharge || 0;
    const total = taxableAmount + tax + tip + serviceCharge;

    return { subtotal, tax, discount, tip, serviceCharge, total };
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <POSContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        calculateTotals,
        clearCart,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

// Hook
export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
}
```

### 2.3 Industry-Specific POS Screens

**File**: `Frontend/merchant/src/components/pos/retail/RetailPOS.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '../POSProvider';
import { Button } from '@vayva/ui';
import { Search, ShoppingCart, CreditCard, ScanBarcode } from 'lucide-react';
import { api } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  barcode?: string;
  imageUrl?: string;
  stock: number;
}

export function RetailPOS() {
  const { state, addItem, removeItem, updateQuantity, calculateTotals, clearCart } = usePOS();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/api/v1/pos/items?type=PRODUCT');
      setProducts(response.data || []);
    } catch (error) {
      console.error('[RetailPOS] Failed to load products:', error);
    }
  };

  // Handle barcode scan
  useEffect(() => {
    if (barcode.length > 8) {
      const product = products.find(p => p.barcode === barcode);
      if (product) {
        handleAddToCart(product);
        setBarcode('');
      }
    }
  }, [barcode]);

  const handleAddToCart = (product: Product) => {
    addItem({
      posItemId: product.id,
      type: 'PRODUCT',
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { total } = calculateTotals();
      
      const response = await api.post('/api/v1/pos/orders', {
        items: state.cart.map(item => ({
          posItemId: item.posItemId,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount,
          notes: item.notes,
        })),
        paymentMethod: 'card',
        total,
      });

      if (response.success) {
        alert(`Order completed! Total: ₦${total.toLocaleString()}`);
        clearCart();
      }
    } catch (error) {
      alert('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { subtotal, tax, discount, total } = calculateTotals();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left: Product Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Scan barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-64 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAddToCart(product)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.sku}</p>
              <p className="text-lg font-bold text-green-600 mt-2">
                ₦{product.price.toLocaleString()}
              </p>
              {product.stock < 10 && (
                <p className="text-xs text-orange-600 mt-1">Low stock ({product.stock})</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {state.cart.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to start an order</p>
            </div>
          ) : (
            state.cart.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-200 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (7.5%):</span>
            <span>₦{tax.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₦{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
            <span>Total:</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={state.cart.length === 0 || isProcessing}
            className="w-full py-6 text-lg font-bold"
          >
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 Phase 3: Integration Patterns (Week 5)

### 3.1 API Contract Standardization

All POS endpoints follow this pattern:

```typescript
// Request/Response Standard Format

// CREATE ORDER REQUEST
{
  "storeId": "store_123",
  "items": [
    {
      "posItemId": "item_456",
      "quantity": 2,
      "unitPrice": 5000,
      "discount": 500,
      "notes": "No onions"
    }
  ],
  "customer": { "id": "cust_789" },
  "tableId": "table_01",  // Optional
  "paymentMethod": "split",
  "splitPayments": [
    { "method": "cash", "amount": 5000 },
    { "method": "card", "amount": 4500 }
  ],
  "tip": 1000,
  "serviceCharge": 0.10,  // 10%
  "notes": "Birthday celebration"
}

// CREATE ORDER RESPONSE
{
  "success": true,
  "data": {
    "id": "pos_order_abc",
    "receiptNumber": "POS-20260328-001",
    "status": "COMPLETED",
    "total": 10500,
    "items": [...],
    "payments": [...]
  }
}

// ERROR RESPONSE
{
  "success": false,
  "error": "Insufficient stock for item XYZ",
  "details": {
    "itemId": "item_456",
    "requested": 10,
    "available": 3
  }
}
```

### 3.2 Real-Time Sync Strategy

For multi-device scenarios (multiple cashiers, kitchen displays):

```typescript
// Frontend: WebSocket hook for real-time updates
'use client';

import { useEffect, useState } from 'react';

export function usePOSWebSocket(storeId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/pos/${storeId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setConnected(true);
      console.log('[POS WS] Connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'ORDER_CREATED':
          // Play sound, show notification
          playOrderSound();
          break;
        case 'INVENTORY_UPDATE':
          // Refresh product list
          refreshProducts();
          break;
        case 'TABLE_STATUS_CHANGE':
          // Update floor plan
          updateTableStatus(data.tableId, data.status);
          break;
      }
    };

    websocket.onclose = () => {
      setConnected(false);
      console.log('[POS WS] Disconnected');
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        console.log('[POS WS] Reconnecting...');
      }, 5000);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [storeId]);

  return { connected, ws };
}
```

### 3.3 Offline-First Architecture

```typescript
// Local storage queue for offline orders
class POSOfflineQueue {
  private queueKey = 'pos_offline_orders';

  async addOrder(orderData: any) {
    const queue = await this.getQueue();
    queue.push({
      ...orderData,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    });
    await this.saveQueue(queue);
  }

  async syncOrders() {
    const queue = await this.getQueue();
    const failed: any[] = [];

    for (const item of queue) {
      try {
        await api.post('/api/v1/pos/orders', item.orderData);
        // Remove from queue on success
      } catch (error) {
        // Keep for retry
        if (item.retryCount < 3) {
          item.retryCount++;
          failed.push(item);
        }
      }
    }

    await this.saveQueue(failed);
  }

  private async getQueue() {
    const stored = localStorage.getItem(this.queueKey);
    return stored ? JSON.parse(stored) : [];
  }

  private async saveQueue(queue: any[]) {
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }
}

export const posOfflineQueue = new POSOfflineQueue();
```

---

## 📦 Phase 4: Industry Rollout Plan (Weeks 6-10)

### Week 6: Retail Enhancement
- ✅ Barcode scanning integration
- ✅ Quick product grid with categories
- ✅ Layaway/payment plans
- ✅ Gift cards/store credit
- ✅ Returns/exchanges flow

### Week 7: Restaurant Counter POS
- ✅ Quick service ordering
- ✅ Menu modifiers (extra cheese, no onions)
- ✅ Order type selector (dine-in, takeout, delivery)
- ✅ Kitchen ticket auto-print
- ✅ Combo meals builder

### Week 8: Beauty/Salon POS
- ✅ Service + product bundling
- ✅ Staff/stylist selection
- ✅ Appointment scheduling
- ✅ Deposit collection (50% now, 50% after)
- ✅ Tip allocation

### Week 9: Events/Nightlife POS
- ✅ Walk-in ticketing
- ✅ VIP upgrades
- ✅ Bottle service with mixers
- ✅ Guest list management
- ✅ Happy hour pricing rules

### Week 10: Healthcare/Education
- ✅ Consultation fees
- ✅ Insurance co-pay tracking
- ✅ Course enrollment
- ✅ Certificate issuance
- ✅ Installment payment plans

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```typescript
// packages/pos/src/__tests__/pos-core.test.ts
import { describe, it, expect } from 'vitest';
import { posCoreService } from '../pos-core.service';

describe('POSCoreService', () => {
  it('should create POSTable item', async () => {
    const item = await posCoreService.createPOSTable({
      storeId: 'store_123',
      type: 'PRODUCT',
      name: 'Test Product',
      price: 5000,
    });
    
    expect(item).toHaveProperty('id');
    expect(item.name).toBe('Test Product');
  });

  it('should calculate split payment correctly', async () => {
    const payments = await posCoreService.processSplitPayment('order_123', [
      { method: 'cash', amount: 5000 },
      { method: 'card', amount: 5000 },
    ]);
    
    expect(payments).toHaveLength(2);
  });
});
```

### Integration Tests (Playwright)
```typescript
// tests/e2e/pos/retail-checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Retail POS Checkout', () => {
  test('complete flow: add to cart → checkout → receipt', async ({ page }) => {
    await page.goto('/dashboard/pos/retail');
    
    // Add product to cart
    await page.click('[data-product="product_123"]');
    
    // Verify cart shows item
    await expect(page.locator('[data-cart-item]')).toHaveCount(1);
    
    // Complete checkout
    await page.click('[data-button="checkout"]');
    
    // Wait for success modal
    await expect(page.locator('[data-modal="success"]')).toBeVisible();
    
    // Print receipt
    await page.click('[data-button="print-receipt"]');
  });
});
```

---

## 🚀 Deployment Strategy

### Environment Configuration
```env
# .env.production
NEXT_PUBLIC_POS_ENABLED=true
NEXT_PUBLIC_POS_HARDWARE_INTEGRATION=false  # Enable later phase
BACKEND_API_URL=https://api.vayva.ng
NEXT_PUBLIC_WS_URL=wss://ws.vayva.ng
PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

### Feature Flags
```typescript
// Gradual rollout by industry
const POS_FEATURE_FLAGS = {
  retail: true,
  restaurant: true,
  beauty: false,      // Beta
  healthcare: false,  // Coming soon
  education: false,   // Coming soon
};
```

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Transaction Time | < 2 minutes | Average checkout duration |
| Error Rate | < 1% | Failed transactions / total |
| Adoption Rate | 60% in 3 months | Active POS users / total merchants |
| Offline Resilience | 100% data sync | Successful reconnection rate |
| Hardware Compatibility | 95% | Success rate with printers/scanners |

---

## ⚠️ Risk Mitigation

### Technical Risks
1. **Database Migration Complexity**
   - Solution: Phased rollout with feature flags
   - Rollback: Maintain legacy tables for 30 days

2. **Performance Degradation**
   - Solution: Redis caching for product catalog
   - Monitoring: Sentry APM with custom POS dashboards

3. **Offline Data Loss**
   - Solution: IndexedDB for robust local storage
   - Backup: Auto-sync every 5 minutes when online

### Business Risks
1. **Merchant Adoption Resistance**
   - Solution: Free trial period + training webinars
   - Incentive: 50% discount on first month

2. **Support Overload**
   - Solution: Comprehensive documentation + video tutorials
   - Self-service: Interactive demo environment

---

## 📝 Next Steps

### Immediate Actions (This Week)
1. ✅ **Create GitHub Issue** - Tag team leads for review
2. ✅ **Schedule Design Sprint** - 2-day workshop mapping each industry flow
3. ✅ **Database Migration Script** - Write Prisma migration
4. ✅ **Assign Engineers** - 2 backend + 2 frontend + 1 QA

### Week 1 Deliverables
- [ ] Database schema merged to main
- [ ] `@vayva/pos-core` service implemented
- [ ] Fastify routes registered
- [ ] API documentation (OpenAPI/Swagger)

### Week 2 Deliverables
- [ ] POS context provider
- [ ] Retail POS screen (MVP)
- [ ] Unit tests (80% coverage)
- [ ] Staging deployment

---

## 🎯 Conclusion

This plan provides a **comprehensive, production-ready roadmap** for implementing industry-specific POS systems across Vayva's 35+ verticals. The hybrid architecture balances code reuse with industry customization, ensuring each merchant gets a tailored experience without duplicating effort.

**Key Differentiators:**
- ✅ **Universal Core** - Shared logic reduces maintenance burden
- ✅ **Industry Adapters** - Each vertical gets purpose-built UI/UX
- ✅ **Offline-First** - Critical for Nigerian market connectivity
- ✅ **Hardware Ready** - Prepared for thermal printers, barcode scanners
- ✅ **Paystack Native** - Seamless Naira transactions

**Estimated Timeline**: 10 weeks to full rollout
**Team Size**: 5 engineers (2 backend, 2 frontend, 1 full-stack)
**Budget**: ~₦25M engineering cost + infrastructure

Let's build the best POS system Africa has ever seen! 🚀🇳🇬
