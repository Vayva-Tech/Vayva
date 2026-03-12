"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PinEntryModal } from "@/components/security/PinEntryModal";

interface SecurityContextType {
  isPinVerified: boolean;
  requirePin: (onSuccess: () => void) => void;
  resetPinSession: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

// Routes that ALWAYS require PIN session
const PROTECTED_ROUTES = [
  "/admin/orders",
  "/admin/finance",
  "/admin/settings", // General settings access
];

import { apiJson } from "@/lib/api-client-shared";

interface SecurityStatusResponse {
  pinSet: boolean;
}

export const SecurityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [hasPinSet, setHasPinSet] = useState(true); // Assume true initially, check later

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // Assume we can get pin status from user/wallet eventually

  // 1. Sync PIN status from server/session
  useEffect(() => {
    let isMounted = true;
    const checkPinStatus = async () => {
      try {
        const data = await apiJson<SecurityStatusResponse>(
          "/api/account/security/status",
        );
        if (isMounted) setHasPinSet(data?.pinSet ?? true);
      } catch (e: unknown) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.warn("[CHECK_PIN_STATUS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };
    if (user) void checkPinStatus();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const requirePin = (onSuccess: () => void) => {
    if (isPinVerified) {
      onSuccess();
    } else {
      setPendingAction(() => onSuccess);
      setShowPinModal(true);
    }
  };

  const resetPinSession = () => setIsPinVerified(false);

  const handleSuccess = () => {
    setIsPinVerified(true);
    setShowPinModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Route Guard Effect
  useEffect(() => {
    // Check if current route is protected
    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    if (isProtected && !isPinVerified && !showPinModal) {
      // Trigger PIN modal immediately
      // But verify if they even HAVE a PIN set first?
      // For MVP remediation, assume if not set, we force setup or allow.
      // Let's force PIN check.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeout(() => setShowPinModal(true), 0);
    }
  }, [pathname, isPinVerified, showPinModal]);

  return (
    <SecurityContext.Provider
      value={{ isPinVerified, requirePin, resetPinSession }}
    >
      {children}
      <PinEntryModal
        isOpen={showPinModal}
        onSuccess={handleSuccess}
        isSetupMode={!hasPinSet} // Real check from wallet state
        // If on protected route, cannot close without going back?
        onClose={() => {
          setShowPinModal(false);
          // If on protected route, redirect to dashboard or safe zone
          const isProtected = PROTECTED_ROUTES.some((route) =>
            pathname.startsWith(route),
          );
          if (isProtected) {
            router.push("/admin/dashboard");
          }
        }}
      />
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context)
    throw new Error("useSecurity must be used within SecurityProvider");
  return context;
};
