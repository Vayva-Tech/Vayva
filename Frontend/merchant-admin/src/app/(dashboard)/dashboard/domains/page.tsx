"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { EmptyState } from "@/components/wix-style/EmptyState";
import { StatusPill } from "@/components/wix-style/StatusPill";
import { Button, Icon, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

interface DomainEntry {
  id: string;
  domain: string;
  type: "PRIMARY" | "CUSTOM" | "REDIRECT";
  status: "ACTIVE" | "PENDING" | "FAILED";
  sslStatus: "ACTIVE" | "PENDING" | "NONE";
  isPrimary: boolean;
  createdAt: string;
}

interface DomainsData {
  defaultDomain: string;
  customDomains: DomainEntry[];
}

export default function DomainsPage() {
  const router = useRouter();
  const [data, setData] = useState<DomainsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await apiJson<{ data: DomainsData }>("/api/account/domains");
      setData(res.data);
    } catch {
      // Fallback: construct from site overview
      try {
        const siteRes = await apiJson<{ data: { slug: string; domain: string } }>("/api/sites/overview");
        setData({
          defaultDomain: siteRes.data.domain || `${siteRes.data.slug}.vayva.ng`,
          customDomains: [],
        });
      } catch {
        toast.error("Failed to load domain settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setConnecting(true);
    try {
      await apiJson("/api/account/domains", {
        method: "POST",
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      toast.success("Domain added! Configure your DNS records to complete setup.");
      setNewDomain("");
      setShowForm(false);
      fetchDomains();
    } catch {
      toast.error("Failed to connect domain");
    } finally {
      setConnecting(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    try {
      await apiJson(`/api/account/domains/verify`, {
        method: "POST",
        body: JSON.stringify({ domainId }),
      });
      toast.success("DNS verification started");
      fetchDomains();
    } catch {
      toast.error("Verification failed — check your DNS records");
    }
  };

  const handleRemove = async (domainId: string, domain: string) => {
    if (!confirm(`Remove "${domain}"? This will disconnect it from your store.`)) return;
    try {
      await apiJson(`/api/account/domains`, {
        method: "DELETE",
        body: JSON.stringify({ domainId }),
      });
      toast.success("Domain removed");
      fetchDomains();
    } catch {
      toast.error("Failed to remove domain");
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 max-w-6xl mx-auto pb-20">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-background/30 animate-pulse rounded-xl" />
          <div className="h-4 w-96 bg-background/30 animate-pulse rounded-lg" />
        </div>
        <div className="h-[300px] bg-background/20 animate-pulse rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <PageHeader
        title="Domains"
        description="Manage your store's web address and custom domains"
      />

      {/* Default Domain */}
      <div className="p-8 rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary">Default Domain</h3>
          <StatusPill status="LIVE" />
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-background/20 border border-border/20">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="Globe" size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <a
              href={`https://${data?.defaultDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-text-primary hover:text-primary transition-colors flex items-center gap-2 group"
            >
              {data?.defaultDomain}
              <Icon name="ExternalLink" size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
              Free Vayva subdomain — always active
            </p>
          </div>
        </div>
      </div>

      {/* Custom Domains */}
      <div className="p-8 rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary">Custom Domains</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl h-9 px-4 gap-2 border-border/60 hover:bg-background/30 transition-all"
          >
            <Icon name="Plus" size={14} />
            <span className="font-bold text-xs">Connect Domain</span>
          </Button>
        </div>

        {showForm && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label htmlFor="domain-input" className="text-xs font-bold text-text-primary">
                Domain Name
              </label>
              <div className="flex gap-3">
                <input
                  id="domain-input"
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="www.yourstore.com"
                  className="flex-1 h-11 px-4 rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl text-sm font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                />
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="rounded-2xl h-11 px-6 gap-2 bg-text-primary text-text-inverse hover:bg-zinc-800 shadow-lg active:scale-95 transition-all"
                >
                  {connecting ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Link" size={16} />
                  )}
                  <span className="font-bold text-sm">Connect</span>
                </Button>
              </div>
            </div>
            <p className="text-[10px] font-medium text-text-secondary leading-relaxed">
              After connecting, you'll need to update your DNS records to point to Vayva's servers. We'll provide the exact records.
            </p>
          </div>
        )}

        {data?.customDomains && data.customDomains.length > 0 ? (
          <div className="space-y-3">
            {data.customDomains.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-5 rounded-2xl bg-background/20 border border-border/20 group hover:border-border/40 transition-all"
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                  entry.status === "ACTIVE" ? "bg-success/10" : "bg-warning/10"
                )}>
                  <Icon
                    name={entry.status === "ACTIVE" ? "CheckCircle" : "Clock"}
                    size={24}
                    className={entry.status === "ACTIVE" ? "text-success" : "text-warning"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-text-primary truncate">{entry.domain}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <StatusPill status={entry.status === "ACTIVE" ? "PUBLISHED" : "DRAFT"} />
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                      SSL: {entry.sslStatus}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {entry.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerify(entry.id)}
                      className="rounded-xl h-9 px-4 gap-2 border-primary/40 text-primary hover:bg-primary/5"
                    >
                      <Icon name="RefreshCw" size={14} />
                      <span className="font-bold text-xs">Verify</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(entry.id, entry.domain)}
                    className="rounded-xl h-9 w-9 text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <EmptyState
            icon="Link"
            title="No custom domains connected"
            description="Connect your own domain to give your store a professional web address."
            actionLabel="Connect a Domain"
            onAction={() => setShowForm(true)}
          />
        ) : null}
      </div>

      {/* DNS Help */}
      <div className="p-8 rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl space-y-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary">DNS Configuration Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-background/20 border border-border/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Icon name="FileText" size={20} className="text-info" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">A Record</h4>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-secondary font-medium">Point your root domain:</p>
              <code className="block text-xs font-mono bg-background/70 backdrop-blur-xl p-3 rounded-xl border border-border/40 text-text-primary">
                Type: A → 76.76.21.21
              </code>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-background/20 border border-border/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              <h4 className="text-sm font-bold text-text-primary">CNAME Record</h4>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-secondary font-medium">Point your www subdomain:</p>
              <code className="block text-xs font-mono bg-background/70 backdrop-blur-xl p-3 rounded-xl border border-border/40 text-text-primary">
                Type: CNAME → cname.vayva.ng
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
