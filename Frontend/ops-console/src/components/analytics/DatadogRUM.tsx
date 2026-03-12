"use client";

import Script from "next/script";

/**
 * Datadog RUM (Real User Monitoring) Integration
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_DATADOG_APPLICATION_ID
 * - NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
 * - NEXT_PUBLIC_DATADOG_ENV (production|staging|development)
 */

export function DatadogRUM(): React.ReactElement | null {
  const appId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
  const env = process.env.NEXT_PUBLIC_DATADOG_ENV || "development";
  
  if (!appId || !clientToken) {
    return null;
  }

  const datadogConfig = {
    applicationId: appId,
    clientToken: clientToken,
    site: "datadoghq.com",
    service: "vayva-ops-console",
    env: env,
    sessionSampleRate: 100,
    sessionReplaySampleRate: env === "production" ? 10 : 0,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask-user-input",
  };

  return (
    <Script
      id="datadog-rum"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,u,n,d){
            h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
            d=o.createElement(u);d.async=1;d.src=n
            n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
          })(window,document,'script','https://www.datadoghq-browser-agent.com/datadog-rum-v4.js','DD_RUM')
          
          DD_RUM.onReady(function() {
            DD_RUM.init(${JSON.stringify(datadogConfig)});
            DD_RUM.startSessionReplayRecording();
          })
        `,
      }}
    />
  );
}

/**
 * Custom RUM tracking helpers
 */
export const trackOpsAction = (action: string, metadata?: Record<string, unknown>): void => {
  if (typeof window !== "undefined" && (window as Window & { DD_RUM?: { addAction: (name: string, context?: Record<string, unknown>) => void } }).DD_RUM) {
    (window as Window & { DD_RUM?: { addAction: (name: string, context?: Record<string, unknown>) => void } }).DD_RUM?.addAction(action, metadata);
  }
};

export const trackOpsError = (error: Error, context?: Record<string, unknown>): void => {
  if (typeof window !== "undefined" && (window as Window & { DD_RUM?: { addError: (error: Error, context?: Record<string, unknown>) => void } }).DD_RUM) {
    (window as Window & { DD_RUM?: { addError: (error: Error, context?: Record<string, unknown>) => void } }).DD_RUM?.addError(error, context);
  }
};
