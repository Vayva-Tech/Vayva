"use client";

import React from "react";
import { WorkflowBuilder } from "@/components/automations/WorkflowBuilder";
import { Icon, Button } from "@vayva/ui";

export default function AutomationsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <Icon name="Zap" size={14} />
            <span>Productivity Extension</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-black">
            Visual Automations
          </h1>
          <p className="text-text-tertiary max-w-xl">
            Create "No-Code" workflows to connect your store events to actions.
            Automate notifications, discounts, and customer engagement without
            writing a single line of code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-border shadow-sm"
          >
            View Templates
          </Button>
          <Button
            variant="primary"
            className="rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Triggers & Actions */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <section className="bg-background/60 backdrop-blur border border-border/40 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Icon name="Zap" size={16} className="text-indigo-600" />
              Available Triggers
            </h3>
            <div className="flex flex-col gap-2">
              {[
                "Order Created",
                "Order Paid",
                "Stock Low",
                "Abandoned Cart",
              ].map((t) => (
                <div
                  key={t}
                  className="p-3 rounded-xl border border-border/20 bg-background/30 text-sm hover:border-indigo-200 cursor-move transition-all flex items-center justify-between group"
                >
                  {t}
                  <Icon
                    name="GripVertical"
                    size={14}
                    className="text-text-tertiary group-hover:text-text-tertiary"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-background/60 backdrop-blur border border-border/40 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Icon name="Play" size={16} className="text-green-600" />
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              {[
                "Send WhatsApp",
                "Send Email",
                "Apply Discount",
                "Tag Customer",
              ].map((a) => (
                <div
                  key={a}
                  className="p-3 rounded-xl border border-border/20 bg-background/30 text-sm hover:border-green-200 cursor-move transition-all flex items-center justify-between group"
                >
                  {a}
                  <Icon
                    name="GripVertical"
                    size={14}
                    className="text-text-tertiary group-hover:text-text-tertiary"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Canvas */}
        <div className="lg:col-span-3">
          <WorkflowBuilder />
        </div>
      </div>
    </div>
  );
}
