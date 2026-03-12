"use client";

import React from "react";
import { Button } from "@vayva/ui";
import Link from "next/link";
import {
  IconCircleCheck as CheckCircle,
  IconAlertCircle as AlertCircle,
  IconClock as Clock,
} from "@tabler/icons-react";

export function SystemStatusClient(): React.JSX.Element {
  const services = [
    {
      name: "Merchant Dashboard",
      status: "operational",
      description: "Main application and admin panel",
    },
    {
      name: "Payment Processing",
      status: "operational",
      description: "Paystack integration and payment verification",
    },
    {
      name: "Order Management",
      status: "operational",
      description: "Order creation, tracking, and fulfillment",
    },
    {
      name: "Delivery Integration",
      status: "operational",
      description: "Kwik delivery partner integration",
    },
    {
      name: "API Services",
      status: "operational",
      description: "REST API and webhooks",
    },
    {
      name: "Email Notifications",
      status: "operational",
      description: "Transactional emails via Resend",
    },
  ];

  const getStatusIcon = (status: string): React.JSX.Element => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "outage":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded Performance";
      case "outage":
        return "Service Outage";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "outage":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="relative pt-32 pb-24 px-4">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-full border-2 border-emerald-200/60" />
            <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-900/10 bg-white/90 text-primary text-xs font-bold uppercase tracking-wider shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
              <CheckCircle className="w-4 h-4" />
              All Systems Operational
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            System Status
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time status of Vayva platform services and infrastructure.
          </p>
        </div>

        {/* Services Status */}
        <div className="space-y-4 mb-16">
          {services.map((service) => (
            <div key={service.name} className="relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
              <div className="relative bg-white/90 border-2 border-slate-900/10 rounded-2xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(service.status)}
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${getStatusColor(service.status)}`}>
                      {getStatusText(service.status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Incident History */}
        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border-2 border-emerald-200/60" />
          <div className="relative bg-white/90 rounded-2xl p-8 border-2 border-slate-900/10 shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Recent Incidents
            </h2>
            <p className="text-muted-foreground mb-6">
              No incidents reported in the last 30 days.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              No incidents reported this month
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="mt-16 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[30px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur px-10 py-8 shadow-[0_22px_55px_rgba(15,23,42,0.12)]">
              <p className="text-muted-foreground mb-4">
                Experiencing issues? Contact our support team.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/help">
                  <Button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors">
                    Visit Help Center
                  </Button>
                </Link>
                <a href="mailto:support@vayva.ng">
                  <Button className="px-6 py-3 border-2 border-border text-foreground font-bold rounded-xl hover:bg-muted/50 transition-colors">
                    Email Support
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
