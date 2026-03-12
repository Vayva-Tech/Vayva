import React from 'react';

export interface ABTest {
  id: string;
  name: string;
  variant: 'A' | 'B';
  traffic: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  winner?: boolean;
  confidence?: number;
}

export interface ABTestProps {
  tests?: ABTest[];
  onCreateTest?: () => void;
}

export const ABTesting: React.FC<ABTestProps> = ({
  tests = [],
  onCreateTest,
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-emerald-400';
    if (confidence >= 0.8) return 'text-blue-400';
    return 'text-amber-400';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">A/B Testing</h2>
        {onCreateTest && (
          <button
            onClick={onCreateTest}
            className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Test
          </button>
        )}
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div
            key={`${test.id}-${test.variant}`}
            className={`bg-white/3 rounded-xl p-6 border-2 transition-all ${
              test.winner ? 'border-emerald-400/50 bg-emerald-400/5' : 'border-white/8 hover:border-blue-400/30'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded">
                  Variant {test.variant}
                </span>
              </div>
              {test.winner && (
                <span className="text-xs px-2 py-1 bg-emerald-400/20 text-emerald-400 rounded-full font-bold">
                  🏆 Winner
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Traffic */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Traffic</span>
                <span className="text-sm font-bold text-white">{test.traffic}%</span>
              </div>

              {/* Conversion Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">Conversion Rate</span>
                  <span className="text-sm font-bold text-white">{(test.conversionRate * 100).toFixed(2)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${test.winner ? 'bg-emerald-400' : 'bg-blue-400'}`}
                    style={{ width: `${test.conversionRate * 100}%` }}
                  />
                </div>
              </div>

              {/* Conversions */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Conversions</span>
                <span className="text-sm font-bold text-white">{test.conversions}</span>
              </div>

              {/* Revenue */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Revenue</span>
                <span className="text-sm font-bold text-emerald-400">${test.revenue.toLocaleString()}</span>
              </div>

              {/* Confidence */}
              {test.confidence && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Confidence</span>
                  <span className={`text-sm font-bold ${getConfidenceColor(test.confidence)}`}>
                    {(test.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-white/60">No A/B tests running</p>
          <p className="text-xs text-white/40 mt-1">Start testing to optimize conversions</p>
        </div>
      )}
    </div>
  );
};

export default ABTesting;
