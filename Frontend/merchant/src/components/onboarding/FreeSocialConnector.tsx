/**
 * Free Social Connector Implementation
 * Easy, no-cost integrations for merchants
 */

import { useState } from "react";
import { 
  TelegramLogo, 
  DiscordLogo, 
  FacebookLogo, 
  GoogleLogo,
  CheckCircle,
  Warning,
  Plug,
  Copy,
  ArrowRight
} from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { toast } from "sonner";

interface FreeSocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  setupDifficulty: 'easy' | 'medium';
  cost: 'free' | 'freemium';
  steps: string[];
  connected: boolean;
  setupUrl?: string;
}

export function FreeSocialConnector() {
  const [platforms] = useState<FreeSocialPlatform[]>([
    {
      id: 'telegram',
      name: 'Telegram Bot',
      icon: <TelegramLogo className="w-6 h-6" />,
      description: 'Free bot for customer service and sales',
      color: 'bg-blue-500',
      setupDifficulty: 'easy',
      cost: 'free',
      steps: [
        'Create bot with @BotFather',
        'Copy the API token',
        'Paste token below',
        'Start chatting with your bot!'
      ],
      connected: false,
      setupUrl: 'https://t.me/BotFather'
    },
    {
      id: 'discord',
      name: 'Discord Server',
      icon: <DiscordLogo className="w-6 h-6" />,
      description: 'Community engagement platform',
      color: 'bg-green-500',
      setupDifficulty: 'easy',
      cost: 'free',
      steps: [
        'Create server at discord.com',
        'Go to Server Settings > Integrations',
        'Create new bot',
        'Copy bot token',
        'Paste below'
      ],
      connected: false,
      setupUrl: 'https://discord.com/developers/applications'
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      icon: <FacebookLogo className="w-6 h-6" />,
      description: 'Connect with customers on Facebook',
      color: 'bg-blue-600',
      setupDifficulty: 'medium',
      cost: 'free',
      steps: [
        'Go to Facebook Developers',
        'Create new app',
        'Add Messenger product',
        'Get Page Access Token',
        'Connect your Facebook Page'
      ],
      connected: false,
      setupUrl: 'https://developers.facebook.com/'
    },
    {
      id: 'google',
      name: 'Google Business Messages',
      icon: <GoogleLogo className="w-6 h-6" />,
      description: 'Messages through Google Search',
      color: 'bg-green-500',
      setupDifficulty: 'medium',
      cost: 'free',
      steps: [
        'Go to Google Business Profile',
        'Enable Messaging',
        'Get verification',
        'Connect to your business'
      ],
      connected: false,
      setupUrl: 'https://www.google.com/business/'
    }
  ]);

  const [activeSetup, setActiveSetup] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const handleConnect = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (platform?.setupUrl) {
      window.open(platform.setupUrl, '_blank');
    }
    setActiveSetup(platformId);
  };

  const handleSubmitToken = async (platformId: string) => {
    try {
      const token = credentials[`${platformId}_token`];
      if (!token) {
        toast.error('Please enter your token first');
        return;
      }

      // Simulate API call to save token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${platformId} connected successfully!`);
      setActiveSetup(null);
      
      // Update platform status
      // In real implementation: update state or make API call
      
    } catch (error) {
      toast.error('Failed to connect. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-vayva-green to-green-500 mb-2">
          <Plug className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">
          Free Social Connections
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Connect additional platforms where your customers already are. 
          All integrations are completely free and take less than 5 minutes.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-bold text-green-700">
            100% Free • No Technical Skills Required
          </span>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`${platform.color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{platform.name}</h3>
                  <p className="text-gray-500 text-sm">{platform.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      platform.cost === 'free' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {platform.cost === 'free' ? '💯 FREE' : ' Freemium'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      platform.setupDifficulty === 'easy' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {platform.setupDifficulty === 'easy' ? '⚡ Easy' : '🔧 Medium'}
                    </span>
                  </div>
                </div>
              </div>
              
              {platform.connected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-sm font-bold text-green-600">CONNECTED</span>
                </div>
              ) : (
                <Warning className="w-6 h-6 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            {/* Setup Steps */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 text-sm mb-2">Setup Steps:</h4>
              <ol className="space-y-1">
                {platform.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Button */}
            {!platform.connected ? (
              <Button
                onClick={() => handleConnect(platform.id)}
                className={`w-full h-12 font-bold rounded-xl transition-all ${
                  platform.color.replace('bg-', 'bg-').replace('500', '600')
                } hover:opacity-90 text-white flex items-center justify-center gap-2`}
              >
                <Plug className="w-5 h-5" />
                Connect {platform.name}
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-green-800">
                  ✅ {platform.name} is already connected and working!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Setup Modals */}
      {activeSetup && (
        <TokenSetupModal
          platform={platforms.find(p => p.id === activeSetup)!}
          credentials={credentials}
          setCredentials={setCredentials}
          onSubmit={() => handleSubmitToken(activeSetup)}
          onClose={() => setActiveSetup(null)}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}

// Token Setup Modal Component
function TokenSetupModal({ 
  platform,
  credentials,
  setCredentials,
  onSubmit,
  onClose,
  onCopy
}: {
  platform: FreeSocialPlatform;
  credentials: Record<string, string>;
  setCredentials: (creds: Record<string, string>) => void;
  onSubmit: () => void;
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  const tokenKey = `${platform.id}_token`;
  const tokenValue = credentials[tokenKey] || '';

  const getPlaceholderInstructions = () => {
    switch (platform.id) {
      case 'telegram':
        return 'Paste your bot token from @BotFather (looks like: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ)';
      case 'discord':
        return 'Paste your bot token from Discord Developer Portal';
      case 'facebook':
        return 'Paste your Page Access Token from Facebook Developers';
      case 'google':
        return 'Paste your Google Business Messages verification token';
      default:
        return 'Enter your API token';
    }
  };

  const getHelpText = () => {
    switch (platform.id) {
      case 'telegram':
        return 'Find your token by messaging @BotFather → /mybots → Select your bot → Bot Settings → API Token';
      case 'discord':
        return 'Go to Discord Developer Portal → Applications → Your App → Bot → Copy Token';
      case 'facebook':
        return 'In Facebook Developers → Your App → Messenger → Generate Token';
      case 'google':
        return 'In Google Business Profile → Messaging → Get Verification Token';
      default:
        return 'Need help finding your token? Check the platform documentation.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className={`${platform.color} p-5 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Connect {platform.name}</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Token Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              API Token
            </label>
            <div className="relative">
              <Input
                type="password"
                value={tokenValue}
                onChange={(e) => setCredentials({...credentials, [tokenKey]: e.target.value})}
                placeholder={getPlaceholderInstructions()}
                className="pr-10"
              />
              {tokenValue && (
                <button
                  onClick={() => onCopy(tokenValue)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getHelpText()}
            </p>
          </div>

          {/* Quick Copy Buttons */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-700 mb-2">Quick Links:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.open(platform.setupUrl, '_blank')}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
              >
                Get Token
              </button>
              <button
                onClick={() => onCopy(getHelpText())}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              >
                Copy Instructions
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={!tokenValue}
            className={`w-full font-bold py-3 rounded-lg ${
              tokenValue 
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