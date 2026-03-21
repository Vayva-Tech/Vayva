/**
 * Ultra-Simple Free Social Connections
 * Just the easiest, most valuable platforms
 */

import { useState } from "react";
import { 
  TelegramLogo, 
  DiscordLogo,
  CheckCircle,
  Plug,
  ArrowRight
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { toast } from "sonner";

interface SimplePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  whyFree: string;
  setupTime: string;
  userBase: string;
  connected: boolean;
}

export function UltraSimpleSocialConnector() {
  const [platforms] = useState<SimplePlatform[]>([
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <TelegramLogo className="w-8 h-8" />,
      description: 'Free messaging app with 800M+ users',
      color: 'from-blue-500 to-cyan-500',
      whyFree: 'Completely free bot creation',
      setupTime: '2 minutes',
      userBase: '800M+ monthly',
      connected: false
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: <DiscordLogo className="w-8 h-8" />,
      description: 'Community platform with 150M+ users',
      color: 'from-green-500 to-purple-500',
      whyFree: 'Free server and bot creation',
      setupTime: '3 minutes',
      userBase: '150M+ monthly',
      connected: false
    }
  ]);

  const [showSetup, setShowSetup] = useState<string | null>(null);
  const [token, setToken] = useState('');

  const handleQuickConnect = (platformId: string) => {
    const urls: Record<string, string> = {
      telegram: 'https://t.me/BotFather',
      discord: 'https://discord.com/developers/applications'
    };
    
    window.open(urls[platformId], '_blank');
    setShowSetup(platformId);
  };

  const handleSubmit = async () => {
    if (!token.trim()) {
      toast.error('Please enter your token');
      return;
    }

    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Connected successfully! 🎉');
      setShowSetup(null);
      setToken('');
      
      // Update platform status in real implementation
      
    } catch (error) {
      toast.error('Connection failed. Try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-vayva-green to-green-500 mb-4">
          <Plug className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900">
          Connect More Free Channels
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Expand your reach to where customers already spend time. 
          <span className="font-bold text-vayva-green"> 100% free</span> and takes less than 5 minutes total.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-blue-600">950M+</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div>
            <div className="text-3xl font-black text-green-600">5 min</div>
            <div className="text-sm text-gray-500">Setup Time</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-600">100%</div>
            <div className="text-sm text-gray-500">Free Forever</div>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center text-white`}>
                {platform.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{platform.name}</h2>
                <p className="text-gray-500">{platform.description}</p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <span className="font-bold text-gray-900">{platform.whyFree}</span>
                  <span className="text-sm text-gray-500 block">No hidden costs ever</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900">Setup in {platform.setupTime}</span>
                  <span className="text-sm text-gray-500 block">Simple copy/paste process</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{platform.userBase} users</span>
                  <span className="text-sm text-gray-500 block">Reach more customers</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            {!platform.connected ? (
              <Button
                onClick={() => handleQuickConnect(platform.id)}
                className={`w-full h-14 bg-gradient-to-r ${platform.color} text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3`}
              >
                <Plug className="w-6 h-6" />
                Connect {platform.name}
                <ArrowRight className="w-6 h-6" />
              </Button>
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-green-700">ALREADY CONNECTED!</span>
                </div>
                <p className="text-sm text-green-600">
                  {platform.name} is working perfectly for your business
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-vayva-green to-green-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">
                  Connect {showSetup === 'telegram' ? 'Telegram' : 'Discord'}
                </h3>
                <button
                  onClick={() => setShowSetup(null)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  {showSetup === 'telegram' ? (
                    <TelegramLogo className="w-8 h-8 text-blue-500" />
                  ) : (
                    <DiscordLogo className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <h4 className="font-bold text-lg text-gray-900">
                  Just 2 Simple Steps
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0 mt-1">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {showSetup === 'telegram' 
                        ? 'Message @BotFather and create your bot'
                        : 'Create a bot in Discord Developer Portal'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {showSetup === 'telegram'
                        ? 'Open Telegram → Search @BotFather → Send /newbot'
                        : 'Go to discord.com/developers → Create App → Add Bot'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold flex-shrink-0 mt-1">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      Copy your token and paste it below
                    </p>
                    <p className="text-sm text-gray-500">
                      Look for the long string of characters - that's your token!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your token here..."
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-vayva-green focus:border-transparent font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!token.trim()}
                className="w-full h-12 bg-vayva-green hover:bg-vayva-green/90 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center space-y-2 pt-8 border-t border-gray-100">
        <p className="text-gray-500">
          <span className="font-bold">💡 Pro Tip:</span> Start with Telegram - it's the fastest to set up and has the largest business user base
        </p>
        <p className="text-sm text-gray-400">
          All connections are secure and can be disconnected anytime
        </p>
      </div>
    </div>
  );
}