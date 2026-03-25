export {};

declare global {
  interface Window {
    vayvaCopyLink?: (btn: HTMLButtonElement) => void;
    vayvaRequestWithdraw?: (affiliateId: string, storeId: string) => void;
  }
}

interface AffiliateReferralRow {
  id: string;
  createdAt: string;
  customerName?: string;
  orderAmount?: number;
  commission: number;
  status: string;
}

interface AffiliateDashboardPayload {
  affiliate: {
    id: string;
    name: string;
    storeName: string;
    referralLink: string;
    minimumPayout: number;
  };
  referrals: AffiliateReferralRow[];
  earnings: unknown;
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    totalReferrals: number;
    availableBalance: number;
  };
}

/**
 * Vayva Affiliate Dashboard Widget
 * 
 * Usage:
 * <script src="https://vayva.ng/widgets/affiliate.js"></script>
 * <div id="vayva-affiliate-dashboard" data-store-id="xxx"></div>
 */

(function() {
  'use strict';

  // Configuration
  const VAYVA_API_BASE = 'https://api.vayva.ng';
  
  /**
   * Initialize the affiliate dashboard
   */
  function initDashboard() {
    const container = document.getElementById('vayva-affiliate-dashboard');
    
    if (!(container instanceof HTMLElement)) {
      console.error('[Vayva] Affiliate dashboard container not found');
      return;
    }

    const storeId = container.getAttribute('data-store-id');
    const affiliateId = container.getAttribute('data-affiliate-id');
    const theme = container.getAttribute('data-theme') || 'light';
    const language = container.getAttribute('data-lang') || 'en';

    if (!storeId || !affiliateId) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
          <p style="font-size: 16px; margin-bottom: 8px;"><strong>Vayva Affiliate Dashboard</strong></p>
          <p>Please provide store-id and affiliate-id attributes</p>
        </div>
      `;
      return;
    }

    // Show loading state
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
        <div style="text-align: center;">
          <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
          <p style="color: #6b7280;">Loading your dashboard...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    // Fetch affiliate data
    fetchAffiliateData(storeId, affiliateId)
      .then(data => {
        renderDashboard(container, data, theme, storeId);
      })
      .catch((error: unknown) => {
        console.error('[Vayva] Error loading dashboard:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to load affiliate data';
        container.innerHTML = `
          <div style="padding: 40px; text-align: center; color: #ef4444;">
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Error Loading Dashboard</strong></p>
            <p>${message}</p>
          </div>
        `;
      });
  }

  /**
   * Fetch affiliate data from API
   */
  async function fetchAffiliateData(
    storeId: string,
    affiliateId: string,
  ): Promise<AffiliateDashboardPayload> {
    const response = await fetch(`${VAYVA_API_BASE}/api/embedded/affiliates/${affiliateId}?storeId=${storeId}`);
    
    if (!response.ok) {
      const errorBody: unknown = await response.json();
      const msg =
        typeof errorBody === 'object' &&
        errorBody !== null &&
        'error' in errorBody &&
        typeof (errorBody as { error: unknown }).error === 'string'
          ? (errorBody as { error: string }).error
          : 'Failed to fetch data';
      throw new Error(msg);
    }

    return response.json() as Promise<AffiliateDashboardPayload>;
  }

  /**
   * Render the dashboard UI
   */
  function renderDashboard(
    container: HTMLElement,
    data: AffiliateDashboardPayload,
    theme: string,
    storeId: string,
  ) {
    const { affiliate, referrals, stats } = data;
    
    const html = `
      <style>
        .vayva-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: ${theme === 'dark' ? '#1f2937' : '#f9fafb'};
          border-radius: 16px;
          padding: 32px;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .vayva-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .vayva-subtitle {
          font-size: 14px;
          opacity: 0.7;
        }
        
        .vayva-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .vayva-stat-card {
          background: ${theme === 'dark' ? '#374151' : 'white'};
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .vayva-stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.7;
          margin-bottom: 8px;
        }
        
        .vayva-stat-value {
          font-size: 28px;
          font-weight: 800;
        }
        
        .vayva-section {
          background: ${theme === 'dark' ? '#374151' : 'white'};
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .vayva-section-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        
        .vayva-referral-box {
          background: ${theme === 'dark' ? '#064e3b' : '#f0fdf4'};
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .vayva-input-group {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        
        .vayva-input {
          flex: 1;
          padding: 10px 14px;
          border: 2px solid #10b981;
          border-radius: 8px;
          font-family: monospace;
          font-size: 13px;
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-btn {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vayva-btn:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        
        .vayva-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .vayva-table th {
          text-align: left;
          padding: 12px;
          font-size: 11px;
          text-transform: uppercase;
          opacity: 0.7;
          border-bottom: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        }
        
        .vayva-table td {
          padding: 14px 12px;
          font-size: 13px;
          border-bottom: 1px solid ${theme === 'dark' ? '#374151' : '#f3f4f6'};
        }
        
        .vayva-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .vayva-badge-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .vayva-badge-success {
          background: #d1fae5;
          color: #065f46;
        }
        
        .vayva-badge-paid {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .vayva-withdraw-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vayva-withdraw-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .vayva-withdraw-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      </style>
      
      <div class="vayva-dashboard">
        <div class="vayva-header">
          <h2 class="vayva-title">🚀 ${affiliate.name}'s Dashboard</h2>
          <p class="vayva-subtitle">${affiliate.storeName} Affiliate Program</p>
        </div>
        
        <div class="vayva-stats">
          <div class="vayva-stat-card">
            <div class="vayva-stat-label">Total Earnings</div>
            <div class="vayva-stat-value" style="color: #10b981;">₦${stats.totalEarnings.toLocaleString()}</div>
          </div>
          
          <div class="vayva-stat-card">
            <div class="vayva-stat-label">Pending</div>
            <div class="vayva-stat-value" style="color: #f59e0b;">₦${stats.pendingEarnings.toLocaleString()}</div>
          </div>
          
          <div class="vayva-stat-card">
            <div class="vayva-stat-label">Paid</div>
            <div class="vayva-stat-value" style="color: #3b82f6;">₦${stats.paidEarnings.toLocaleString()}</div>
          </div>
          
          <div class="vayva-stat-card">
            <div class="vayva-stat-label">Referrals</div>
            <div class="vayva-stat-value">${stats.totalReferrals}</div>
          </div>
        </div>
        
        <div class="vayva-section">
          <h3 class="vayva-section-title">Your Referral Link</h3>
          <div class="vayva-referral-box">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Share this link to earn commissions:</div>
            <div class="vayva-input-group">
              <input type="text" class="vayva-input" value="${affiliate.referralLink}" readonly />
              <button class="vayva-btn" onclick="window.vayvaCopyLink(this)">Copy Link</button>
            </div>
          </div>
        </div>
        
        <div class="vayva-section">
          <h3 class="vayva-section-title">Your Referrals</h3>
          <table class="vayva-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${referrals.length > 0 ? referrals.map((ref: AffiliateReferralRow) => `
                <tr>
                  <td>${new Date(ref.createdAt).toLocaleDateString()}</td>
                  <td>${ref.customerName || 'Customer #' + ref.id.substring(0, 8)}</td>
                  <td>₦${(ref.orderAmount || 0).toLocaleString()}</td>
                  <td><strong>₦${ref.commission.toLocaleString()}</strong></td>
                  <td><span class="vayva-badge vayva-badge-${ref.status.toLowerCase()}">${ref.status}</span></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 32px; opacity: 0.7;">No referrals yet. Start sharing!</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
        
        <div class="vayva-section">
          <h3 class="vayva-section-title">Withdraw Earnings</h3>
          <div style="background: ${theme === 'dark' ? '#1f2937' : '#f9fafb'}; padding: 20px; border-radius: 10px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <div style="font-size: 13px; opacity: 0.7; margin-bottom: 4px;">Available Balance</div>
                <div style="font-size: 28px; font-weight: 800; color: #10b981;">₦${stats.availableBalance.toLocaleString()}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 13px; opacity: 0.7; margin-bottom: 4px;">Minimum Payout</div>
                <div style="font-size: 16px; font-weight: 600;">₦${affiliate.minimumPayout.toLocaleString()}</div>
              </div>
            </div>
            
            <button 
              class="vayva-withdraw-btn" 
              onclick="window.vayvaRequestWithdraw('${affiliate.id}', '${storeId}')"
              ${stats.availableBalance >= affiliate.minimumPayout ? '' : 'disabled'}
            >
              ${stats.availableBalance >= affiliate.minimumPayout ? 'Request Withdrawal' : 'Minimum balance not reached'}
            </button>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }

  // Expose global functions
  window.vayvaCopyLink = function(btn: HTMLButtonElement) {
    const input = btn.previousElementSibling;
    if (!(input instanceof HTMLInputElement)) return;
    input.select();
    document.execCommand('copy');
    
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = '#059669';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '#10b981';
    }, 2000);
  };

  window.vayvaRequestWithdraw = function(affiliateId: string, storeId: string) {
    if (!confirm('Are you sure you want to request withdrawal? Funds will arrive in your account within 24 hours.')) {
      return;
    }

    fetch(`${VAYVA_API_BASE}/api/embedded/affiliates/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affiliateId, storeId })
    })
    .then(res => res.json())
    .then((raw: unknown) => {
      const data = raw as {
        success?: boolean;
        amount?: number;
        error?: string;
      };
      if (data.success && typeof data.amount === 'number') {
        alert(
          '✓ Withdrawal request submitted! You will receive ₦' +
            data.amount.toLocaleString() +
            ' within 24 hours.',
        );
      } else {
        alert('Error: ' + (data.error || 'Failed to process withdrawal'));
      }
    })
    .catch(() => {
      alert('Error processing withdrawal. Please try again.');
    });
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
