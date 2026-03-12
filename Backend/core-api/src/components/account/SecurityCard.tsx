import React from "react";
import { Button, Icon } from "@vayva/ui";

export const SecurityCard = () => {
  return (
    <div className="bg-background rounded-2xl border border-border p-6 flex flex-col h-full relative overflow-hidden hover:border-border transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/40 text-text-secondary flex items-center justify-center">
            <Icon name="Lock" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Login & Security</h3>
            <p className="text-xs text-text-tertiary">Protect your account</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-background border border-border/40 flex items-center justify-center">
              <Icon name="Mail" size={14} className="text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-tertiary uppercase">
                Email
              </p>
              <p className="text-sm font-bold text-text-primary">
                merchant@vayva.app
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-background border border-border/40 flex items-center justify-center">
              <Icon name="Key" size={14} className="text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-tertiary uppercase">
                Password
              </p>
              <p className="text-sm font-bold text-text-primary">
                ••••••••••••
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="h-8 text-xs">
            Change
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100 hover:border-red-200"
        >
          Log out of all devices
        </Button>
      </div>
    </div>
  );
};
