'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration | null;
  error: string | null;
  isSupported: boolean;
}

interface CacheUpdatedMessage {
  type: 'CACHE_UPDATED';
}

function isCacheUpdatedMessage(data: unknown): data is CacheUpdatedMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as { type: unknown }).type === 'CACHE_UPDATED'
  );
}

/**
 * Register service worker for offline support and caching
 */
export function useServiceWorker(): ServiceWorkerRegistrationResult {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false);
      console.warn('Service workers are not supported');
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setRegistration(reg);
        registrationRef.current = reg;

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });

        navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
          if (isCacheUpdatedMessage(event.data)) {
            // Reserved for cache-updated UI hooks
          }
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Service Worker registration failed:', err);
      }
    };

    void registerSW();
  }, []);

  return { registration, error, isSupported };
}

/**
 * Hook to check online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to prompt user to update when new SW version is available
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const updateServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }, []);

  return { updateAvailable, waitingWorker, updateServiceWorker };
}
