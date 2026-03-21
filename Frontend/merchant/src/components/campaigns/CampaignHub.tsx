/**
 * Campaign Hub Component
 * Main entry point for ad platform management
 */

"use client";

import { useState } from "react";
import { Button, Badge } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link as Link2, Gear as Settings, Target, Plus } from "@phosphor-icons/react";
import { PLATFORM_CONFIGS } from "@/services/ad-platforms/hub";
import type { AdPlatform, ConnectedAccount } from "@/types/ad-platforms";

interface CampaignHubProps {
  connectedAccounts: ConnectedAccount[];
  onConnect: (platform: AdPlatform) => void;
  onDisconnect: (accountId: string) => void;
  onCreateCampaign: (platform: AdPlatform) => void;
  onFundCampaign?: (platform: AdPlatform) => void;
}

export function CampaignHub({
  connectedAccounts,
  onConnect,
  onDisconnect,
  onCreateCampaign,
  onFundCampaign,
}: CampaignHubProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<AdPlatform | null>(null);

  const platforms = Object.values(PLATFORM_CONFIGS);

  const getConnectedAccount = (platform: AdPlatform) => {
    return connectedAccounts.find((a) => a.platform === platform);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Ad Platform Hub
        </h2>
        <p className="text-sm text-gray-500">
          Connect your ad accounts and manage campaigns across Meta, Google, and TikTok from one place.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map((platform: { id: string; name: string; icon: string; color: string; description: string }) => {
          const account = getConnectedAccount(platform.id as AdPlatform);
          const isConnected = !!account;

          return (
            <Card
              key={platform.id}
              className={`relative overflow-hidden transition-all ${
                isConnected ? "border-green-500/30" : ""
              }`}
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: platform.color }}
              />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon icon={platform.icon} color={platform.color} />
                    <div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>

                  {isConnected ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-500">
                      Connected
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-500 border border-muted px-2 py-0.5 rounded">Not Connected</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Link2 className="h-4 w-4" />
                      <span>{account.accountName}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => onCreateCampaign(platform.id as AdPlatform)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDisconnect(account.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => onConnect(platform.id as AdPlatform)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Account
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      {connectedAccounts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Campaigns"
            value="0"
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            label="Total Spend (30d)"
            value="₦0"
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            label="Impressions"
            value="0"
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            label="Clicks"
            value="0"
            icon={<Target className="h-4 w-4" />}
          />
        </div>
      )}
    </div>
  );
}

function PlatformIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `${color}20` }}
    >
      <div style={{ color }}>
        {icon === "MetaLogo" && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.5701C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
          </svg>
        )}
        {icon === "GoogleLogo" && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        {icon === "TiktokLogo" && (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-gray-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
