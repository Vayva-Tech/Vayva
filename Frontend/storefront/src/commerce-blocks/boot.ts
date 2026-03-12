/**
 * Vayva Commerce Blocks Boot Script
 *
 * This script finds all elements with `data-vayva-block` and mounts
 * the corresponding React component into them.
 * NOTE: This file must NOT have "use client" — it is serialized via
 * .toString() in the server layout.tsx for inline script injection.
 */

export function bootCommerceBlocks() {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback to avoid blocking the main thread
  const run = () => {
    import("./render").then(({ renderCommerceBlocks }) => {
      renderCommerceBlocks();
    });
  };

  if ("requestIdleCallback" in window) {
    (
      window as Window & { requestIdleCallback: (cb: () => void) => number }
    ).requestIdleCallback(run);
  } else {
    // Fallback for older browsers
    setTimeout(run, 1);
  }
}

// Auto-boot if this script is included directly
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCommerceBlocks);
  } else {
    bootCommerceBlocks();
  }
}
