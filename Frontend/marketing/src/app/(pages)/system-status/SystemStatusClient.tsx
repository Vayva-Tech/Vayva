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
    <div className="relative w-full min-w-0 overflow-x-hidden pt-24 sm:pt-32 pb-20 sm:pb-24 px-4">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 min-w-0">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex mb-6 items-center gap-2 px-4 py-2 rounded-full border border-slate-200/80 bg-white text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
            <CheckCircle className="w-4 h-4" />
            All Systems Operational
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            System Status
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-1">
            Real-time status of Vayva platform services and infrastructure.
          </p>
        </div>

        {/* Services Status */}
        <div className="space-y-4 mb-12 sm:mb-16">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all min-w-0"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <span className="shrink-0 mt-0.5">{getStatusIcon(service.status)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right pl-8 sm:pl-0">
                  <p className={`text-sm font-bold ${getStatusColor(service.status)}`}>
                    {getStatusText(service.status)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Incident History */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm min-w-0">
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

        {/* Support CTA */}
        <div className="mt-12 sm:mt-16 text-center px-1">
          <div className="inline-block rounded-[28px] border border-slate-200/80 bg-white px-6 sm:px-10 py-6 sm:py-8 shadow-sm max-w-full min-w-0">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Experiencing issues? Contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
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
  );
}
