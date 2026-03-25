"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "vayva_user_interactions";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  name: string;
  last4: string;
  isDefault?: boolean;
}

interface _Rating {
  mealId: string;
  rating: number;
  review?: string;
}

interface StoredData {
  favorites: string[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  ratings: Record<string, number>;
  balance: number;
}

interface UserInteractions {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => { isFavorite: boolean };
  addresses: Address[];
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  ratings: Record<string, number>;
  rateMeal: (mealId: string, rating: number) => void;
  balance: number;
  redeemCode: (code: string) => { success: boolean; amount?: number };
  isLoaded: boolean;
}

function loadStoredData(): StoredData {
  if (typeof window === "undefined") {
    return {
      favorites: [],
      addresses: [],
      paymentMethods: [],
      ratings: {},
      balance: 0,
    };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        favorites: parsed.favorites || [],
        addresses: parsed.addresses || [],
        paymentMethods: parsed.paymentMethods || [],
        ratings: parsed.ratings || {},
        balance: parsed.balance || 0,
      };
    }
  } catch (error) {
    console.error("[useUserInteractions] Error loading from localStorage:", error);
  }
  
  return {
    favorites: [],
    addresses: [],
    paymentMethods: [],
    ratings: {},
    balance: 0,
  };
}

function saveStoredData(data: StoredData) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[useUserInteractions] Error saving to localStorage:", error);
  }
}

export function useUserInteractions(): UserInteractions {
  const [isLoaded, setIsLoaded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [balance, setBalance] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadStoredData();
    setFavorites(data.favorites);
    setAddresses(data.addresses);
    setPaymentMethods(data.paymentMethods);
    setRatings(data.ratings);
    setBalance(data.balance);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    
    saveStoredData({
      favorites,
      addresses,
      paymentMethods,
      ratings,
      balance,
    });
  }, [favorites, addresses, paymentMethods, ratings, balance, isLoaded]);

  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    const newAddress: Address = { 
      ...address, 
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` 
    };
    setAddresses((prev) => {
      // If this is the first address, make it default
      if (prev.length === 0) {
        newAddress.isDefault = true;
      }
      return [...prev, newAddress];
    });
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((addr) => addr.id !== id);
      // If we removed the default, set a new default
      if (prev.find(a => a.id === id)?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return [...filtered];
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  }, []);

  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, "id">) => {
    const newMethod: PaymentMethod = { 
      ...method, 
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` 
    };
    setPaymentMethods((prev) => {
      // If this is the first method, make it default
      if (prev.length === 0) {
        newMethod.isDefault = true;
      }
      return [...prev, newMethod];
    });
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // If we removed the default, set a new default
      if (prev.find(m => m.id === id)?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return [...filtered];
    });
  }, []);

  const setDefaultPaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const isFav = favorites.includes(id);
      if (isFav) {
        removeFavorite(id);
      } else {
        addFavorite(id);
      }
      return { isFavorite: !isFav };
    },
    [favorites, addFavorite, removeFavorite]
  );

  const rateMeal = useCallback(
    (mealId: string, rating: number) => {
      setRatings((prev) => ({ ...prev, [mealId]: rating }));
    },
    []
  );

  const redeemCode = useCallback((code: string) => {
    // Simple mock implementation - in production this would validate against backend
    const validCodes: Record<string, number> = {
      "WELCOME50": 50,
      "GIFT100": 100,
      "BONUS25": 25,
    };
    const amount = validCodes[code.toUpperCase()];
    if (amount) {
      setBalance((prev) => prev + amount);
      return { success: true, amount };
    }
    return { success: false };
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    addresses,
    addAddress,
    removeAddress,
    setDefaultAddress,
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    ratings,
    rateMeal,
    balance,
    redeemCode,
    isLoaded,
  };
}
