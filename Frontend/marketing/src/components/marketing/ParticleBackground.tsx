"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Exclusion list
  const isExcluded = pathname?.match(
    /\/(terms|privacy|legal|policy|security|cookies|legal-hub)/i,
  );

  // Use ref to access current pathname in animation loop without restarting effect
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (isExcluded || typeof window === "undefined") return;

    // Performance optimization: Disable on small screens
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true }); // Must be true for transparency
    // Wait, the canvas is z=0, so it's behind content? "fixed inset-0 pointer-events-none z-0"
    // Usually alpha:false is faster, but if we need transparency...
    if (!ctx) return;

    let animationFrameId: number = 0;
    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      colorTimer: number;
      transitionSpeed: number;
      layer: number;
      pulse: number;
    }
    let particles: Particle[] = [];
    // Reduced particle count for better performance
    const particleCount = 30;

    // FPS Throttling
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const layer = Math.random() > 0.6 ? 2 : 1;

        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: layer === 1 ? 2 + Math.random() : 4 + Math.random() * 4,
          vx: (Math.random() - 0.5) * (layer === 1 ? 0.4 : 0.8),
          vy: (Math.random() - 0.5) * (layer === 1 ? 0.4 : 0.8),
          colorTimer: Math.random(),
          transitionSpeed: 0.005 + Math.random() * 0.01,
          layer,
          pulse: Math.random() * Math.PI,
        });
      }
    };

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const deltaTime = currentTime - lastTime;
      if (deltaTime < interval) return;

      lastTime = currentTime - (deltaTime % interval);

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Reduced grain usage
      if (Math.random() > 0.5) {
        ctx.fillStyle = "rgba(0,0,0,0.04)";
        // Fewer grain particles
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      particles.forEach((p) => {
        // Color oscillation between green and black
        p.colorTimer += p.transitionSpeed;
        const colorMix = (Math.sin(p.colorTimer) + 1) / 2;

        // Motion
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        // Wrap edges
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        // Mouse Repulsion logic (only calc if mouse moved recently to save cpu - optimized)
        const currentPath = pathnameRef.current;
        const isImportant =
          currentPath === "/" ||
          currentPath?.startsWith("/pricing") ||
          currentPath?.startsWith("/features");

        if (isImportant) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          // Simple binding box check before sqrt
          if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 200;
            if (dist < forceRadius) {
              const force = (forceRadius - dist) / forceRadius;
              p.x += (dx / dist) * force * 3.5;
              p.y += (dy / dist) * force * 3.5;
            }
          }
        }

        // Opacity
        const greenOpacity = 0.5;
        const blackOpacity = 0.35;
        const currentOpacity =
          colorMix * greenOpacity + (1 - colorMix) * blackOpacity;

        const twinkle = Math.sin(p.pulse) * 0.15 + 0.85;

        // Draw dash (rotated rectangle)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.vx * 2.5);

        // Color interpolation
        const r = Math.floor(colorMix * 16);
        const g = Math.floor(colorMix * 185);
        const b = Math.floor(colorMix * 129);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.globalAlpha = currentOpacity * twinkle;

        // Draw as dash - optimized drawing
        const length = 6 + (p.size / 6) * 4;
        const width = 1;
        ctx.fillRect(-length / 2, -width / 2, length, width); // fillRect is faster than roundRect/beginPath

        ctx.restore();
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Throttled mouse move tracking could be added here if needed, but simple ref update is fast
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motionQuery.matches) {
      resize();
      // Small delay to prioritize main thread for hydration
      // Using setTimeout ensures it runs after paint
      setTimeout(() => {
        animationFrameId = requestAnimationFrame(draw);
      }, 100);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isExcluded]); // REMOVED pathname from dependency array to prevent re-init

  if (isExcluded) return null;

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
  );
};
