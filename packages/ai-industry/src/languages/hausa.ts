/**
 * Hausa Language Handler
 * Specialized handling for Hausa language conversations
 */

import type { LanguageCode } from '../types';

export class HausaHandler {
  readonly code: LanguageCode = 'ha';
  readonly name = 'Hausa';
  readonly nativeName = 'Hausa';

  phrases = {
    greetings: {
      morning: 'Barka da safiya',
      afternoon: 'Barka da rana',
      evening: 'Barka da yamma',
      general: 'Sannu',
    },
    courtesy: {
      please: 'Da fatan za a',
      thankYou: 'Na gode',
      sorry: 'Yi hakuri',
      welcome: 'Barka da zuwa',
    },
    commerce: {
      buy: 'saya',
      sell: 'sayarwa',
      price: 'farashin',
      discount: 'rangwame',
      delivery: 'iskiya',
      payment: 'biyan kuɗi',
    },
  };

  /**
   * Check if message is in Hausa
   */
  isHausa(message: string): boolean {
    const hausaPatterns = [
      /[āīūēō]/i,
      /\b(sannu|na gode|yaya|lafiya|barka|ina so|nawa|a yi)\b/i,
    ];
    return hausaPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Translate common e-commerce phrases to Hausa
   */
  translate(key: string): string {
    const translations: Record<string, string> = {
      'product.inquiry': 'Ina so in sani game da wannan kayan',
      'price.inquiry': 'Nawa ne farashin?',
      'stock.inquiry': 'Kuna da wannan a shagonku?',
      'order.status': 'Yaya matsayin odar na yake?',
      'delivery.time': 'Yaya tsawan lokacin iskiya?',
      'payment.options': 'Wadanne hanyoyin biyan kuɗi kuna da su?',
      'return.policy': 'Mene ne dokar mayar da kayan?',
      'size.inquiry': 'Wadanne girman kuna da su?',
      'color.inquiry': 'Wadanne launuka kuna da su?',
      'discount.inquiry': 'Akwai rangwame?',
    };

    return translations[key] || key;
  }

  /**
   * Generate Hausa response based on intent
   */
  generateResponse(intent: string, data?: Record<string, unknown>): string {
    const responses: Record<string, string> = {
      'greeting': 'Sannu! Yaya zan iya taimaka maka yau?',
      'product.found': `Mun samu kayan da kake nema. Farashinsa ne ₦${data?.price || 0}.`,
      'product.notfound': 'Yi hakuri, ba mu samun wannan kayan ba. Kana so ka duba wasu?',
      'order.confirmed': `An tabbatar da odar ku! Lambar odar ku ita ce ${data?.orderId || 'N/A'}.`,
      'delivery.estimate': `Lokacin iskiya kwanaki ${data?.days || 3} ne.`,
      'payment.success': 'Biyan kuɗi ya yi nasara! Mun gode da kasuwanci.',
      'escalate': 'Yi hakuri, zan haɗa ku da wakilin mu.',
    };

    return responses[intent] || responses['greeting'];
  }

  /**
   * Extract entities from Hausa message
   */
  extractEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};
    
    const priceMatch = message.match(/(farashin|₦|N)\s*(\d+)/i);
    if (priceMatch) {
      entities.price = priceMatch[2];
    }
    
    const qtyMatch = message.match(/(uku|hudu|biyar|shida|bakwai|takwas|tara|goma|(\d+))/i);
    if (qtyMatch) {
      const hausaNumbers: Record<string, string> = {
        'uku': '3', 'hudu': '4', 'biyar': '5',
        'shida': '6', 'bakwai': '7', 'takwas': '8',
        'tara': '9', 'goma': '10',
      };
      entities.quantity = hausaNumbers[qtyMatch[1].toLowerCase()] || qtyMatch[1];
    }
    
    const colorMatch = message.match(/(fari|baki|ja|kore|rawaya|shudi|yayi)/i);
    if (colorMatch) {
      entities.color = colorMatch[1];
    }
    
    return entities;
  }
}

export default new HausaHandler();
