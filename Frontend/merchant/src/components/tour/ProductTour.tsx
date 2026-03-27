"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Icon, cn } from "@vayva/ui";
import { motion, AnimatePresence } from "framer-motion";
import type { TourConfig, TourStep } from "@/lib/product-tour-config";

interface ProductTourProps {
  config: TourConfig;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function ProductTour({ config, onComplete, onSkip }: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);

  const currentStep = config.steps[currentStepIndex];
  const totalSteps = config.steps.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // Highlight target element
  useEffect(() => {
    if (!currentStep?.target) return;

    const element = document.querySelector(currentStep.target);
    if (element) {
      setHighlightedElement(element);
      
      // Scroll into view if needed
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return () => setHighlightedElement(null);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStepIndex]);

  if (!isVisible || !currentStep) return null;

  // Check if should show on mobile
  if (typeof window !== "undefined" && window.innerWidth < 768 && !currentStep.showOnMobile) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Spotlight effect on highlighted element */}
      {highlightedElement && (
        <div 
          className="fixed inset-0 z-[9999] pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        />
      )}

      {/* Tour tooltip */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tourRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[10000] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
            style={{
              position: getTooltipPosition(currentStep.position),
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
          >
            {/* Progress bar */}
            {config.showProgress && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 rounded-t-2xl overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                  initial={{ width: `${((currentStepIndex) / totalSteps) * 100}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip tour"
            >
              <Icon name="X" size={18} />
            </button>

            {/* Content */}
            <div className="mt-4">
              <h3 id="tour-title" className="text-lg font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {currentStep.description}
              </p>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip Tour
                </Button>

                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="hidden sm:inline-flex"
                    >
                      <Icon name="ArrowLeft" size={16} className="mr-1" />
                      Previous
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className={cn(
                      "bg-green-500 hover:bg-green-600 text-white",
                      currentStepIndex === totalSteps - 1 && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {currentStepIndex === totalSteps - 1 ? "Finish" : "Next"}
                    {currentStepIndex < totalSteps - 1 && (
                      <Icon name="ArrowRight" size={16} className="ml-1" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Step indicators */}
              {config.showProgress && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        index === currentStepIndex
                          ? "w-6 bg-green-500"
                          : "w-1.5 bg-gray-200"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Get CSS positioning for tooltip based on step position preference
 */
function getTooltipPosition(position: string): React.CSSProperties {
  switch (position) {
    case "top":
      return { top: "20%", left: "50%", transform: "translateX(-50%)" };
    case "bottom":
      return { bottom: "20%", left: "50%", transform: "translateX(-50%)" };
    case "left":
      return { left: "10%", top: "50%", transform: "translateY(-50%)" };
    case "right":
      return { right: "10%", top: "50%", transform: "translateY(-50%)" };
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}

export default ProductTour;
