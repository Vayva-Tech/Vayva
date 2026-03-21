/**
 * PDF EXPORT UTILITY
 * 
 * Generate compliance reports in PDF format
 * Zero external dependencies - uses browser's native print-to-PDF
 */

'use client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PDFReport {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  sections: PDFSection[];
}

export interface PDFSection {
  heading: string;
  content: string[];
  table?: PDFTable;
}

export interface PDFTable {
  headers: string[];
  rows: string[][];
}

// ============================================================================
// PDF GENERATION ENGINE
// ============================================================================

/**
 * Generate printable HTML for cookie consent analytics report
 */
export function generateCookieConsentReport(
  metrics: any,
  trendData: any[],
  geoData: any[],
  breakdown: any
): string {
  const now = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie Consent Analytics Report - Vayva</title>
  <style>
    @media print {
      @page {
        margin: 2cm;
        size: A4;
      }
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 210mm;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    
    .header {
      border-bottom: 3px solid #0066cc;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0066cc;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #666;
    }
    
    .header .timestamp {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section h2 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .metric-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid #0066cc;
    }
    
    .metric-card.highlight {
      background: #e3f2fd;
      border-left-color: #1976d2;
    }
    
    .metric-card .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .metric-card .value {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .metric-card .subtext {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }
    
    th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    
    tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .trend-chart {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .trend-bar {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .trend-bar .date {
      width: 100px;
      font-size: 13px;
      color: #666;
    }
    
    .trend-bar .bars {
      flex: 1;
      display: flex;
      gap: 4px;
    }
    
    .bar {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 3px;
    }
    
    .bar.accept {
      background: #10b981;
    }
    
    .bar.reject {
      background: #ef4444;
    }
    
    .bar.customize {
      background: #f59e0b;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    
    .disclaimer {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      font-size: 13px;
    }
    
    .compliance-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>🍪 Cookie Consent Analytics Report</h1>
    <div class="subtitle">GDPR Article 7(1) Compliance Documentation</div>
    <div class="timestamp">Generated: ${now}</div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <h2>Executive Summary</h2>
    <div class="metrics-grid">
      <div class="metric-card highlight">
        <div class="label">Total Visitors</div>
        <div class="value">${metrics.totalVisitors.toLocaleString()}</div>
        <div class="subtext">Unique consent events tracked</div>
      </div>
      
      <div class="metric-card">
        <div class="label">Consent Rate</div>
        <div class="value">${metrics.consentRate}%</div>
        <div class="subtext">Accepted or customized</div>
      </div>
      
      <div class="metric-card">
        <div class="label">Rejection Rate</div>
        <div class="value">${metrics.rejectRate}%</div>
        <div class="subtext">Rejected all cookies</div>
      </div>
      
      <div class="metric-card">
        <div class="label">Trend</div>
        <div class="value" style="font-size: 24px;">
          ${metrics.trend === 'up' ? '📈 Improving' : metrics.trend === 'down' ? '📉 Declining' : '➡️ Stable'}
        </div>
        <div class="subtext">7-day comparison</div>
      </div>
    </div>
  </div>

  <!-- Detailed Breakdown -->
  <div class="section">
    <h2>Consent Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Choice</th>
          <th>Count</th>
          <th>Percentage</th>
          <th>GDPR Compliance Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>✅ Accept All</strong></td>
          <td>${breakdown.accept.toLocaleString()}</td>
          <td>${((breakdown.accept / metrics.totalVisitors) * 100).toFixed(1)}%</td>
          <td><span class="compliance-badge">COMPLIANT</span></td>
        </tr>
        <tr>
          <td><strong>❌ Reject All</strong></td>
          <td>${breakdown.reject.toLocaleString()}</td>
          <td>${((breakdown.reject / metrics.totalVisitors) * 100).toFixed(1)}%</td>
          <td><span class="compliance-badge">COMPLIANT</span></td>
        </tr>
        <tr>
          <td><strong>⚙️ Customize</strong></td>
          <td>${breakdown.customize.toLocaleString()}</td>
          <td>${((breakdown.customize / metrics.totalVisitors) * 100).toFixed(1)}%</td>
          <td><span class="compliance-badge">COMPLIANT</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 7-Day Trend -->
  <div class="section">
    <h2>7-Day Consent Trend</h2>
    <div class="trend-chart">
      ${trendData.map(day => `
        <div class="trend-bar">
          <div class="date">${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div class="bars">
            ${day.accept > 0 ? `<div class="bar accept" style="width: ${day.accept}%">${day.accept}%</div>` : ''}
            ${day.reject > 0 ? `<div class="bar reject" style="width: ${day.reject}%">${day.reject}%</div>` : ''}
            ${day.customize > 0 ? `<div class="bar customize" style="width: ${day.customize}%">${day.customize}%</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div style="display: flex; gap: 20px; margin-top: 15px; font-size: 13px;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <div class="bar accept" style="width: 20px; height: 16px;">✓</div>
        <span>Accept</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <div class="bar reject" style="width: 20px; height: 16px;">✗</div>
        <span>Reject</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <div class="bar customize" style="width: 20px; height: 16px;">⚙</div>
        <span>Customize</span>
      </div>
    </div>
  </div>

  <!-- Geographic Distribution -->
  <div class="section">
    <h2>Geographic Distribution</h2>
    ${geoData.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Visitors</th>
            <th>Consent Rate</th>
            <th>Applicable Law</th>
          </tr>
        </thead>
        <tbody>
          ${geoData.map((region: any) => `
            <tr>
              <td>${region.country}</td>
              <td>${region.count.toLocaleString()}</td>
              <td>${region.rate}%</td>
              <td>${getApplicableLaw(region.country)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p style="color: #666; font-style: italic;">Geographic data not yet available</p>'}
  </div>

  <!-- Compliance Notes -->
  <div class="section">
    <h2>Compliance Documentation Notes</h2>
    <div class="disclaimer">
      <strong>⚖️ Legal Basis:</strong> This report demonstrates compliance with GDPR Article 7(1) - 
      "Where processing is based on consent, the controller shall be able to demonstrate that the 
      data subject has consented to processing."
    </div>
    <ul style="margin-left: 20px; font-size: 14px; line-height: 1.8;">
      <li>All consent events are timestamped and stored securely</li>
      <li>IP addresses are anonymized to comply with data minimization (GDPR Article 5(1)(c))</li>
      <li>Consent records are retained for 7 years for audit purposes</li>
      <li>Users can withdraw consent at any time via cookie settings</li>
      <li>This report covers all visitors globally with regional law annotations</li>
    </ul>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Vayva Platform</strong> | GDPR-Compliant Cookie Consent Management</p>
    <p>Report generated automatically by Vayva Compliance Engine</p>
    <p style="margin-top: 8px;">For questions, contact: compliance@vayva.ng</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate printable HTML for subprocessor list
 */
export function generateSubprocessorsReport(subprocessors: any[]): string {
  const now = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorized Subprocessors Report - Vayva</title>
  <style>
    /* Same styles as cookie report + additional table styles */
    @media print {
      @page { margin: 2cm; size: A4; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; color: #1a1a1a; max-width: 210mm; margin: 0 auto; padding: 40px;
    }
    .header {
      border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px;
    }
    .header h1 { font-size: 28px; font-weight: 700; color: #0066cc; margin-bottom: 8px; }
    .header .timestamp { font-size: 12px; color: #999; margin-top: 8px; }
    .section { margin-bottom: 30px; }
    .section h2 {
      font-size: 20px; font-weight: 600; color: #333; margin-bottom: 15px;
      padding-bottom: 8px; border-bottom: 2px solid #e0e0e0;
    }
    table {
      width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;
    }
    th {
      background: #f8f9fa; padding: 10px; text-align: left; font-weight: 600;
      border-bottom: 2px solid #dee2e6; font-size: 12px;
    }
    td { padding: 10px; border-bottom: 1px solid #dee2e6; }
    tr:nth-child(even) { background: #f8f9fa; }
    .status-badge {
      display: inline-block; padding: 3px 10px; border-radius: 12px;
      font-size: 11px; font-weight: 600;
    }
    .status-badge.active { background: #d1fae1; color: #065f46; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .footer {
      margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;
      font-size: 12px; color: #666; text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚖️ Authorized Subprocessors Report</h1>
    <div class="timestamp">Generated: ${now} | GDPR Article 28(3) Compliance</div>
  </div>

  <div class="section">
    <h2>Complete Subprocessor List</h2>
    <table>
      <thead>
        <tr>
          <th>Service Provider</th>
          <th>Category</th>
          <th>Purpose</th>
          <th>Location</th>
          <th>Safeguards</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${subprocessors.map(sp => `
          <tr>
            <td><strong>${sp.name}</strong></td>
            <td>${sp.category}</td>
            <td>${sp.purpose}</td>
            <td>${sp.location}</td>
            <td>${sp.safeguards}</td>
            <td><span class="status-badge active">${sp.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>Vayva Platform</strong> | GDPR Article 28(3) Subprocessor Transparency</p>
    <p>Last updated: ${now}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Helper: Get applicable law based on country
 */
function getApplicableLaw(country: string): string {
  const laws: Record<string, string> = {
    'Nigeria': 'NDPR 2019',
    'United Kingdom': 'UK GDPR + Data Protection Act 2018',
    'Germany': 'GDPR + BDSG',
    'France': 'GDPR + Loi Informatique et Libertés',
    'United States': 'CCPA/CPRA (California)',
  };
  return laws[country] || 'GDPR (if EU residents)';
}

/**
 * Trigger browser print dialog
 */
export function printToPDF(htmlContent: string, filename: string = 'report') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download PDF reports');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for styles to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
