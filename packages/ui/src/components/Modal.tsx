import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "../utils";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors"
          >
            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "bg-background/80 backdrop-blur-xl rounded-2xl border border-border shadow-elevated w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]",
                className,
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-bold text-lg text-text-primary">{title}</h3>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-xl bg-white/40 hover:bg-white/50"
                >
                  <Icon name="X" size={18} />
                </Button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
