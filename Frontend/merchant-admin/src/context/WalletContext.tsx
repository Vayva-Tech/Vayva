"use client";

import { logger } from "@vayva/shared";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api-client-shared";

export interface WalletSummary {
  available: number;
  pending: number;
  pinSet: boolean;
  status: "active" | "locked";
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
}

interface WalletContextType {
  summary: WalletSummary | null;
  ledger: Transaction[];
  isLoading: boolean;
  isLocked: boolean;
  hasPin: boolean; // In reality this would come from Auth/Profile, simulating here
  unlockWallet: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, merchant } = useAuth();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [ledger, setLedger] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  const refreshWallet = async () => {
    setIsLoading(true);
    try {
      const s = await apiJson<WalletSummary>("/api/wallet/summary");
      setSummary(s);
      setHasPin(s.pinSet);
      setIsLocked(s.status === "locked");

      const l = await apiJson<Transaction[]>("/api/wallet/ledger");
      setLedger(l || []);
    } catch (error: any) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to load wallet", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshWallet();
    }
  }, [user]);

  const unlockWallet = async (pin: string) => {
    try {
      const result = await apiJson<{ success: boolean }>("/api/wallet/unlock", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      if (result.success) {
        setIsLocked(false);
        refreshWallet();
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const handleSetPin = async (pin: string) => {
    await apiJson("/api/wallet/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    setHasPin(true);
    setIsLocked(false);
    refreshWallet();
  };

  return (
    <WalletContext.Provider
      value={{
        summary,
        ledger,
        isLoading,
        isLocked,
        hasPin,
        unlockWallet,
        setPin: handleSetPin,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};
