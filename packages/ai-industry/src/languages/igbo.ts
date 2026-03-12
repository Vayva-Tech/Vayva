/**
 * Igbo Language Handler
 * Specialized handling for Igbo language conversations
 */

import type { LanguageCode } from '../types';

export class IgboHandler {
  readonly code: LanguageCode = 'ig';
  readonly name = 'Igbo';
  readonly nativeName = 'Igbo';

  phrases = {
    greetings: {
      morning: 'Ụtụtụ ọma',
      afternoon: 'Ehihie ọma',
      evening: 'Mgbede ọma',
      general: 'Nnọọ',
    },
    courtesy: {
      please: 'Biko',
      thankYou: 'Daalụ',
      sorry: 'Ndo',
      welcome: 'Nno',
    },
    commerce: {
      buy: 'zụrọ',
      sell: 'reere',
      price: 'ego',
      discount: 'nkwụnye ụgwọ',
      delivery: 'nbubata',
      payment: 'ịkwụ ụgwọ',
    },
  };

  /**
   * Check if message is in Igbo
   */
  isIgbo(message: string): boolean {
    const igboPatterns = [
      /[ịụḅḍṅṇ]/i,
      /\b(nnọọ|kedu|imela|daalụ|biko|achọrọ m|ego|ole)\b/i,
    ];
    return igboPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Translate common e-commerce phrases to Igbo
   */
  translate(key: string): string {
    const translations: Record<string, string> = {
      'product.inquiry': 'Achọrọ m ịmata ihe gbasara ihe a',
      'price.inquiry': 'Gịnị bụ ọnụahịa ya?',
      'stock.inquiry': 'Ị nwere nke a nahịa?',
      'order.status': 'Kedu ọnọdụ iwu m?',
      'delivery.time': 'Ogologo oge nbubata gụnyere?',
      'payment.options': 'Kedu nhọrọ ịkwụ ụgwọ ị nwere?',
      'return.policy': 'Gịnị bụ iwu nke inyghachi azụ?',
      'size.inquiry': 'Kedu nha ị nwere?',
      'color.inquiry': 'Kedu agba ị nwere?',
      'discount.inquiry': 'Ọ dị nkwụnye ụgwọ?',
    };

    return translations[key] || key;
  }

  /**
   * Generate Igbo response based on intent
   */
  generateResponse(intent: string, data?: Record<string, unknown>): string {
    const responses: Record<string, string> = {
      'greeting': 'Nnọọ! Kedu ka m nwere ike inyere gị aka taa?',
      'product.found': `Anyị hụrụ ihe ị na-achọ. Ọ bụ ₦${data?.price || 0}.`,
      'product.notfound': 'Ndo, anyị ahụghị ihe ahụ. Ị chọrọ ịlele ndị ọzọ?',
      'order.confirmed': `E kwenyere ụtụ gị! Nọmba ụtụ gị bụ ${data?.orderId || 'N/A'}.`,
      'delivery.estimate': `Oge nbubata bụ ụbọchị ${data?.days || 3}.`,
      'payment.success': 'Ịkwụ ụgwọ gara nke ọma! Anyị na-ekele gị maka azụmahịa.',
      'escalate': 'Ndo, m ga ejikọ gị na onye ọrụ anyị.',
    };

    return responses[intent] || responses['greeting'];
  }

  /**
   * Extract entities from Igbo message
   */
  extractEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};
    
    const priceMatch = message.match(/(ego|₦|N)\s*(\d+)/i);
    if (priceMatch) {
      entities.price = priceMatch[2];
    }
    
    const qtyMatch = message.match(/(atọ|anọ|ise|isii|asaa|asatọ|itolu|iri|(\d+))/i);
    if (qtyMatch) {
      const igboNumbers: Record<string, string> = {
        'atọ': '3', 'anọ': '4', 'ise': '5',
        'isii': '6', 'asaa': '7', 'asatọ': '8',
        'itolu': '9', 'iri': '10',
      };
      entities.quantity = igboNumbers[qtyMatch[1].toLowerCase()] || qtyMatch[1];
    }
    
    const colorMatch = message.match(/(ọcha|oji|uhie|ndụ akwụkwọ ndụ|uhie ocha|bluu|edo)/i);
    if (colorMatch) {
      entities.color = colorMatch[1];
    }
    
    return entities;
  }
}

export default new IgboHandler();
