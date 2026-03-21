'use client';

import { motion } from 'framer-motion';
import { Download, Monitor, Shield, Zap, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@vayva/ui';

export default function DesktopDownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
                <Monitor className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Vayva Desktop</h1>
                <p className="text-xs text-slate-500">Professional Merchant Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl font-bold text-slate-900">
            Download Vayva Desktop
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Professional offline-first merchant management software for Windows and Mac.
            Works completely offline - no internet required after installation.
          </p>
        </motion.div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Windows */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Windows Version</h3>
                </div>
                <p className="text-blue-100">For Windows 10/11 (64-bit)</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <span className="text-slate-700">Windows 10 or later (64-bit)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <span className="text-slate-700">4GB RAM minimum (8GB recommended)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <span className="text-slate-700">500MB free disk space</span>
                  </div>
                </div>

                <Button 
                  onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop-Setup.exe', '_blank')}
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  Download Windows Installer
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600">
                    <strong>File size:</strong> ~150 MB • <strong>Version:</strong> 1.0.0
                  </p>
                </div>

                {/* Installation Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm">Important Installation Note</p>
                      <p className="text-sm text-amber-800 mt-1">
                        Windows may show a "SmartScreen" warning. This is normal for new apps.
                      </p>
                      <ol className="text-sm text-amber-800 mt-2 list-decimal list-inside space-y-1">
                        <li>Click "More info"</li>
                        <li>Click "Run anyway"</li>
                        <li>Follow installation wizard</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mac */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Mac Version</h3>
                </div>
                <p className="text-purple-100">Universal for Intel & Apple Silicon</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <span className="text-slate-700">macOS 11.0 (Big Sur) or later</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <span className="text-slate-700">Intel or Apple Silicon (M1/M2/M3)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <span className="text-slate-700">4GB RAM minimum (8GB recommended)</span>
                  </div>
                </div>

                <Button 
                  onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop.dmg', '_blank')}
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  Download Mac Installer
                </Button>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600">
                    <strong>File size:</strong> ~180 MB • <strong>Version:</strong> 1.0.0
                  </p>
                </div>

                {/* Installation Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm">Important Installation Note</p>
                      <p className="text-sm text-amber-800 mt-1">
                        Mac will show a "Gatekeeper" warning. This is normal for new apps.
                      </p>
                      <ol className="text-sm text-amber-800 mt-2 list-decimal list-inside space-y-1">
                        <li>Download the .dmg file</li>
                        <li>Open the .dmg file</li>
                        <li>If warning appears: Right-click app icon → Open</li>
                        <li>Drag to Applications folder</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200"
        >
          <h3 className="text-3xl font-bold text-slate-900 mb-6 text-center">Why Choose Desktop?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Works Offline',
                desc: 'No internet required. Your data is stored locally on your computer.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'All data stays on your machine. No cloud sync unless you choose to.',
              },
              {
                icon: Monitor,
                title: 'Native Performance',
                desc: 'Optimized for Windows and Mac. Fast, responsive, and reliable.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{feature.title}</h4>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-slate-900 text-center">Frequently Asked Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'Why do I see a security warning?',
                a: 'Windows SmartScreen and Mac Gatekeeper show warnings for all new apps without paid developer certificates. This is a security measure by Microsoft and Apple. Simply click "More info → Run anyway" (Windows) or right-click → Open (Mac) to install.',
              },
              {
                q: 'Is it safe to ignore the warning?',
                a: 'Yes! Vayva Desktop is 100% safe. The warning is just Microsoft/Apple\'s way of warning users about unknown apps. Our app is scanned regularly for security issues.',
              },
              {
                q: 'Do I need internet after installation?',
                a: 'No! Once installed, Vayva Desktop works completely offline. Your data is stored locally on your computer.',
              },
              {
                q: 'Can I use it on multiple computers?',
                a: 'Yes! You can install Vayva Desktop on as many computers as you need. Your data is stored separately on each device.',
              },
              {
                q: 'How do I update the app?',
                a: 'The app automatically checks for updates when you launch it. New versions download and install seamlessly in the background.',
              },
              {
                q: 'What if I need help?',
                a: 'Visit our documentation at docs.vayva.ng or contact support@vayva.ng. We\'re here to help!',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white text-center shadow-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-emerald-100 mb-6 max-w-2xl mx-auto">
            Download Vayva Desktop today and manage your business offline with professional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop-Setup.exe', '_blank')}
              className="h-14 px-8 text-lg gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
            >
              <Download className="h-5 w-5" />
              Download for Windows
            </Button>
            <Button
              onClick={() => window.open('https://downloads.vayva.ng/desktop/Vayva-Desktop.dmg', '_blank')}
              className="h-14 px-8 text-lg gap-2 bg-white text-purple-600 hover:bg-purple-50 shadow-xl"
            >
              <Download className="h-5 w-5" />
              Download for Mac
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="font-semibold text-slate-900">Vayva Desktop</span>
            </div>
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} Vayva. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="https://docs.vayva.ng" target="_blank" className="text-slate-600 hover:text-blue-600 flex items-center gap-1" rel="noreferrer">
                Documentation
                <ExternalLink className="h-3 w-3" />
              </a>
              <a href="mailto:support@vayva.ng" className="text-slate-600 hover:text-blue-600">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
