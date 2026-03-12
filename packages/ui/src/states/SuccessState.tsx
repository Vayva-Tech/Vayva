"use client";

import * as React from "react";
import { Icon, IconName } from "../components/Icon";
import { Button } from "../components/Button";
import { GlassPanel } from "../components/GlassPanel";
import { motion, scaleIn } from "../motion";

interface SuccessStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
}

export function SuccessState({
  title,
  description,
  action,
  actionLabel,
  onAction,
  icon = "check-circle",
}: SuccessStateProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={scaleIn}
      className="w-full h-full flex items-center justify-center p-6"
    >
      <GlassPanel className="flex flex-col items-center justify-center p-12 text-center max-w-md w-full border-green-500/10 bg-green-500/[0.02] backdrop-blur-3xl rounded-[40px] shadow-2xl shadow-green-500/5">
        <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-green-500/20 rotate-6 hover:rotate-0 transition-transform duration-500">
          <Icon name={icon} className="w-12 h-12 text-white" />
        </div>

        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-500 mb-10 leading-relaxed">{description}</p>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {action
            ? action
            : actionLabel &&
              onAction && (
                <Button
                  onClick={onAction}
                  size="lg"
                  className="px-12 h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-bold"
                >
                  {actionLabel}
                </Button>
              )}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
