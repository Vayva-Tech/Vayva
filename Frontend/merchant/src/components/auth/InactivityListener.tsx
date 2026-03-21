"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

// DISABLED: Auto-logout causing issues with inbox page
// const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function InactivityListener() {
  // DISABLED: Auto-logout feature causing unexpected logouts
  // const { isAuthenticated, logout } = useAuth();
  // const timerRef = useRef<NodeJS.Timeout | null>(null);
  //
  // const handleLogout = useCallback(() => {
  //   logout();
  // }, [logout]);
  //
  // const resetTimer = useCallback(() => {
  //   if (timerRef.current) {
  //     clearTimeout(timerRef.current);
  //   }
  //   if (isAuthenticated) {
  //     timerRef.current = setTimeout(handleLogout, TIMEOUT_MS);
  //   }
  // }, [isAuthenticated, handleLogout]);
  //
  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //
  //   const events = [
  //     "mousedown",
  //     "mousemove",
  //     "keydown",
  //     "scroll",
  //     "touchstart",
  //     "click",
  //   ];
  //
  //   resetTimer();
  //
  //   const handleActivity = () => resetTimer();
  //
  //   events.forEach((event) => {
  //     window.addEventListener(event, handleActivity);
  //   });
  //
  //   return () => {
  //     if (timerRef.current) clearTimeout(timerRef.current);
  //     events.forEach((event) => {
  //       window.removeEventListener(event, handleActivity);
  //     });
  //   };
  // }, [isAuthenticated, resetTimer]);

  // Auto-logout disabled - return null
  return null;
}
