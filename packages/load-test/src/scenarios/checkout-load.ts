/**
 * Checkout Load Test Scenarios
 * Tests e-commerce checkout flows under load
 */

import { ScenarioDefinition } from '../index';

/**
 * Cart operations load test
 * Tests adding items to cart
 */
export const cartOperationsScenario: ScenarioDefinition = {
  name: 'checkout-cart-operations',
  description: 'Load test for cart add/update operations',
  execute: async (context) => {
    const start = performance.now();
    
    try {
      // Add item to cart
      const response = await context.request('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: `product-${context.workerId}-${context.iteration}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          variantId: null,
        }),
      });
      
      const duration = performance.now() - start;
      
      return {
        success: response.ok || response.status === 404, // 404 if product doesn't exist
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Checkout initiation load test
 * Tests starting the checkout process
 */
export const checkoutInitiationScenario: ScenarioDefinition = {
  name: 'checkout-initiation',
  description: 'Load test for checkout initiation',
  execute: async (context) => {
    const start = performance.now();
    
    try {
      const response = await context.request('/api/checkout/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: `cart-${context.workerId}-${Date.now()}`,
          customerEmail: `customer-${context.workerId}@test.com`,
        }),
      });
      
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Shipping calculation load test
 * Tests shipping rate calculations
 */
export const shippingCalculationScenario: ScenarioDefinition = {
  name: 'checkout-shipping-calculation',
  description: 'Load test for shipping rate calculations',
  execute: async (context) => {
    const start = performance.now();
    
    try {
      const response = await context.request('/api/checkout/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            country: 'US',
            postalCode: '10001',
            city: 'New York',
            state: 'NY',
          },
          items: [
            { productId: 'test-product', quantity: 2, weight: 1.5 },
          ],
        }),
      });
      
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Payment intent creation load test
 * Tests payment intent creation (Stripe/Paystack)
 */
export const paymentIntentScenario: ScenarioDefinition = {
  name: 'checkout-payment-intent',
  description: 'Load test for payment intent creation',
  execute: async (context) => {
    const start = performance.now();
    
    try {
      const response = await context.request('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.floor(Math.random() * 50000) + 1000, // Random amount between 10-500
          currency: 'USD',
          customerId: `customer-${context.workerId}`,
          metadata: {
            orderId: `order-${context.iteration}`,
          },
        }),
      });
      
      const duration = performance.now() - start;
      
      return {
        success: response.ok || response.status === 400, // 400 for validation errors
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Order creation load test
 * Tests complete order creation flow
 */
export const orderCreationScenario: ScenarioDefinition = {
  name: 'checkout-order-creation',
  description: 'Load test for order creation',
  execute: async (context) => {
    const start = performance.now();
    
    try {
      const response = await context.request('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              productId: `product-${context.iteration}`,
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 10000) + 1000,
            },
          ],
          shippingAddress: {
            firstName: 'Test',
            lastName: 'Customer',
            address1: '123 Test St',
            city: 'Test City',
            country: 'US',
            postalCode: '12345',
          },
          customerEmail: `customer-${context.workerId}@test.com`,
        }),
      });
      
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Complete checkout flow scenario
 * Simulates the entire checkout process
 */
export const completeCheckoutScenario: ScenarioDefinition = {
  name: 'checkout-complete-flow',
  description: 'End-to-end checkout flow load test',
  execute: async (context) => {
    const flowStart = performance.now();
    const steps: Array<{ name: string; success: boolean; duration: number }> = [];
    
    try {
      // Step 1: Add to cart
      const cartStart = performance.now();
      const cartResponse = await context.request('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: `product-${context.workerId}-${context.iteration}`,
          quantity: 1,
        }),
      });
      steps.push({
        name: 'add-to-cart',
        success: cartResponse.ok,
        duration: performance.now() - cartStart,
      });
      
      // Step 2: Get shipping rates
      const shippingStart = performance.now();
      const shippingResponse = await context.request('/api/checkout/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            country: 'US',
            postalCode: '10001',
          },
          items: [{ productId: 'test', quantity: 1, weight: 1 }],
        }),
      });
      steps.push({
        name: 'shipping-rates',
        success: shippingResponse.ok,
        duration: performance.now() - shippingStart,
      });
      
      // Step 3: Create payment intent
      const paymentStart = performance.now();
      const paymentResponse = await context.request('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          currency: 'USD',
        }),
      });
      steps.push({
        name: 'payment-intent',
        success: paymentResponse.ok,
        duration: performance.now() - paymentStart,
      });
      
      // Step 4: Create order
      const orderStart = performance.now();
      const orderResponse = await context.request('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: 'test', quantity: 1, price: 5000 }],
          customerEmail: `customer-${context.workerId}@test.com`,
        }),
      });
      steps.push({
        name: 'create-order',
        success: orderResponse.ok,
        duration: performance.now() - orderStart,
      });
      
      const totalDuration = performance.now() - flowStart;
      const allSuccessful = steps.every(s => s.success);
      
      return {
        success: allSuccessful,
        statusCode: allSuccessful ? 200 : 500,
        duration: totalDuration,
        metadata: { steps },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - flowStart,
        error: error as Error,
        metadata: { steps },
      };
    }
  },
};

/**
 * Inventory reservation load test
 * Tests inventory reservation under concurrent load
 */
export const inventoryReservationScenario: ScenarioDefinition = {
  name: 'checkout-inventory-reservation',
  description: 'Load test for inventory reservation system',
  execute: async (context) => {
    const start = performance.now();
    
    try {
      const response = await context.request('/api/inventory/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'limited-stock-product',
          quantity: 1,
          reservationId: `res-${context.workerId}-${context.iteration}`,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
      });
      
      const duration = performance.now() - start;
      
      return {
        success: response.ok || response.status === 409, // 409 for out of stock
        statusCode: response.status,
        duration,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
      };
    }
  },
};

/**
 * Black Friday simulation
 * Extreme load test simulating Black Friday traffic
 */
export const blackFridayScenario: ScenarioDefinition = {
  name: 'checkout-black-friday',
  description: 'Black Friday traffic simulation',
  execute: async (context) => {
    const actions = [
      { weight: 50, type: 'browse', fn: () => context.request('/api/storefront/products') },
      { weight: 30, type: 'cart', fn: () => context.request('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'bf-deal', quantity: 1 }),
      })},
      { weight: 15, type: 'checkout', fn: () => context.request('/api/checkout/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: `bf-${context.workerId}` }),
      })},
      { weight: 5, type: 'order', fn: () => context.request('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: 'bf-deal', quantity: 1, price: 9900 }],
          customerEmail: `bf-${context.workerId}@test.com`,
        }),
      })},
    ];
    
    // Weighted random selection
    const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    let selected = actions[0];
    
    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) {
        selected = action;
        break;
      }
    }
    
    const start = performance.now();
    try {
      const response = await selected.fn();
      const duration = performance.now() - start;
      
      return {
        success: response.ok,
        statusCode: response.status,
        duration,
        metadata: { actionType: selected.type },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        duration: performance.now() - start,
        error: error as Error,
        metadata: { actionType: selected.type },
      };
    }
  },
};

// Default export
export default {
  cartOperationsScenario,
  checkoutInitiationScenario,
  shippingCalculationScenario,
  paymentIntentScenario,
  orderCreationScenario,
  completeCheckoutScenario,
  inventoryReservationScenario,
  blackFridayScenario,
};
