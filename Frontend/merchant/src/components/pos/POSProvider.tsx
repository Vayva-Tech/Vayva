'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

export interface POSCartItem {
  posItemId: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  notes?: string;
  modifiers?: Array<{
    name: string;
    value: string;
    price?: number;
  }>;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface POSState {
  cart: POSCartItem[];
  customer?: Customer;
  tableId?: string;          // For restaurants
  staffId?: string;          // For salons
  scheduledTime?: Date;      // For bookings
  discountCode?: string;
  tip: number;
  serviceCharge: number;
  isLoading: boolean;
  error?: string;
}

type POSAction =
  | { type: 'ADD_ITEM'; payload: POSCartItem }
  | { type: 'REMOVE_ITEM'; payload: { index: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'UPDATE_DISCOUNT'; payload: { index: number; discount: number } }
  | { type: 'SET_CUSTOMER'; payload: Customer | undefined }
  | { type: 'SET_TABLE'; payload: string | undefined }
  | { type: 'SET_STAFF'; payload: string | undefined }
  | { type: 'SET_SCHEDULE'; payload: Date | undefined }
  | { type: 'SET_DISCOUNT_CODE'; payload: string | undefined }
  | { type: 'SET_TIP'; payload: number }
  | { type: 'SET_SERVICE_CHARGE'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined };

// ============================================================================
// Initial State
// ============================================================================

const initialState: POSState = {
  cart: [],
  customer: undefined,
  tableId: undefined,
  staffId: undefined,
  scheduledTime: undefined,
  discountCode: undefined,
  tip: 0,
  serviceCharge: 0,
  isLoading: false,
  error: undefined,
};

// ============================================================================
// Reducer
// ============================================================================

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

    case 'UPDATE_DISCOUNT':
      return {
        ...state,
        cart: state.cart.map((item, i) =>
          i === action.payload.index
            ? { ...item, discount: action.payload.discount }
            : item
        ),
      };

    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };

    case 'SET_TABLE':
      return { ...state, tableId: action.payload };

    case 'SET_STAFF':
      return { ...state, staffId: action.payload };

    case 'SET_SCHEDULE':
      return { ...state, scheduledTime: action.payload };

    case 'SET_DISCOUNT_CODE':
      return { ...state, discountCode: action.payload };

    case 'SET_TIP':
      return { ...state, tip: action.payload };

    case 'SET_SERVICE_CHARGE':
      return { ...state, serviceCharge: action.payload };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        customer: undefined,
        tableId: undefined,
        staffId: undefined,
        scheduledTime: undefined,
        discountCode: undefined,
        tip: 0,
        serviceCharge: 0,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface POSContextType {
  state: POSState;
  addItem: (item: POSCartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateDiscount: (index: number, discount: number) => void;
  setCustomer: (customer?: Customer) => void;
  setTable: (tableId?: string) => void;
  setStaff: (staffId?: string) => void;
  setSchedule: (time?: Date) => void;
  setDiscountCode: (code?: string) => void;
  setTip: (amount: number) => void;
  setServiceCharge: (amount: number) => void;
  clearCart: () => void;
  calculateTotals: () => {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    tip: number;
    serviceCharge: number;
    total: number;
  };
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

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

  const updateDiscount = (index: number, discount: number) => {
    dispatch({ type: 'UPDATE_DISCOUNT', payload: { index, discount } });
  };

  const setCustomer = (customer?: Customer) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer });
  };

  const setTable = (tableId?: string) => {
    dispatch({ type: 'SET_TABLE', payload: tableId });
  };

  const setStaff = (staffId?: string) => {
    dispatch({ type: 'SET_STAFF', payload: staffId });
  };

  const setSchedule = (time?: Date) => {
    dispatch({ type: 'SET_SCHEDULE', payload: time });
  };

  const setDiscountCode = (code?: string) => {
    dispatch({ type: 'SET_DISCOUNT_CODE', payload: code });
  };

  const setTip = (amount: number) => {
    dispatch({ type: 'SET_TIP', payload: amount });
  };

  const setServiceCharge = (amount: number) => {
    dispatch({ type: 'SET_SERVICE_CHARGE', payload: amount });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const calculateTotals = () => {
    const subtotal = state.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalDiscount = state.cart.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    const taxableAmount = subtotal - totalDiscount;
    const totalTax = taxableAmount * 0.075; // 7.5% VAT
    const total = taxableAmount + totalTax + state.tip + state.serviceCharge;

    return {
      subtotal,
      totalDiscount,
      totalTax,
      tip: state.tip,
      serviceCharge: state.serviceCharge,
      total,
    };
  };

  return (
    <POSContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateDiscount,
        setCustomer,
        setTable,
        setStaff,
        setSchedule,
        setDiscountCode,
        setTip,
        setServiceCharge,
        clearCart,
        calculateTotals,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
