// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { 
  Gear, 
  Plug, 
  CheckCircle, 
  Warning,
  TelegramLogo,
  DiscordLogo,
  InstagramLogo,
  WhatsappLogo,
  TwitterLogo,
  RedditLogo,
  Copy,
  Eye,
  EyeSlash,
  Key,
  Link,
  Trash,
  Play,
  Pause
} from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

interface SocialPlatform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  accountName?: string;
  token?: string;
  lastActive?: string;
  stats?: {
    messages: number;
    conversions: number;
    engagement: number;
  };
}

export default function SocialMediaHub() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Primary customer messaging platform',
      icon: <WhatsappLogo className="w-5 h-5" />,
      connected: true,
      accountName: '+234 801 234 5678',
      stats: { messages: 1247, conversions: 89, engagement: 76 }
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Bot-powered customer support',
      icon: <TelegramLogo className="w-5 h-5" />,
      connected: false
    },
    {
      id: 'discord',
      name: 'Discord Server',
      description: 'Community engagement and support',
      icon: <DiscordLogo className="w-5 h-5" />,
      connected: false
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      description: 'Social commerce integration',
      icon: <InstagramLogo className="w-5 h-5" />,
      connected: false
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Announcements and customer service',
      icon: <TwitterLogo className="w-5 h-5" />,
      connected: false
    },
    {
      id: 'reddit',
      name: 'Reddit',
      description: 'Content marketing and discussions',
      icon: <RedditLogo className="w-5 h-5" />,
      connected: false
    }
  ]);

  const [showTokenInput, setShowTokenInput] = useState<string | null>(null);
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const connectPlatform = async (platformId: string) => {
    const token = tokenInputs[platformId];
    if (!token) {
      toast.error('Please enter a valid token');
      return;
    }

    setLoading(true);
    try {
      await apiJson('/api/social-connections', {
        method: 'POST',
        body: JSON.stringify({
          platform: platformId,
          token: token
        })
      });

      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: true, accountName: 'Connected Account' }
          : p
      ));
      
      setTokenInputs(prev => ({ ...prev, [platformId]: '' }));
      setShowTokenInput(null);
      toast.success(`${platformId} connected successfully!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[SocialHub] Failed to connect platform:', { platform: platformId, error: errorMessage });
      toast.error(`Failed to connect ${platformId}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    setLoading(true);
    try {
      await apiJson(`/api/social-connections/${platformId}`, {
        method: 'DELETE'
      });

      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, connected: false, accountName: undefined }
          : p
      ));
      
      toast.success(`${platformId} disconnected successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[SocialHub] Failed to disconnect platform:', { platform: platformId, error: errorMessage });
      toast.error(`Failed to disconnect ${platformId}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const PlatformCard = ({ platform }: { platform: SocialPlatform }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            platform.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {platform.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
            <p className="text-sm text-gray-600">{platform.description}</p>
          </div>
        </div>
        {platform.connected ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Warning className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {platform.connected ? (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Connected</p>
                <p className="text-xs text-green-700">{platform.accountName}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => disconnectPlatform(platform.id)}
                disabled={loading}
              >
                <Plug className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </div>

          {/* Stats */}
          {platform.stats && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">{platform.stats.messages}</p>
                <p className="text-xs text-gray-600">Messages</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{platform.stats.conversions}</p>
                <p className="text-xs text-gray-600">Conversions</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{platform.stats.engagement}%</p>
                <p className="text-xs text-gray-600">Engagement</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!showTokenInput || showTokenInput !== platform.id ? (
            <Button 
              className="w-full"
              onClick={() => setShowTokenInput(platform.id)}
            >
              <Plug className="w-4 h-4 mr-2" />
              Connect {platform.name}
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token / Credentials
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    value={tokenInputs[platform.id] || ''}
                    onChange={(e) => setTokenInputs(prev => ({
                      ...prev,
                      [platform.id]: e.target.value
                    }))}
                    placeholder={`Enter ${platform.name} API token`}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => {
                      const input = document.querySelector(`input[placeholder="Enter ${platform.name} API token"]`) as HTMLInputElement;
                      if (input.type === 'password') {
                        input.type = 'text';
                      } else {
                        input.type = 'password';
                      }
                    }}
                  >
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => connectPlatform(platform.id)}
                  disabled={loading || !tokenInputs[platform.id]}
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowTokenInput(null);
                    setTokenInputs(prev => ({ ...prev, [platform.id]: '' }));
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gear className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Social Media Hub</h1>
        </div>
        <p className="text-gray-600">
          Connect and manage all your social media platforms in one place
        </p>
      </div>

      {/* Connected Platforms Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Connection Status</h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {platforms.filter(p => p.connected).length} of {platforms.length} connected
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => (
            <div 
              key={platform.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                platform.connected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {platform.icon}
              {platform.name}
            </div>
          ))}
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(platform => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Having trouble connecting your social media accounts? Check our documentation 
          or contact support for assistance with API tokens and setup instructions.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Link className="w-4 h-4 mr-2" />
            View Documentation
          </Button>
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}