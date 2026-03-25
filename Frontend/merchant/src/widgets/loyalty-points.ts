export {};

declare global {
  interface Window {
    vayvaClaimReward?: (rewardId: string, customerId: string, storeId: string) => void;
    vayvaViewAllRewards?: (storeId: string, customerId: string) => void;
  }
}

interface LoyaltyReward {
  id: string;
  icon: string;
  name: string;
  points: number;
}

interface LoyaltyPayload {
  error?: string;
  customer: { name: string; points: number };
  tier: { name: string; nextTier: string; progressPercentage: number };
  pointsToNextTier: number;
  rewards: LoyaltyReward[];
}

/**
 * Vayva Loyalty Points Widget
 * 
 * Usage:
 * <script src="https://vayva.ng/widgets/loyalty-points.js"></script>
 * <div id="vayva-loyalty-widget" data-store-id="xxx" data-customer-id="yyy"></div>
 */

(function() {
  'use strict';

  const VAYVA_API_BASE = 'https://api.vayva.ng';
  
  function initLoyaltyWidget() {
    const container = document.getElementById('vayva-loyalty-widget');
    
    if (!(container instanceof HTMLElement)) return;

    const storeId = container.getAttribute('data-store-id');
    const customerId = container.getAttribute('data-customer-id');
    const theme = container.getAttribute('data-theme') || 'light';

    if (!storeId || !customerId) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
          <p><strong>Vayva Loyalty Program</strong></p>
          <p>Missing store or customer ID</p>
        </div>
      `;
      return;
    }

    renderLoyaltyWidget(container, storeId, customerId, theme);
  }

  function renderLoyaltyWidget(
    container: HTMLElement,
    storeId: string,
    customerId: string,
    theme: string,
  ) {
    // Fetch loyalty data
    fetch(`${VAYVA_API_BASE}/api/embedded/loyalty?storeId=${storeId}&customerId=${customerId}`)
      .then(res => res.json())
      .then((data: unknown) => {
        const payload = data as LoyaltyPayload;
        if (payload.error) throw new Error(payload.error);
        displayWidget(container, payload, theme, storeId, customerId);
      })
      .catch(err => {
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #ef4444;">
            <p>❌ Failed to load loyalty points</p>
          </div>
        `;
      });
  }

  function displayWidget(
    container: HTMLElement,
    data: LoyaltyPayload,
    theme: string,
    storeId: string,
    customerId: string,
  ) {
    const { customer, tier, pointsToNextTier, rewards } = data;

    container.innerHTML = `
      <style>
        .vayva-loyalty-card {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 20px;
          padding: 32px;
          color: white;
          box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .vayva-loyalty-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .vayva-loyalty-header {
          position: relative;
          z-index: 1;
          margin-bottom: 24px;
        }
        
        .vayva-loyalty-title {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .vayva-points-display {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .vayva-points-number {
          font-size: 64px;
          font-weight: 900;
          line-height: 1;
        }
        
        .vayva-points-label {
          font-size: 20px;
          font-weight: 600;
        }
        
        .vayva-tier-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }
        
        .vayva-progress-section {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }
        
        .vayva-progress-label {
          font-size: 13px;
          margin-bottom: 8px;
          opacity: 0.9;
        }
        
        .vayva-progress-bar {
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .vayva-progress-fill {
          height: 100%;
          background: white;
          border-radius: 6px;
          transition: width 0.5s ease;
        }
        
        .vayva-progress-text {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .vayva-rewards-section {
          margin-top: 20px;
        }
        
        .vayva-rewards-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .vayva-rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        
        .vayva-reward-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }
        
        .vayva-reward-card:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }
        
        .vayva-reward-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .vayva-reward-name {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .vayva-reward-cost {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .vayva-claim-btn {
          width: 100%;
          padding: 12px;
          background: white;
          color: #f59e0b;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 16px;
        }
        
        .vayva-claim-btn:hover {
          background: #fef3c7;
          transform: scale(1.02);
        }
        
        .vayva-earn-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .vayva-earn-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        
        .vayva-earn-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .vayva-earn-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-size: 13px;
        }
        
        .vayva-earn-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
      </style>
      
      <div class="vayva-loyalty-card">
        <div class="vayva-loyalty-header">
          <div class="vayva-loyalty-title">${customer.name}'s Loyalty Points</div>
          <div class="vayva-points-display">
            <span class="vayva-points-number">${customer.points.toLocaleString()}</span>
            <span class="vayva-points-label">points</span>
          </div>
          <div class="vayva-tier-badge">🏆 ${tier.name} Member</div>
        </div>
        
        <div class="vayva-progress-section">
          <div class="vayva-progress-label">Progress to ${tier.nextTier}</div>
          <div class="vayva-progress-bar">
            <div class="vayva-progress-fill" style="width: ${tier.progressPercentage}%"></div>
          </div>
          <div class="vayva-progress-text">
            ${pointsToNextTier.toLocaleString()} more points to reach ${tier.nextTier}
          </div>
        </div>
        
        ${rewards.length > 0 ? `
        <div class="vayva-rewards-section">
          <div class="vayva-rewards-title">Available Rewards</div>
          <div class="vayva-rewards-grid">
            ${rewards.map((reward: LoyaltyReward) => `
              <div class="vayva-reward-card" onclick="window.vayvaClaimReward('${reward.id}', '${customerId}', '${storeId}')">
                <div class="vayva-reward-icon">${reward.icon}</div>
                <div class="vayva-reward-name">${reward.name}</div>
                <div class="vayva-reward-cost">${reward.points.toLocaleString()} pts</div>
              </div>
            `).join('')}
          </div>
          <button class="vayva-claim-btn" onclick="window.vayvaViewAllRewards('${storeId}', '${customerId}')">
            View All Rewards →
          </button>
        </div>
        ` : ''}
        
        <div class="vayva-earn-section">
          <div class="vayva-earn-title">How to Earn Points</div>
          <ul class="vayva-earn-list">
            <li class="vayva-earn-item">
              <div class="vayva-earn-icon">🛍️</div>
              <span>Make purchases (1 point per ₦100)</span>
            </li>
            <li class="vayva-earn-item">
              <div class="vayva-earn-icon">🎂</div>
              <span>Birthday bonus (+500 points)</span>
            </li>
            <li class="vayva-earn-item">
              <div class="vayva-earn-icon">👥</div>
              <span>Refer a friend (+1000 points)</span>
            </li>
            <li class="vayva-earn-item">
              <div class="vayva-earn-icon">⭐</div>
              <span>Write a review (+50 points)</span>
            </li>
          </ul>
        </div>
      </div>
    `;
  }

  // Expose global functions
  window.vayvaClaimReward = function(rewardId, customerId, storeId) {
    if (!confirm('Are you sure you want to claim this reward?')) return;

    fetch(`${VAYVA_API_BASE}/api/embedded/loyalty/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId, customerId, storeId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(`✓ Reward claimed! Your new balance: ${data.newBalance.toLocaleString()} points`);
        location.reload(); // Refresh to show updated points
      } else {
        alert('Error: ' + (data.error || 'Failed to claim reward'));
      }
    })
    .catch(err => {
      alert('Error claiming reward. Please try again.');
    });
  };

  window.vayvaViewAllRewards = function(storeId, customerId) {
    // In production, would open rewards catalog modal or redirect
    alert('Redirecting to rewards catalog...');
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoyaltyWidget);
  } else {
    initLoyaltyWidget();
  }
})();
