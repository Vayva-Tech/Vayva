/**
 * Yoruba Language Handler
 * Specialized handling for Yoruba language conversations
 */

import type { LanguageCode } from '../types';

export class YorubaHandler {
  readonly code: LanguageCode = 'yo';
  readonly name = 'Yoruba';
  readonly nativeName = 'Yorùbá';

  // Common Yoruba phrases for e-commerce
  phrases = {
    greetings: {
      morning: 'Ẹ kú àárọ̀',
      afternoon: 'Ẹ kú ọ̀sán',
      evening: 'Ẹ kú ìrọ̀lẹ́',
      general: 'Ẹ kú àárọ̀',
    },
    courtesy: {
      please: 'Ẹ jọ̀wọ́',
      thankYou: 'Ẹ ṣéun',
      sorry: 'Ẹ má bínú',
      welcome: 'Ẹ kú àbọ̀',
    },
    commerce: {
      buy: 'rà',
      sell: 'tà',
      price: 'owo',
      discount: 'ìdíyelé',
      delivery: 'ìfiránsẹ́',
      payment: 'isanwo',
    },
  };

  /**
   * Check if message is in Yoruba
   */
  isYoruba(message: string): boolean {
    const yorubaPatterns = [
      /[ẹéèṣśàáìíòóùúọǫ]/i, // Yoruba diacritics
      /\b(ba wo ni|e ku|e se|o da bo|jowo|mo fe|emi yoo|a ni)\b/i,
    ];
    return yorubaPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Translate common e-commerce phrases to Yoruba
   */
  translate(key: string): string {
    const translations: Record<string, string> = {
      'product.inquiry': 'Mo fẹ́ mọ̀ nípa ọjà yìí',
      'price.inquiry': 'Ìwọ̀n owo wo ni ó wà?',
      'stock.inquiry': 'Ṣé ẹ ní èyí ní ìtàjí?',
      'order.status': 'Ìpò àṣẹ mi wo ni?',
      'delivery.time': 'Àkókò ìfiránsẹ́ wo ni?',
      'payment.options': 'Àwọn àṣàyàn ìsanwó wo ni ẹ ní?',
      'return.policy': 'Òfin ìdápadà wo ni?',
      'size.inquiry': 'Àwọn ìwọ̀n wo ni ẹ ní?',
      'color.inquiry': 'Àwọn àwọ̀ wo ni ó wà?',
      'discount.inquiry': 'Ṣé ìdíyelé kan wà?',
    };

    return translations[key] || key;
  }

  /**
   * Generate Yoruba response based on intent
   */
  generateResponse(intent: string, data?: Record<string, unknown>): string {
    const responses: Record<string, string> = {
      'greeting': 'Ẹ kú àárọ̀! Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́ lónìí?',
      'product.found': `A rí ọjà tí ẹ ń wá. Owo rẹ̀ ni ₦${data?.price || 0}.`,
      'product.notfound': 'Ma binu, a ko ri ọja naa. Ṣé ẹ fẹ́ wo àwọn mìíràn?',
      'order.confirmed': `Aṣẹ rẹ ti jẹ́rìísí! Nọ́mbà àṣẹ rẹ ni ${data?.orderId || 'N/A'}.`,
      'delivery.estimate': `Àsìkò ìfiránsẹ́ ni ọjọ́ ${data?.days || 3} tó ń bọ̀.`,
      'payment.success': 'Ísanwó yàtọ̀ sí! A dupẹ́ fún ìṣòwò yín.',
      'escalate': 'Ẹ jọ̀wọ́ ẹ má bínú, emi yoo so ọ́ pọ̀ pẹ̀lú aṣáájú wa.',
    };

    return responses[intent] || responses['greeting'];
  }

  /**
   * Extract entities from Yoruba message
   */
  extractEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};
    
    // Extract price mentions
    const priceMatch = message.match(/(owo|₦|N)\s*(\d+)/i);
    if (priceMatch) {
      entities.price = priceMatch[2];
    }
    
    // Extract quantity
    const qtyMatch = message.match(/(mẹta|mẹ́rin|márùn-ún|mẹ́fà|mẹ́je|mẹ́jọ|mẹ́sàn-án|mẹ́wàá|(\d+))/i);
    if (qtyMatch) {
      const yorubaNumbers: Record<string, string> = {
        'mẹta': '3', 'mẹ́rin': '4', 'márùn-ún': '5',
        'mẹ́fà': '6', 'mẹ́je': '7', 'mẹ́jọ': '8',
        'mẹ́sàn-án': '9', 'mẹ́wàá': '10',
      };
      entities.quantity = yorubaNumbers[qtyMatch[1].toLowerCase()] || qtyMatch[1];
    }
    
    // Extract color
    const colorMatch = message.match(/(funfun|dúdú|pupa|àwọ̀ ewé|àwọ̀ ofeefee|àwọ̀ búlùù|àwọ̀ yẹ̀lò)/i);
    if (colorMatch) {
      entities.color = colorMatch[1];
    }
    
    return entities;
  }
}

export default new YorubaHandler();
