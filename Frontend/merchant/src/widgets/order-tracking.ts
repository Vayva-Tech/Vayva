// @ts-nocheck
/**
 * Vayva Order Tracking Widget
 * 
 * Usage:
 * <script src="https://vayva.ng/widgets/order-tracking.js"></script>
 * <div id="vayva-order-tracker" data-store-id="xxx"></div>
 */

(function() {
  'use strict';

  const VAYVA_API_BASE = 'https://api.vayva.ng';
  
  function initTracker() {
    const container = document.getElementById('vayva-order-tracker');
    
    if (!container) {
      console.error('[Vayva] Order tracker container not found');
      return;
    }

    const storeId = container.getAttribute('data-store-id');
    const theme = container.getAttribute('data-theme') || 'light';
    const language = container.getAttribute('data-lang') || 'en';

    if (!storeId) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
          <p style="font-size: 16px; margin-bottom: 8px;"><strong>Vayva Order Tracker</strong></p>
          <p>Please provide store-id attribute</p>
        </div>
      `;
      return;
    }

    // Show tracking input form
    renderTrackingForm(container, storeId, theme);
  }

  function renderTrackingForm(container, storeId, theme) {
    container.innerHTML = `
      <style>
        .vayva-tracker {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .vayva-tracker-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .vayva-tracker-subtitle {
          font-size: 14px;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          margin-bottom: 24px;
        }
        
        .vayva-input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .vayva-input {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          border-radius: 12px;
          font-size: 15px;
          background: ${theme === 'dark' ? '#374151' : 'white'};
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
          transition: border-color 0.2s;
        }
        
        .vayva-input:focus {
          outline: none;
          border-color: #10b981;
        }
        
        .vayva-btn {
          padding: 14px 28px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vayva-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .vayva-status-card {
          background: ${theme === 'dark' ? '#374151' : '#f9fafb'};
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
        }
        
        .vayva-status-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .vayva-status-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        
        .vayva-status-pending { background: #fef3c7; }
        .vayva-status-processing { background: #dbeafe; }
        .vayva-status-shipped { background: #e0e7ff; }
        .vayva-status-delivered { background: #d1fae5; }
        
        .vayva-status-title {
          font-size: 20px;
          font-weight: 700;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-timeline {
          position: relative;
          padding-left: 32px;
        }
        
        .vayva-timeline::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        }
        
        .vayva-timeline-item {
          position: relative;
          padding-bottom: 24px;
        }
        
        .vayva-timeline-item:last-child {
          padding-bottom: 0;
        }
        
        .vayva-timeline-dot {
          position: absolute;
          left: -28px;
          top: 4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          border: 3px solid ${theme === 'dark' ? '#1f2937' : 'white'};
        }
        
        .vayva-timeline-dot.active {
          background: #10b981;
        }
        
        .vayva-timeline-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
          margin-bottom: 4px;
        }
        
        .vayva-timeline-date {
          font-size: 13px;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
        }
        
        .vayva-order-details {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        }
        
        .vayva-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 14px;
        }
        
        .vayva-detail-label {
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
        }
        
        .vayva-detail-value {
          font-weight: 600;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-loading {
          text-align: center;
          padding: 40px;
        }
        
        .vayva-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .vayva-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
        }
      </style>
      
      <div class="vayva-tracker">
        <h2 class="vayva-tracker-title">📦 Track Your Order</h2>
        <p class="vayva-tracker-subtitle">Enter your order number and email to track delivery status</p>
        
        <div class="vayva-input-group">
          <input 
            type="text" 
            class="vayva-input" 
            id="vayva-order-number"
            placeholder="Order Number (e.g., ORD-123456)"
          />
          <input 
            type="email" 
            class="vayva-input" 
            id="vayva-order-email"
            placeholder="Your Email"
          />
        </div>
        
        <button class="vayva-btn" onclick="window.vayvaTrackOrder('${storeId}')">
          Track Order
        </button>
        
        <div id="vayva-tracking-result"></div>
      </div>
    `;
  }

  // Expose global function
  window.vayvaTrackOrder = function(storeId) {
    const orderNumber = document.getElementById('vayva-order-number').value.trim();
    const email = document.getElementById('vayva-order-email').value.trim();
    const resultDiv = document.getElementById('vayva-tracking-result');

    if (!orderNumber || !email) {
      resultDiv.innerHTML = '<div class="vayva-error">Please enter both order number and email</div>';
      return;
    }

    // Show loading
    resultDiv.innerHTML = `
      <div class="vayva-loading">
        <div class="vayva-spinner"></div>
        <p>Finding your order...</p>
      </div>
    `;

    fetch(`${VAYVA_API_BASE}/api/embedded/orders/track?storeId=${storeId}&orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        renderTrackingResult(resultDiv, data.order, data.timeline);
      })
      .catch(err => {
        resultDiv.innerHTML = `<div class="vayva-error">❌ ${err.message || 'Order not found. Please check your details.'}</div>`;
      });
  };

  function renderTrackingResult(container, order, timeline) {
    const statusIcons = {
      'PENDING': '⏳',
      'PROCESSING': '🔄',
      'SHIPPED': '🚚',
      'DELIVERED': '✅',
      'CANCELLED': '❌'
    };

    const statusClasses = {
      'PENDING': 'vayva-status-pending',
      'PROCESSING': 'vayva-status-processing',
      'SHIPPED': 'vayva-status-shipped',
      'DELIVERED': 'vayva-status-delivered',
      'CANCELLED': 'vayva-status-cancelled'
    };

    container.innerHTML = `
      <div class="vayva-status-card">
        <div class="vayva-status-header">
          <div class="vayva-status-icon ${statusClasses[order.status] || 'vayva-status-pending'}">
            ${statusIcons[order.status] || '⏳'}
          </div>
          <div>
            <div class="vayva-status-title">Order ${order.orderNumber}</div>
            <div style="color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; font-size: 14px;">
              Status: <strong>${order.status}</strong>
            </div>
          </div>
        </div>
        
        <div class="vayva-timeline">
          ${timeline.map((event, index) => `
            <div class="vayva-timeline-item">
              <div class="vayva-timeline-dot ${index === timeline.length - 1 ? 'active' : ''}"></div>
              <div class="vayva-timeline-title">${event.title}</div>
              <div class="vayva-timeline-date">${new Date(event.date).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="vayva-order-details">
          <div class="vayva-detail-row">
            <span class="vayva-detail-label">Customer</span>
            <span class="vayva-detail-value">${order.customerName}</span>
          </div>
          <div class="vayva-detail-row">
            <span class="vayva-detail-label">Items</span>
            <span class="vayva-detail-value">${order.itemCount} products</span>
          </div>
          <div class="vayva-detail-row">
            <span class="vayva-detail-label">Total</span>
            <span class="vayva-detail-value">₦${order.total.toLocaleString()}</span>
          </div>
          ${order.deliveryAddress ? `
          <div class="vayva-detail-row">
            <span class="vayva-detail-label">Delivery Address</span>
            <span class="vayva-detail-value">${order.deliveryAddress}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
  } else {
    initTracker();
  }
})();
