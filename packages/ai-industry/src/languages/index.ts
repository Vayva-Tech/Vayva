/**
 * Language Support Module
 * Multi-language support for Vayva AI including Nigerian languages
 */

import type { LanguageCode, LanguageConfig } from '../types';

export const languageConfigs: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting: 'Hello! How can I help you today?',
    fallback: 'en',
    rtl: false,
  },
  yo: {
    code: 'yo',
    name: 'Yoruba',
    nativeName: 'Yorùbá',
    greeting: 'Ẹ kú àárọ̀! Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́?',
    fallback: 'en',
    rtl: false,
  },
  ha: {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Hausa',
    greeting: 'Sannu! Yaya zan iya taimaka maka?',
    fallback: 'en',
    rtl: false,
  },
  ig: {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Igbo',
    greeting: 'Nnọọ! Kedu ka m nwere ike inyere gị aka?',
    fallback: 'en',
    rtl: false,
  },
  pcm: {
    code: 'pcm',
    name: 'Nigerian Pidgin',
    nativeName: 'Naija Pidgin',
    greeting: 'How far! How I fit help you?',
    fallback: 'en',
    rtl: false,
  },
};

export class LanguageService {
  private detectedLanguages: Map<string, LanguageCode> = new Map();

  /**
   * Detect language from message content
   */
  detectLanguage(message: string): LanguageCode {
    // Simple keyword-based detection
    const lowerMessage = message.toLowerCase();
    
    // Yoruba detection
    if (/[ẹéèṣśàáìíòóùúọǫ]|ba wo ni|e ku|e se|o da bo/.test(lowerMessage)) {
      return 'yo';
    }
    
    // Hausa detection
    if (/[āīūēō]|sannu|na gode|yaya|lafiya/.test(lowerMessage)) {
      return 'ha';
    }
    
    // Igbo detection
    if (/[ịụḅḍṅṇ]|nnọọ|kedu|imela|daalụ/.test(lowerMessage)) {
      return 'ig';
    }
    
    // Pidgin detection
    if (/\b(dey|fit|wahala|how far|wetin|na|abi|o)\b/.test(lowerMessage)) {
      return 'pcm';
    }
    
    return 'en';
  }

  /**
   * Get language configuration
   */
  getConfig(code: LanguageCode): LanguageConfig {
    return languageConfigs[code];
  }

  /**
   * Get greeting for language
   */
  getGreeting(code: LanguageCode): string {
    return languageConfigs[code].greeting;
  }

  /**
   * Translate common phrases
   */
  translate(key: string, lang: LanguageCode): string {
    const translations: Record<string, Record<LanguageCode, string>> = {
      'order.confirmation': {
        en: 'Your order has been confirmed!',
        yo: 'A ti jẹriṣẹ aṣẹ rẹ!',
        ha: 'An tabbatar da odar ku!',
        ig: 'E kwenyere ụtụ gị!',
        pcm: 'Your order don confirm!',
      },
      'order.tracking': {
        en: 'You can track your order with this number:',
        yo: 'O le tẹle aṣẹ rẹ pẹlu nọmba yii:',
        ha: 'Zaku iya binde odar ku da wannan lambar:',
        ig: 'Ị nwere ike ịchọpụta ụtụ gị site na nọmba a:',
        pcm: 'You fit track your order with this number:',
      },
      'product.notfound': {
        en: 'Sorry, we could not find that product.',
        yo: 'Ma binu, a ko ri ọja naa.',
        ha: 'Yi hakuri, ba mu samun wannan kayan ba.',
        ig: 'Ndo, anyị ahụghị ihe ahụ.',
        pcm: 'Sorry, we no see that product.',
      },
      'help.available': {
        en: 'I can help you with:',
        yo: 'Mo le ràn ọ́ lọ́wọ́ pẹ̀lú:',
        ha: 'Zan iya taimaka maka:',
        ig: 'M nwere ike inyere gị aka na:',
        pcm: 'I fit help you with:',
      },
      'escalate.human': {
        en: 'I will connect you with a human agent.',
        yo: 'Emi yoo so ọ́ pọ̀ pẹ̀lú aṣáájú ènìyàn.',
        ha: 'Zan haɗa ku da wakili ɗan adam.',
        ig: 'M ga ejikọ gị na onye ọrụ mmadụ.',
        pcm: 'I go connect you with human agent.',
      },
    };

    return translations[key]?.[lang] || translations[key]?.['en'] || key;
  }

  /**
   * Get industry-specific terminology
   */
  getIndustryTerm(term: string, industry: string, lang: LanguageCode): string {
    const industryTerms: Record<string, Record<string, Record<LanguageCode, string>>> = {
      fashion: {
        'size': {
          en: 'size',
          yo: 'ìwọ̀n',
          ha: 'girma',
          ig: 'nha',
          pcm: 'size',
        },
        'color': {
          en: 'color',
          yo: 'àwọ̀',
          ha: 'launi',
          ig: 'agba',
          pcm: 'color',
        },
        'collection': {
          en: 'collection',
          yo: 'àkójọ',
          ha: 'tarin',
          ig: 'ịnakọta',
          pcm: 'collection',
        },
      },
      restaurant: {
        'menu': {
          en: 'menu',
          yo: 'àtẹjáde',
          ha: 'menu',
          ig: 'menu',
          pcm: 'menu',
        },
        'order': {
          en: 'order',
          yo: 'aṣẹ',
          ha: 'odar',
          ig: 'iwu',
          pcm: 'order',
        },
        'delivery': {
          en: 'delivery',
          yo: 'ìfiránsẹ́',
          ha: 'iskiya',
          ig: 'nbubata',
          pcm: 'delivery',
        },
      },
    };

    return industryTerms[industry]?.[term]?.[lang] 
      || industryTerms[industry]?.[term]?.['en'] 
      || term;
  }
}

export const languageService = new LanguageService();
export { default as yorubaHandler } from './yoruba';
export { default as hausaHandler } from './hausa';
export { default as igboHandler } from './igbo';
export { default as pidginHandler } from './pidgin';
