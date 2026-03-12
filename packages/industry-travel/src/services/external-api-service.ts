import { 
  TravelProperty, 
  TravelBooking,
  DateRange
} from '../types';

export interface ExternalAPIConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  authType: 'apiKey' | 'oauth' | 'bearer' | 'basic';
  enabled: boolean;
  rateLimit?: number; // requests per minute
}

export interface WeatherData {
  date: Date;
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  conditions: string;
  precipitation: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number; // 0-1
}

export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  components: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface MapStaticOptions {
  center: { lat: number; lng: number };
  zoom: number;
  size: { width: number; height: number };
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  style?: string;
}

export class ExternalAPIService {
  private configs: Map<string, ExternalAPIConfig> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default API configurations
   */
  private initializeDefaultConfigs(): void {
    const configs: ExternalAPIConfig[] = [
      {
        name: 'openweathermap',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
        authType: 'apiKey',
        enabled: !!process.env.OPENWEATHERMAP_API_KEY,
        rateLimit: 60
      },
      {
        name: 'exchangerate-api',
        baseUrl: 'https://v6.exchangerate-api.com/v6',
        apiKey: process.env.EXCHANGERATE_API_KEY || '',
        authType: 'apiKey',
        enabled: !!process.env.EXCHANGERATE_API_KEY,
        rateLimit: 1500
      },
      {
        name: 'google-translate',
        baseUrl: 'https://translation.googleapis.com/language/translate/v2',
        apiKey: process.env.GOOGLE_TRANSLATE_API_KEY || '',
        authType: 'apiKey',
        enabled: !!process.env.GOOGLE_TRANSLATE_API_KEY,
        rateLimit: 1000
      },
      {
        name: 'google-geocoding',
        baseUrl: 'https://maps.googleapis.com/maps/api/geocode',
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        authType: 'apiKey',
        enabled: !!process.env.GOOGLE_MAPS_API_KEY,
        rateLimit: 50
      },
      {
        name: 'google-static-maps',
        baseUrl: 'https://maps.googleapis.com/maps/api/staticmap',
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
        authType: 'apiKey',
        enabled: !!process.env.GOOGLE_MAPS_API_KEY,
        rateLimit: 500
      }
    ];

    configs.forEach(config => {
      if (config.enabled) {
        this.configs.set(config.name, config);
      }
    });
  }

  /**
   * Get weather forecast for a location
   */
  async getWeatherForecast(
    latitude: number, 
    longitude: number, 
    days: number = 7
  ): Promise<WeatherData[]> {
    const config = this.configs.get('openweathermap');
    if (!config || !config.enabled) {
      throw new Error('OpenWeatherMap API not configured');
    }

    await this.checkRateLimit('openweathermap');

    try {
      const response = await this.makeRequest(`${config.baseUrl}/onecall`, {
        lat: latitude,
        lon: longitude,
        exclude: 'current,minutely,hourly,alerts',
        units: 'metric',
        appid: config.apiKey
      });

      const forecast = response.daily.slice(0, days).map((day: any) => ({
        date: new Date(day.dt * 1000),
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
          unit: 'C' as const
        },
        conditions: this.mapWeatherCondition(day.weather[0].main),
        precipitation: day.rain?.['1h'] || 0,
        humidity: day.humidity,
        windSpeed: Math.round(day.wind_speed * 3.6) // Convert m/s to km/h
      }));

      return forecast;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.generateMockWeather(days);
    }
  }

  /**
   * Get currency exchange rates
   */
  async getExchangeRate(from: string, to: string): Promise<CurrencyRate> {
    const config = this.configs.get('exchangerate-api');
    if (!config || !config.enabled) {
      throw new Error('ExchangeRate-API not configured');
    }

    await this.checkRateLimit('exchangerate-api');

    try {
      const response = await this.makeRequest(`${config.baseUrl}/${config.apiKey}/pair/${from}/${to}`);
      
      return {
        from,
        to,
        rate: response.conversion_rate,
        timestamp: new Date(response.time_last_update_unix * 1000)
      };
    } catch (error) {
      console.error('Exchange rate API error:', error);
      return this.generateMockExchangeRate(from, to);
    }
  }

  /**
   * Translate text to target language
   */
  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    const config = this.configs.get('google-translate');
    if (!config || !config.enabled) {
      throw new Error('Google Translate API not configured');
    }

    await this.checkRateLimit('google-translate');

    try {
      const response = await this.makeRequest(config.baseUrl, {
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        key: config.apiKey
      }, 'POST');

      const translation = response.data.translations[0];

      return {
        originalText: text,
        translatedText: translation.translatedText,
        sourceLanguage: translation.detectedSourceLanguage || sourceLanguage || 'auto',
        targetLanguage,
        confidence: translation.model ? 0.9 : 0.8
      };
    } catch (error) {
      console.error('Translation API error:', error);
      return this.generateMockTranslation(text, targetLanguage);
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    const config = this.configs.get('google-geocoding');
    if (!config || !config.enabled) {
      throw new Error('Google Geocoding API not configured');
    }

    await this.checkRateLimit('google-geocoding');

    try {
      const response = await this.makeRequest(`${config.baseUrl}/json`, {
        address,
        key: config.apiKey
      });

      if (response.status !== 'OK' || response.results.length === 0) {
        throw new Error('Geocoding failed');
      }

      const result = response.results[0];
      const components = this.parseAddressComponents(result.address_components);

      return {
        address: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id,
        components
      };
    } catch (error) {
      console.error('Geocoding API error:', error);
      return this.generateMockGeocoding(address);
    }
  }

  /**
   * Generate static map image
   */
  async generateStaticMap(options: MapStaticOptions): Promise<string> {
    const config = this.configs.get('google-static-maps');
    if (!config || !config.enabled) {
      throw new Error('Google Static Maps API not configured');
    }

    await this.checkRateLimit('google-static-maps');

    const params = new URLSearchParams({
      center: `${options.center.lat},${options.center.lng}`,
      zoom: options.zoom.toString(),
      size: `${options.size.width}x${options.size.height}`,
      key: config.apiKey
    });

    if (options.markers) {
      options.markers.forEach(marker => {
        params.append('markers', `${marker.lat},${marker.lng}${marker.label ? `|label:${marker.label}` : ''}`);
      });
    }

    if (options.style) {
      params.append('style', options.style);
    }

    return `${config.baseUrl}?${params.toString()}`;
  }

  /**
   * Get nearby points of interest
   */
  async getNearbyPOIs(
    latitude: number, 
    longitude: number, 
    radius: number = 1000,
    types: string[] = ['restaurant', 'tourist_attraction']
  ): Promise<any[]> {
    // This would integrate with Google Places API or similar
    console.log(`Searching for POIs near ${latitude}, ${longitude}`);
    
    // Mock implementation
    return [
      {
        name: 'Sample Restaurant',
        type: 'restaurant',
        rating: 4.5,
        vicinity: '123 Main Street',
        distance: 500
      },
      {
        name: 'City Museum',
        type: 'tourist_attraction',
        rating: 4.2,
        vicinity: '456 Heritage Blvd',
        distance: 800
      }
    ];
  }

  /**
   * Send SMS using external provider
   */
  async sendSMS(phone: string, message: string): Promise<boolean> {
    // This would integrate with Twilio, AWS SNS, or similar
    console.log(`Sending SMS to ${phone}: ${message}`);
    return true; // Mock success
  }

  /**
   * Send email using external provider
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // This would integrate with SendGrid, AWS SES, or similar
    console.log(`Sending email to ${to} with subject: ${subject}`);
    return true; // Mock success
  }

  /**
   * Upload file to cloud storage
   */
  async uploadFile(file: Buffer, filename: string, folder?: string): Promise<string> {
    // This would integrate with AWS S3, Cloudinary, or similar
    console.log(`Uploading file: ${filename}`);
    return `https://cdn.example.com/${folder || 'uploads'}/${filename}`;
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsage(): Promise<Record<string, { count: number; limit: number; resetTime: Date }>> {
    const usage: Record<string, any> = {};
    
    for (const [name, config] of this.configs) {
      const rateLimit = this.rateLimits.get(name);
      usage[name] = {
        count: rateLimit?.count || 0,
        limit: config.rateLimit || 1000,
        resetTime: rateLimit?.resetTime ? new Date(rateLimit.resetTime) : new Date()
      };
    }
    
    return usage;
  }

  // Private helper methods
  private async makeRequest(
    url: string, 
    params: Record<string, any> = {}, 
    method: string = 'GET'
  ): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = method === 'GET' ? `${url}?${queryString}` : url;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const options: RequestInit = { method, headers };
    
    if (method === 'POST') {
      options.body = JSON.stringify(params);
    }

    const response = await fetch(fullUrl, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async checkRateLimit(apiName: string): Promise<void> {
    const config = this.configs.get(apiName);
    if (!config?.rateLimit) return;

    const now = Date.now();
    const rateLimit = this.rateLimits.get(apiName);

    if (rateLimit && rateLimit.count >= config.rateLimit) {
      if (now < rateLimit.resetTime) {
        const waitTime = rateLimit.resetTime - now;
        throw new Error(`Rate limit exceeded for ${apiName}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
      } else {
        // Reset counter
        this.rateLimits.set(apiName, { count: 0, resetTime: now + 60000 });
      }
    }

    // Increment counter
    const current = this.rateLimits.get(apiName) || { count: 0, resetTime: now + 60000 };
    this.rateLimits.set(apiName, { count: current.count + 1, resetTime: current.resetTime });
  }

  private mapWeatherCondition(condition: string): string {
    const mapping: Record<string, string> = {
      'Clear': 'Sunny',
      'Clouds': 'Cloudy',
      'Rain': 'Rainy',
      'Snow': 'Snowy',
      'Thunderstorm': 'Stormy',
      'Drizzle': 'Drizzly',
      'Mist': 'Misty',
      'Fog': 'Foggy'
    };
    return mapping[condition] || condition;
  }

  private parseAddressComponents(components: any[]): any {
    const result: any = {};
    
    components.forEach(component => {
      if (component.types.includes('street_address') || component.types.includes('route')) {
        result.street = component.long_name;
      } else if (component.types.includes('locality')) {
        result.city = component.long_name;
      } else if (component.types.includes('administrative_area_level_1')) {
        result.state = component.long_name;
      } else if (component.types.includes('country')) {
        result.country = component.long_name;
      } else if (component.types.includes('postal_code')) {
        result.postalCode = component.long_name;
      }
    });
    
    return result;
  }

  // Mock data generators for when APIs are unavailable
  private generateMockWeather(days: number): WeatherData[] {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: {
        min: Math.floor(Math.random() * 15) + 10,
        max: Math.floor(Math.random() * 20) + 20,
        unit: 'C'
      },
      conditions: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
      precipitation: Math.random() * 10,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5
    }));
  }

  private generateMockExchangeRate(from: string, to: string): CurrencyRate {
    return {
      from,
      to,
      rate: parseFloat((Math.random() * 2 + 0.5).toFixed(4)),
      timestamp: new Date()
    };
  }

  private generateMockTranslation(text: string, targetLanguage: string): TranslationResult {
    return {
      originalText: text,
      translatedText: `[Translated to ${targetLanguage}] ${text}`,
      sourceLanguage: 'auto',
      targetLanguage,
      confidence: 0.8
    };
  }

  private generateMockGeocoding(address: string): GeocodingResult {
    return {
      address,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      components: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      }
    };
  }
}