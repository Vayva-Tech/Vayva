'use client';

import React from 'react';

// Enhanced Metric Card with trend visualization
export const EnhancedMetricCard = ({ widget, data, isLoading, error }: any) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-red-800">{widget.title || widget.type}</h3>
          <span className="text-red-500">⚠️</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          className="mt-3 text-xs text-red-700 hover:text-red-900 underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const value = data?.value ?? 0;
  const trend = data?.trend ?? 0;
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {widget.title || widget.type}
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </h3>
        {data?.timestamp && (
          <span className="text-xs text-gray-400" title={new Date(data.timestamp).toLocaleString()}>
            {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <div className="mb-3">
        <span className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      
      {trend !== 0 && (
        <div className="flex items-center gap-2">
          <span className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-500">vs previous period</span>
        </div>
      )}
      
      {/* Progress bar for percentage metrics */}
      {typeof value === 'number' && value <= 100 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                value > 80 ? 'bg-green-500' : 
                value > 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Chart Widget with SVG visualization
export const ChartWidget = ({ widget, data, isLoading, error }: any) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-4">{widget.title || widget.type}</h3>
        <div className="text-red-500 text-center py-12">
          <div className="text-4xl mb-2">📉</div>
          <p>Error loading chart data</p>
        </div>
      </div>
    );
  }

  // Generate sample data points if none provided
  const chartData = data?.points || Array.from({ length: 12 }, (_, i) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(Math.random() * 1000) + 500
  }));

  const maxValue = Math.max(...chartData.map((d: any) => d.value));
  const minValue = Math.min(...chartData.map((d: any) => d.value));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        {widget.title || widget.type}
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Live
        </span>
      </h3>
      
      <div className="h-64 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Data line */}
          <polyline
            points={chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 80 - 10;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          {/* Data area */}
          <polygon
            points={`0,100 ${chartData.map((d: any, i: number) => {
              const x = (i / (chartData.length - 1)) * 100;
              const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 80 - 10;
              return `${x},${y}`;
            }).join(' ')} 100,100`}
            fill="#3b82f6"
            fillOpacity="0.1"
          />
          
          {/* Data points */}
          {chartData.map((d: any, i: number) => {
            const x = (i / (chartData.length - 1)) * 100;
            const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 80 - 10;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#3b82f6"
                className="hover:r-3 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{chartData[0]?.label}</span>
          <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
          <span>{chartData[chartData.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
};

// Table Widget for data lists
export const TableWidget = ({ widget, data, isLoading, error }: any) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-4">{widget.title || widget.type}</h3>
        <div className="text-red-500 text-center py-8">
          <p>Error loading table data</p>
        </div>
      </div>
    );
  }

  const tableData = data?.items || [
    { id: 1, name: 'Product A', value: 1250, trend: 12 },
    { id: 2, name: 'Product B', value: 980, trend: -5 },
    { id: 3, name: 'Product C', value: 2100, trend: 8 },
    { id: 4, name: 'Product D', value: 750, trend: -2 },
    { id: 5, name: 'Product E', value: 1650, trend: 15 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{widget.title || widget.type}</h3>
        <span className="text-xs text-gray-500">{tableData.length} items</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900">{item.name}</td>
                <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.trend >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.trend >= 0 ? '↗' : '↘'} {Math.abs(item.trend)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Status Widget for system monitoring
export const StatusWidget = ({ widget, data, isLoading, error }: any) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
        <h3 className="text-sm font-medium text-red-800 mb-4">{widget.title || widget.type}</h3>
        <div className="text-center">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-red-600">System Offline</p>
        </div>
      </div>
    );
  }

  const status = data?.status || 'online';
  const uptime = data?.uptime || 99.9;
  const responseTime = data?.responseTime || 45;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return '✅';
      case 'warning': return '⚠️';
      case 'offline': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        {widget.title || widget.type}
        <span className={`w-2 h-2 ${getStatusColor(status)} rounded-full animate-pulse`}></span>
      </h3>
      
      <div className="text-center">
        <div className="text-5xl mb-3">{getStatusIcon(status)}</div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
          status === 'online' ? 'bg-green-100 text-green-800' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{uptime}%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{responseTime}ms</div>
            <div className="text-xs text-gray-500">Response</div>
          </div>
        </div>
      </div>
    </div>
  );
};