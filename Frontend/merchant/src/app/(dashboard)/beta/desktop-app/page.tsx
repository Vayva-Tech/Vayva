'use client';

import { motion } from 'framer-motion';
import { DashboardPageShell } from '@/components/layout/DashboardPageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle,
  Monitor,
  Smartphone,
  Clock,
} from 'lucide-react';

export default function DesktopAppBetaPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardPageShell
        title="🧪 Beta Apps"
        description="Native mobile and desktop applications"
      >
        <div className="space-y-8">
          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Coming Soon</h3>
                <p className="text-sm text-amber-800">
                  Our native desktop and mobile apps are currently in development. 
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Coming Soon Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Desktop App */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8" />
                  <div>
                    <CardTitle>Desktop Application</CardTitle>
                    <CardDescription className="text-gray-100">
                      For Windows & Mac
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Coming Soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Offline-first merchant management software
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>Notify when available</span>
                </div>
              </CardContent>
            </Card>

            {/* Mobile App */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8" />
                  <div>
                    <CardTitle>Mobile Application</CardTitle>
                    <CardDescription className="text-gray-100">
                      For iOS & Android
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Coming Soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Manage your business on the go
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>Notify when available</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">What's Coming</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Monitor,
                  title: 'Desktop Apps',
                  desc: 'Native applications for Windows and macOS with offline support.',
                },
                {
                  icon: Smartphone,
                  title: 'Mobile Apps',
                  desc: 'iOS and Android apps for managing your business anywhere.',
                },
                {
                  icon: AlertCircle,
                  title: 'Get Notified',
                  desc: 'Contact us to be notified when apps become available.',
                },
              ].map((feature, idx) => (
                <Card key={idx} className="border-gray-200 hover:border-green-200 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white mb-3 shadow-lg">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-6 text-white text-center shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-2">Want to Be Notified?</h3>
            <p className="text-gray-100 mb-4">
              We'll let you know when the apps are ready for download
            </p>
            <a 
              href="mailto:support@vayva.ng?subject=Notify me about beta apps"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              📧 Get Notified
            </a>
          </motion.div>
        </div>
      </DashboardPageShell>
    </motion.div>
  );
}
