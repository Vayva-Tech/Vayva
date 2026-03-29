/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PinEntryModal } from "@/components/security/PinEntryModal";
import { apiJson } from "@/lib/api-client-shared";

interface SecurityContextType {
  isPinVerified: boolean;
  requirePin: (onSuccess: () => void) => void;
  resetPinSession: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

const PROTECTED_ROUTES = [
  "/admin/orders",
  "/admin/finance",
  "/admin/settings",
];

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
  const [hasPinSet, setHasPinSet] = useState(true);

  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const checkPinStatus = async () => {
      try {
        const data = await apiJson<SecurityStatusResponse>(
          "/account/security/status",
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

  useEffect(() => {
    const isProtected = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    if (isProtected && !isPinVerified) {
      setShowPinModal(true);
    }
  }, [pathname, isPinVerified]);

  return (
    <SecurityContext.Provider
      value={{ isPinVerified, requirePin, resetPinSession }}
    >
      {children}
      <PinEntryModal
        isOpen={showPinModal}
        onSuccess={handleSuccess}
        isSetupMode={!hasPinSet}
        onClose={() => {
          setShowPinModal(false);
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
