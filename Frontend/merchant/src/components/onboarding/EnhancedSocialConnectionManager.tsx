/**
 * Enhanced Social Connection Manager
 * Unified interface for all social platform connections
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  ChatCircle as MessageSquare, 
  InstagramLogo, 
  TelegramLogo, 
  DiscordLogo, 
  RedditLogo,
  TwitterLogo,
  CheckCircle,
  Warning,
  Plug,
  X
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  connected: boolean;
  connecting: boolean;
  account?: string;
  setupType: 'qr' | 'oauth' | 'api_key' | 'manual';
  requiredFields: string[];
}

interface SocialConnectionManagerProps {
  onComplete?: () => void;
  showSkipOption?: boolean;
}

export function SocialConnectionManager({ 
  onComplete,
  showSkipOption = true 
}: SocialConnectionManagerProps) {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'AI-powered customer messaging',
      color: 'bg-green-500',
      connected: false,
      connecting: false,
      setupType: 'qr',
      requiredFields: ['phoneNumberId', 'wabaId']
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      icon: <InstagramLogo className="w-5 h-5" />,
      description: 'Social commerce integration',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      connected: false,
      connecting: false,
      setupType: 'oauth',
      requiredFields: ['accessToken', 'pageId']
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      icon: <TelegramLogo className="w-5 h-5" />,
      description: 'Bot-powered customer support',
      color: 'bg-blue-500',
      connected: false,
      connecting: false,
      setupType: 'api_key',
      requiredFields: ['botToken']
    },
    {
      id: 'discord',
      name: 'Discord Server',
      icon: <DiscordLogo className="w-5 h-5" />,
      description: 'Community engagement',
      color: 'bg-green-500',
      connected: false,
      connecting: false,
      setupType: 'api_key',
      requiredFields: ['botToken', 'guildId']
    }
  ]);

  const [activeSetup, setActiveSetup] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  // Load current connection status
  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      // Load WhatsApp status
      const waStatus = await apiJson<{connected: boolean, phoneNumber?: string}>('/api/wa-agent/status');
      updatePlatformStatus('whatsapp', waStatus.connected, waStatus.phoneNumber);
      
      // Load Instagram status
      const igStatus = await apiJson<{connected: boolean, account?: string}>('/api/socials/instagram/status');
      updatePlatformStatus('instagram', igStatus.connected, igStatus.account);
      
    } catch (error) {
      console.warn('Failed to load connection status:', error);
    }
  };

  const updatePlatformStatus = (platformId: string, connected: boolean, account?: string) => {
    setPlatforms(prev => prev.map(platform => 
      platform.id === platformId 
        ? { ...platform, connected, account } 
        : platform
    ));
  };

  const handleConnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    setPlatforms(prev => prev.map(p => 
      p.id === platformId ? { ...p, connecting: true } : p
    ));

    try {
      switch (platform.setupType) {
        case 'qr':
          await initiateWhatsAppConnection();
          break;
        case 'oauth':
          initiateOAuthConnection(platformId);
          break;
        case 'api_key':
          setActiveSetup(platformId);
          break;
      }
    } catch (error) {
      toast.error(`Failed to connect ${platform.name}`);
    } finally {
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, connecting: false } : p
      ));
    }
  };

  const initiateWhatsAppConnection = async () => {
    try {
      // Create instance
      await apiJson('/api/whatsapp/instance', { method: 'POST' });
      
      // Get QR code
      const response = await apiJson<{base64?: string, qrcode?: string}>('/api/whatsapp/instance');
      const qr = response.base64 || response.qrcode;
      if (qr) {
        setQrCode(qr);
        setActiveSetup('whatsapp');
      }
    } catch (error) {
      toast.error('Failed to generate WhatsApp QR code');
    }
  };

  const initiateOAuthConnection = (platformId: string) => {
    const returnUrl = encodeURIComponent(`${window.location.origin}/onboarding?step=socials`);
    window.location.href = `/api/socials/${platformId}/connect?returnTo=${returnUrl}`;
  };

  const handleApiKeySubmit = async (platformId: string) => {
    try {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform) return;

      const requiredData: Record<string, string> = {};
      platform.requiredFields.forEach(field => {
        if (credentials[field]) {
          requiredData[field] = credentials[field];
        }
      });

      await apiJson(`/api/social-hub/platforms/configure`, {
        method: 'POST',
        body: JSON.stringify({
          platformId,
          config: requiredData
        })
      });

      updatePlatformStatus(platformId, true);
      setActiveSetup(null);
      setCredentials({});
      toast.success(`${platform.name} connected successfully!`);
    } catch (error) {
      toast.error(`Failed to connect ${platformId}`);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      await apiJson(`/api/social-hub/platforms/${platformId}/disconnect`, {
        method: 'POST'
      });
      
      updatePlatformStatus(platformId, false);
      toast.success('Disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const getConnectedCount = () => platforms.filter(p => p.connected).length;
  const getTotalCount = platforms.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-vayva-green to-green-500 mb-2">
          <Plug className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">
          Connect Your Social Channels
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Enable AI-powered selling across your favorite platforms. 
          Connect at least one to get started.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-blue-700">
            {getConnectedCount()}/{getTotalCount} Connected
          </span>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${platform.color} p-3 rounded-xl text-white`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-500">{platform.description}</p>
                </div>
              </div>
              
              {platform.connected && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-xs font-bold text-green-600">CONNECTED</span>
                </div>
              )}
            </div>

            {platform.connected ? (
              <div className="space-y-3">
                {platform.account && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800">
                      Connected as: <span className="font-bold">{platform.account}</span>
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(platform.id)}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleConnect(platform.id)}
                disabled={platform.connecting}
                className={`w-full h-12 font-bold rounded-xl transition-all ${
                  platform.setupType === 'qr' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : platform.setupType === 'oauth'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {platform.connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  `Connect ${platform.name}`
                )}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
        {showSkipOption && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-gray-500 hover:bg-gray-50"
          >
            Skip for now - I'll connect later
          </Button>
        )}
        
        <Button
          onClick={onComplete}
          disabled={getConnectedCount() === 0}
          className="bg-vayva-green hover:bg-vayva-green/90 text-white font-bold px-8 py-3 rounded-xl disabled:opacity-50"
        >
          Continue Setup ({getConnectedCount()} connected)
        </Button>
      </div>

      {/* Setup Modals */}
      {activeSetup === 'whatsapp' && qrCode && (
        <WhatsAppSetupModal 
          qrCode={qrCode}
          onClose={() => setActiveSetup(null)}
          onSuccess={() => {
            updatePlatformStatus('whatsapp', true);
            setActiveSetup(null);
            setQrCode(null);
          }}
        />
      )}

      {activeSetup && activeSetup !== 'whatsapp' && (
        <ApiKeySetupModal
          platform={platforms.find(p => p.id === activeSetup)!}
          credentials={credentials}
          setCredentials={setCredentials}
          onSubmit={() => handleApiKeySubmit(activeSetup)}
          onClose={() => setActiveSetup(null)}
        />
      )}
    </div>
  );
}

// WhatsApp QR Setup Modal
function WhatsAppSetupModal({ 
  qrCode, 
  onClose, 
  onSuccess 
}: { 
  qrCode: string; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [countdown, setCountdown] = useState(180); // 3 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll for connection status
    const pollStatus = setInterval(async () => {
      try {
        const status = await apiJson<{connected: boolean}>('/api/wa-agent/status');
        if (status.connected) {
          onSuccess();
          clearInterval(pollStatus);
        }
      } catch (error) {
        // Continue polling
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(pollStatus);
    };
  }, [onSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Connect WhatsApp</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4">
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Scan with your WhatsApp Business app
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full">
              <Warning className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-700">
                Expires in {formatTime(countdown)}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Open WhatsApp → Settings → Linked Devices → Link Device
            </p>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
          >
            I've Scanned the Code
          </Button>
        </div>
      </div>
    </div>
  );
}

// API Key Setup Modal
function ApiKeySetupModal({ 
  platform,
  credentials,
  setCredentials,
  onSubmit,
  onClose
}: {
  platform: SocialPlatform;
  credentials: Record<string, string>;
  setCredentials: (creds: Record<string, string>) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const handleChange = (field: string, value: string) => {
    setCredentials({ ...credentials, [field]: value });
  };

  const isComplete = platform.requiredFields.every(field => credentials[field]);

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className={`${platform.color} p-5 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Connect {platform.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {platform.requiredFields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-900 mb-1 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="password"
                  value={credentials[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-vayva-green focus:border-transparent"
                  placeholder={`Enter ${field}...`}
                />
              </div>
            ))}
          </div>
          
          <Button
            onClick={onSubmit}
            disabled={!isComplete}
            className={`w-full font-bold py-3 rounded-lg ${
              isComplete 
                ? 'bg-vayva-green hover:bg-vayva-green/90 text-white' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Connect {platform.name}
          </Button>
        </div>
      </div>
    </div>
  );
}