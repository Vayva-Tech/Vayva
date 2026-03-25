export {};

declare global {
  interface Window {
    vayvaShowReviewForm?: () => void;
    vayvaSetRating?: (rating: number) => void;
    vayvaSubmitReview?: (event: Event, storeId: string, productId: string) => void;
  }
}

interface ReviewRow {
  customerName: string;
  createdAt: string;
  rating: number;
  title?: string;
  content: string;
}

interface ReviewsPayload {
  error?: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewRow[];
}

/**
 * Vayva Review & Testimonial Collector Widget
 * 
 * Usage:
 * <script src="https://vayva.ng/widgets/review-collector.js"></script>
 * <div id="vayva-review-widget" data-store-id="xxx" data-product-id="yyy"></div>
 */

(function() {
  'use strict';

  const VAYVA_API_BASE = 'https://api.vayva.ng';
  
  function initReviewWidget() {
    const container = document.getElementById('vayva-review-widget');
    
    if (!(container instanceof HTMLElement)) return;

    const storeId = container.getAttribute('data-store-id');
    const productId = container.getAttribute('data-product-id');
    const theme = container.getAttribute('data-theme') || 'light';
    const displayMode = container.getAttribute('data-display') || 'full'; // 'full', 'form-only', 'reviews-only'

    if (!storeId) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #6b7280;">
          <p><strong>Vayva Reviews</strong></p>
          <p>Missing store ID</p>
        </div>
      `;
      return;
    }

    renderReviewWidget(container, storeId, productId, theme, displayMode);
  }

  function renderReviewWidget(
    container: HTMLElement,
    storeId: string,
    productId: string | null,
    theme: string,
    displayMode: string,
  ) {
    // Fetch reviews and average rating
    fetch(`${VAYVA_API_BASE}/api/embedded/reviews?storeId=${storeId}${productId ? '&productId=' + productId : ''}`)
      .then(res => res.json())
      .then((data: unknown) => {
        const payload = data as ReviewsPayload;
        if (payload.error) throw new Error(payload.error);
        displayReviews(container, payload, theme, displayMode, productId, storeId);
      })
      .catch(err => {
        console.error('[Vayva] Failed to load reviews:', err);
        if (displayMode !== 'reviews-only') {
          displayReviews(
            container,
            { averageRating: 0, totalReviews: 0, reviews: [] },
            theme,
            'form-only',
            productId,
            storeId,
          );
        } else {
          container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #ef4444;">
          <p><strong>Could not load reviews</strong></p>
          <p style="font-size: 14px; color: #6b7280;">Please try again later.</p>
        </div>
      `;
        }
      });
  }

  function displayReviews(
    container: HTMLElement,
    data: ReviewsPayload,
    theme: string,
    displayMode: string,
    productId: string | null,
    storeId: string,
  ) {
    const { averageRating, totalReviews, reviews } = data;

    const html = `
      <style>
        .vayva-reviews-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .vayva-summary-card {
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }
        
        .vayva-rating-large {
          font-size: 72px;
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }
        
        .vayva-stars {
          display: flex;
          gap: 4px;
          margin: 12px 0;
          font-size: 24px;
        }
        
        .vayva-star-filled { color: #fbbf24; }
        .vayva-star-empty { color: ${theme === 'dark' ? '#4b5563' : '#d1d5db'}; }
        
        .vayva-total-reviews {
          font-size: 14px;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
        }
        
        .vayva-write-btn {
          margin-top: 20px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vayva-write-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .vayva-review-form {
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }
        
        .vayva-form-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-star-input {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .vayva-star-btn {
          background: none;
          border: none;
          font-size: 40px;
          cursor: pointer;
          transition: transform 0.2s;
          color: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
        }
        
        .vayva-star-btn.active,
        .vayva-star-btn:hover {
          color: #fbbf24;
          transform: scale(1.1);
        }
        
        .vayva-input-group {
          margin-bottom: 16px;
        }
        
        .vayva-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          border-radius: 12px;
          font-size: 15px;
          background: ${theme === 'dark' ? '#374151' : '#f9fafb'};
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
          transition: border-color 0.2s;
        }
        
        .vayva-input:focus {
          outline: none;
          border-color: #10b981;
        }
        
        .vayva-textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .vayva-submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .vayva-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }
        
        .vayva-review-card {
          background: ${theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .vayva-review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .vayva-reviewer-name {
          font-size: 16px;
          font-weight: 700;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-review-date {
          font-size: 13px;
          color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
        }
        
        .vayva-review-stars {
          margin-bottom: 12px;
          font-size: 18px;
        }
        
        .vayva-review-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 8px;
          color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        
        .vayva-review-content {
          font-size: 14px;
          line-height: 1.6;
          color: ${theme === 'dark' ? '#d1d5db' : '#374151'};
        }
        
        .vayva-success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .vayva-hidden { display: none; }
      </style>
      
      <div class="vayva-reviews-container">
        ${displayMode === 'full' ? `
        <div class="vayva-summary-card">
          <div class="vayva-rating-large">${averageRating.toFixed(1)}</div>
          <div class="vayva-stars">
            ${[1, 2, 3, 4, 5].map(star => `
              <span class="${star <= Math.round(averageRating) ? 'vayva-star-filled' : 'vayva-star-empty'}">★</span>
            `).join('')}
          </div>
          <div class="vayva-total-reviews">Based on ${totalReviews} reviews</div>
          <button class="vayva-write-btn" onclick="window.vayvaShowReviewForm()">✍️ Write a Review</button>
        </div>
        ` : ''}
        
        ${displayMode !== 'reviews-only' ? `
        <div id="vayva-review-form-container" class="vayva-review-form vayva-hidden">
          <h3 class="vayva-form-title">Write a Review</h3>
          <form onsubmit="window.vayvaSubmitReview(event, '${storeId}', '${productId || ''}')">
            <div class="vayva-star-input" id="vayva-star-input">
              ${[1, 2, 3, 4, 5].map(star => `
                <button type="button" class="vayva-star-btn" data-rating="${star}" onclick="window.vayvaSetRating(${star})">★</button>
              `).join('')}
            </div>
            
            <div class="vayva-input-group">
              <label class="vayva-label">Your Name</label>
              <input type="text" class="vayva-input" name="name" required placeholder="John Doe" />
            </div>
            
            <div class="vayva-input-group">
              <label class="vayva-label">Email</label>
              <input type="email" class="vayva-input" name="email" required placeholder="john@example.com" />
            </div>
            
            ${productId ? `
            <div class="vayva-input-group">
              <label class="vayva-label">Review Title</label>
              <input type="text" class="vayva-input" name="title" required placeholder="Sum up your experience" />
            </div>
            
            <div class="vayva-input-group">
              <label class="vayva-label">Your Review</label>
              <textarea class="vayva-input vayva-textarea" name="content" required placeholder="Share your experience with this product..."></textarea>
            </div>
            ` : `
            <div class="vayva-input-group">
              <label class="vayva-label">Your Testimonial</label>
              <textarea class="vayva-input vayva-textarea" name="content" required placeholder="Share your experience with us..."></textarea>
            </div>
            `}
            
            <button type="submit" class="vayva-submit-btn">Submit Review</button>
          </form>
        </div>
        ` : ''}
        
        <div id="vayva-success-message" class="vayva-success-message vayva-hidden">
          ✓ Thank you! Your review has been submitted and is awaiting approval.
        </div>
        
        ${displayMode !== 'form-only' && reviews.length > 0 ? `
        <div class="vayva-reviews-list">
          ${reviews.map((review: ReviewRow) => `
            <div class="vayva-review-card">
              <div class="vayva-review-header">
                <div class="vayva-reviewer-name">${review.customerName}</div>
                <div class="vayva-review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
              <div class="vayva-review-stars">
                ${[1, 2, 3, 4, 5].map(star => `
                  <span class="${star <= review.rating ? 'vayva-star-filled' : 'vayva-star-empty'}">★</span>
                `).join('')}
              </div>
              ${review.title ? `<div class="vayva-review-title">${review.title}</div>` : ''}
              <div class="vayva-review-content">${review.content}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = html;
  }

  // Expose global functions
  window.vayvaShowReviewForm = function() {
    const formContainer = document.getElementById('vayva-review-form-container');
    if (formContainer) {
      formContainer.classList.remove('vayva-hidden');
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  window.vayvaSetRating = function(rating: number) {
    const buttons = Array.from(document.querySelectorAll('.vayva-star-btn'));
    buttons.forEach((btn, index) => {
      if (index < rating) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    const target = buttons[rating - 1];
    if (target instanceof HTMLElement) target.dataset.selected = 'true';
  };

  window.vayvaSubmitReview = async function(
    event: Event,
    storeId: string,
    productId: string,
  ) {
    event.preventDefault();

    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const formData = new FormData(form);

    const selectedRating = document.querySelector('.vayva-star-btn[data-selected="true"]');
    if (!(selectedRating instanceof HTMLElement) || !selectedRating.dataset.rating) {
      alert('Please select a star rating');
      return;
    }

    const reviewData = {
      storeId,
      productId: productId || null,
      rating: parseInt(selectedRating.dataset.rating, 10),
      customerName: formData.get('name'),
      customerEmail: formData.get('email'),
      title: formData.get('title'),
      content: formData.get('content'),
    };

    try {
      const response = await fetch(`${VAYVA_API_BASE}/api/embedded/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      const result: unknown = await response.json();
      const ok =
        typeof result === 'object' &&
        result !== null &&
        'success' in result &&
        (result as { success: boolean }).success;

      if (ok) {
        form.parentElement?.classList.add('vayva-hidden');
        const successMsg = document.getElementById('vayva-success-message');
        if (successMsg) successMsg.classList.remove('vayva-hidden');
      } else {
        const errMsg =
          typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof (result as { error: unknown }).error === 'string'
            ? (result as { error: string }).error
            : 'Failed to submit review';
        throw new Error(errMsg);
      }
    } catch (err: unknown) {
      alert(
        'Error submitting review: ' +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviewWidget);
  } else {
    initReviewWidget();
  }
})();
