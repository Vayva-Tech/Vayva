/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useOnboarding } from "./OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { Button, cn } from "@vayva/ui";
import { urls } from "@vayva/shared/urls";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  Sparkle as Sparkles,
  User,
  Storefront as Store,
  ChatCircleText as MessageSquare,
  CreditCard,
  Shield,
  CheckCircle,
  Question as HelpCircle,
  List as Menu,
  X,
  Rocket,
  Target,
} from "@phosphor-icons/react/ssr";

interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const STEP_CONFIGS: StepConfig[] = [
  {
    id: "welcome",
    title: "Get Started",
    description: "Welcome to Vayva",
    icon: "Sparkles",
  },
  {
    id: "plan_selection",
    title: "Choose Plan",
    description: "Find your perfect plan",
    icon: "Target",
  },
  {
    id: "identity",
    title: "Add Identity",
    description: "Verify your personal details",
    icon: "User",
  },
  {
    id: "business",
    title: "Business Details",
    description: "Tell us about your business",
    icon: "Store",
  },
  {
    id: "tools",
    title: "Select Tools",
    description: "Customize your dashboard",
    icon: "Sparkles",
  },
  {
    id: "first_item",
    title: "Add First Item",
    description: "Create your first listing",
    icon: "Store",
  },
  {
    id: "socials",
    title: "Connect Socials",
    description: "Link Instagram & WhatsApp",
    icon: "MessageSquare",
  },
  {
    id: "finance",
    title: "Payment Setup",
    description: "Add your bank account",
    icon: "CreditCard",
  },
  {
    id: "kyc",
    title: "KYC Verification",
    description: "Verify your identity",
    icon: "Shield",
  },
  {
    id: "policies",
    title: "Store Policies",
    description: "Publish required policies",
    icon: "CheckCircle",
  },
  {
    id: "publish",
    title: "Publish Storefront",
    description: "Make your storefront live",
    icon: "Rocket",
  },
  {
    id: "review",
    title: "Review & Finish",
    description: "Check details and open your dashboard",
    icon: "CheckCircle",
  },
];

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { currentStep, goToStep } = useOnboarding();
  const { merchant } = useAuth();
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  const currentStepIndex = STEP_CONFIGS.findIndex((s) => s.id === currentStep);
  const currentStepConfig = STEP_CONFIGS[currentStepIndex];

  const merchantName = useMemo(() => {
    const maybe =
      (merchant as { firstName?: string; businessName?: string; storeName?: string })?.firstName ||
      (merchant as { firstName?: string; businessName?: string; storeName?: string })?.businessName ||
      (merchant as { firstName?: string; businessName?: string; storeName?: string })?.storeName;
    return maybe || "Merchant";
  }, [merchant]);

  useEffect(() => {
    setIsProgressOpen(false);
  }, [currentStep]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProgressOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const Stepper = ({ dense }: { dense?: boolean }) => (
    <div
      className={cn(
        "flex-1 overflow-hidden",
        dense ? "space-y-1" : "space-y-0.5",
      )}
    >
      {STEP_CONFIGS.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = step.id === currentStep;
        const isClickable = isCompleted;

        return (
          <Button
            key={step.id}
            type="button"
            className={cn(
              "relative flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
              isCurrent
                ? "bg-vayva-green/10"
                : isClickable
                  ? "hover:bg-white-2/50"
                  : "",
            )}
            aria-current={isCurrent ? "step" : undefined}
            aria-disabled={isClickable ? undefined : true}
            onClick={() => {
              if (!isClickable) return;
              goToStep(step.id as any);
            }}
          >
            {index < STEP_CONFIGS.length - 1 && (
              <div
                className={cn(
                  "absolute left-[19px] top-10 w-0.5 h-7",
                  isCompleted ? "bg-vayva-green" : "bg-border",
                )}
              />
            )}

            <div
              className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                isCompleted
                  ? "bg-vayva-green"
                  : isCurrent
                    ? "bg-vayva-green border-2 border-vayva-green/20"
                    : "bg-white-2/50 border border-gray-100",
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <>
                  {step.icon === "Sparkles" && (
                    <Sparkles
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "Target" && (
                    <Target
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "User" && (
                    <User
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "Store" && (
                    <Store
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "MessageSquare" && (
                    <MessageSquare
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "CreditCard" && (
                    <CreditCard
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "Shield" && (
                    <Shield
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "CheckCircle" && (
                    <CheckCircle
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                  {step.icon === "Rocket" && (
                    <Rocket
                      size={14}
                      className={
                        isCurrent ? "text-white" : "text-gray-400"
                      }
                    />
                  )}
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold leading-snug",
                  isCurrent
                    ? "text-gray-900"
                    : isCompleted
                      ? "text-gray-500"
                      : "text-gray-400",
                )}
              >
                {step.title}
              </p>
              <p
                className={cn(
                  "text-xs leading-snug mt-0.5",
                  isCurrent
                    ? "text-gray-500"
                    : isCompleted
                      ? "text-gray-400"
                      : "text-gray-400",
                )}
              >
                {step.description}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen crm-canvas">
      <div className="relative flex min-h-screen bg-white">
        <div className="hidden lg:flex lg:w-80 xl:w-[340px] bg-white  border-r border-gray-100 px-6 py-6 flex-col fixed left-0 top-0 bottom-0">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
              <Image
                src="/vayva-logo-official.svg"
                alt="Vayva"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-400">
                Merchant
              </p>
              <p className="text-lg font-bold tracking-tight text-gray-900 truncate">
                {merchantName}
              </p>
            </div>
          </div>

          <Stepper />

          <div className="mt-6 p-4 bg-white-2/50 rounded-2xl border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Need help?
                </p>
                <a
                  href={`mailto:${urls.supportEmail()}`}
                  className="text-xs font-medium text-vayva-green hover:underline"
                >
                  {urls.supportEmail()}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:ml-80 xl:ml-[340px]">
          <div className="sticky top-0 z-30 border-b border-gray-100 bg-white ">
            <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="lg:hidden h-10 w-10 rounded-xl"
                  onClick={() => setIsProgressOpen(true)}
                  aria-label="Open progress"
                >
                  <Menu size={18} className="text-gray-500" />
                </Button>

                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {currentStepConfig?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    {currentStepConfig?.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="hidden sm:block text-xs text-gray-400 mr-2">
                  Your progress is automatically saved
                </p>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-gray-100 bg-white hover:bg-gray-50 text-gray-500"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/api/auth/signout";
                    }
                  }}
                >
                  Save & Sign Out
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="px-4 sm:px-6 lg:px-10 py-8">
              <div className="w-full max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "fixed inset-0 z-40 bg-shadow/40 transition-opacity lg:hidden",
            isProgressOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setIsProgressOpen(false)}
          aria-hidden
        />

        <aside
          className={cn(
            "fixed top-0 bottom-0 left-0 z-50 w-[86%] max-w-[360px] bg-white shadow-2xl border-r border-gray-100 transform transition-transform duration-200 lg:hidden",
            isProgressOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Onboarding progress"
        >
          <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                <Image
                  src="/vayva-logo-official.svg"
                  alt="Vayva"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">Progress</p>
                <p className="text-xs text-gray-400 truncate">
                  {merchantName}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-10 w-10 rounded-xl"
              onClick={() => setIsProgressOpen(false)}
              aria-label="Close progress"
            >
              <X size={18} className="text-gray-500" />
            </Button>
          </div>
          <div className="px-4 py-4 overflow-y-auto h-full">
            <Stepper dense />
            <div className="mt-6 p-4 bg-white-2/50 rounded-2xl border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Need help?
                  </p>
                  <a
                    href={`mailto:${urls.supportEmail()}`}
                    className="text-xs font-medium text-vayva-green hover:underline"
                  >
                    {urls.supportEmail()}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
