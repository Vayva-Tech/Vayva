'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Monitor, Shield, Zap, Check, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@vayva/ui';

interface OSInfo {
  os: 'windows' | 'mac' | 'linux' | 'unknown';
  version?: string;
}

function detectOS(): OSInfo {
  const userAgent = window.navigator.userAgent;
  
  if (/Windows NT/i.test(userAgent)) {
    return { os: 'windows', version: userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] };
  }
  
  if (/Mac OS X/i.test(userAgent)) {
    return { os: 'mac', version: userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') };
  }
  
  if (/Linux/i.test(userAgent)) {
    return { os: 'linux' };
  }
  
  return { os: 'unknown' };
}

export default function SmartDownloadPage() {
  const [osInfo, setOsInfo] = useState<OSInfo>({ os: 'unknown' });

  useEffect(() => {
    setOsInfo(detectOS());
  }, []);

  const isWindows = osInfo.os === 'windows';
  const isMac = osInfo.os === 'mac';
  const recommendedOS = isWindows ? 'windows' : isMac ? 'mac' : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl">
              <Monitor className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Download Vayva Desktop
          </h1>
          <p className="text-lg text-slate-600">
            Professional merchant management software
          </p>
        </motion.div>

        {/* OS Detection Banner */}
        {recommendedOS && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">
                      We detected you're using {isWindows ? 'Windows' : 'Mac'}
                    </p>
                    <p className="text-sm text-emerald-100">
                      We recommend downloading the {isWindows ? 'Windows' : 'Mac'} version below
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Download Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-200 mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
            <p className="text-emerald-100">Optimized for your system</p>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Windows Recommendation */}
            {isWindows && (
              <>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Windows Installer</h3>
                    <p className="text-sm text-slate-600">For Windows 10/11 (64-bit)</p>
                  </div>
                </div>

                <Button 
                  onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop-Setup.exe', '_blank')}
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  Download Windows Installer (.exe)
                </Button>

                {/* Installation Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">Installation Guide for Windows</p>
                      
                      <div className="mt-3 bg-white rounded-lg p-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                          <p className="text-sm text-slate-700">Click the download button above</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                          <div>
                            <p className="text-sm text-slate-700">If SmartScreen appears (blue screen):</p>
                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-xs text-amber-900 font-semibold mb-2">Don't worry! This is normal:</p>
                              <ol className="text-xs text-amber-800 list-decimal list-inside space-y-1">
                                <li>Click "More info"</li>
                                <li>Then click "Run anyway"</li>
                                <li>Follow installation wizard</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                          <p className="text-sm text-slate-700">Launch Vayva from Start Menu</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-blue-700 mt-3">
                        💡 <strong>Tip:</strong> The warning appears because we're a small business without a paid certificate. The app is 100% safe!
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mac Recommendation */}
            {isMac && (
              <>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Mac Installer</h3>
                    <p className="text-sm text-slate-600">Universal for Intel & Apple Silicon (M1/M2/M3)</p>
                  </div>
                </div>

                <Button 
                  onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop.dmg', '_blank')}
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  Download Mac Installer (.dmg)
                </Button>

                {/* Installation Instructions */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-purple-900 text-sm">Installation Guide for Mac</p>
                      
                      <div className="mt-3 bg-white rounded-lg p-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                          <p className="text-sm text-slate-700">Click the download button above</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                          <div>
                            <p className="text-sm text-slate-700">Open the downloaded .dmg file</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                          <div>
                            <p className="text-sm text-slate-700">If you see a warning:</p>
                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-xs text-amber-900 font-semibold mb-2">This is normal for new apps:</p>
                              <ol className="text-xs text-amber-800 list-decimal list-inside space-y-1">
                                <li>Close the warning</li>
                                <li>Right-click (or Control-click) the app icon</li>
                                <li>Select "Open" from the menu</li>
                                <li>Drag to Applications folder</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">4</span>
                          <p className="text-sm text-slate-700">Launch from Applications folder</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-purple-700 mt-3">
                        💡 <strong>Tip:</strong> Gatekeeper shows warnings for all new apps. Right-click → Open bypasses it safely!
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Generic (if OS not detected) */}
            {!recommendedOS && (
              <div className="space-y-4">
                <p className="text-slate-600">Choose your operating system:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop-Setup.exe', '_blank')}
                    className="h-14 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                  >
                    <Download className="h-5 w-5" />
                    Windows Version
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop.dmg', '_blank')}
                    className="h-14 gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Download className="h-5 w-5" />
                    Mac Version
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              icon: Zap,
              title: 'Works Offline',
              desc: 'No internet needed after installation',
            },
            {
              icon: Shield,
              title: '100% Safe',
              desc: 'Regularly scanned for security issues',
            },
            {
              icon: Monitor,
              title: 'Native App',
              desc: 'Not a web app - real desktop software',
            },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white mb-3">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <p className="text-slate-600 mb-2">Need help with installation?</p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a href="https://docs.vayva.ng" target="_blank" className="text-blue-600 hover:underline flex items-center gap-1" rel="noreferrer">
                Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-400">•</span>
              <a href="mailto:support@vayva.ng" className="text-blue-600 hover:underline">
                support@vayva.ng
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
