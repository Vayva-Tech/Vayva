/**
 * Nigerian Pidgin Language Handler
 * Specialized handling for Nigerian Pidgin conversations
 */

import type { LanguageCode } from '../types';

export class PidginHandler {
  readonly code: LanguageCode = 'pcm';
  readonly name = 'Nigerian Pidgin';
  readonly nativeName = 'Naija Pidgin';

  phrases = {
    greetings: {
      morning: 'How far',
      afternoon: 'How far',
      evening: 'How far',
      general: 'How far',
    },
    courtesy: {
      please: 'Abeg',
      thankYou: 'Thank you well well',
      sorry: 'Sorry',
      welcome: 'You welcome',
    },
    commerce: {
      buy: 'buy',
      sell: 'sell',
      price: 'price',
      discount: 'discount',
      delivery: 'delivery',
      payment: 'payment',
    },
  };

  /**
   * Check if message is in Pidgin
   */
  isPidgin(message: string): boolean {
    const pidginPatterns = [
      /\b(dey|fit|wahala|how far|wetin|na|abi|o|sabi|gbege|kpele|shakara)\b/i,
      /\b(waka|chop|tok|do|make|go|come)\b/i,
    ];
    return pidginPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Translate common e-commerce phrases to Pidgin
   */
  translate(key: string): string {
    const translations: Record<string, string> = {
      'product.inquiry': 'I wan sabi about this product',
      'price.inquiry': 'How much be the price?',
      'stock.inquiry': 'Una get this one for shop?',
      'order.status': 'How my order dey?',
      'delivery.time': 'When the delivery go reach?',
      'payment.options': 'Which way I fit take pay?',
      'return.policy': 'Wetin be the return policy?',
      'size.inquiry': 'Which sizes una get?',
      'color.inquiry': 'Which colors dey available?',
      'discount.inquiry': 'Any discount dey?',
    };

    return translations[key] || key;
  }

  /**
   * Generate Pidgin response based on intent
   */
  generateResponse(intent: string, data?: Record<string, unknown>): string {
    const responses: Record<string, string> = {
      'greeting': 'How far! How I fit help you today?',
      'product.found': `We don see the product wey you dey find. E cost ₦${data?.price || 0}.`,
      'product.notfound': 'Sorry, we no see that product. You wan check others?',
      'order.confirmed': `Your order don confirm! Your order number na ${data?.orderId || 'N/A'}.`,
      'delivery.estimate': `Delivery go reach within ${data?.days || 3} days.`,
      'payment.success': 'Payment don go! Thanks for the business.',
      'escalate': 'No wahala, I go connect you with our person.',
    };

    return responses[intent] || responses['greeting'];
  }

  /**
   * Extract entities from Pidgin message
   */
  extractEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};
    
    const priceMatch = message.match(/(price|cost|₦|N)\s*(\d+)/i);
    if (priceMatch) {
      entities.price = priceMatch[2];
    }
    
    const qtyMatch = message.match(/(three|four|five|six|seven|eight|nine|ten|(\d+))\s*(pieces?|items?)/i);
    if (qtyMatch) {
      const wordNumbers: Record<string, string> = {
        'three': '3', 'four': '4', 'five': '5',
        'six': '6', 'seven': '7', 'eight': '8',
        'nine': '9', 'ten': '10',
      };
      entities.quantity = wordNumbers[qtyMatch[1].toLowerCase()] || qtyMatch[1];
    }
    
    const colorMatch = message.match(/(white|black|red|green|yellow|blue|pink|brown)/i);
    if (colorMatch) {
      entities.color = colorMatch[1];
    }
    
    return entities;
  }
}

export default new PidginHandler();
