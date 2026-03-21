// Integration Hooks - Connect existing pages with new engine architecture
import { useState, useEffect } from 'react';
import { ProductEngine, type Product, type ProductFilters } from '@/lib/engines/product-engine';
import { OrderEngine, type Order, type OrderFilters } from '@/lib/engines/order-engine';
import { CustomerEngine, type Customer, type CustomerFilters } from '@/lib/engines/customer-engine';
import { WhatsAppAIEngine, type WhatsAppAgent, type WhatsAppConversation } from '@/lib/engines/whatsapp-engine';
import { MarketingEngine, type Campaign, type Promotion } from '@/lib/engines/marketing-engine';
import { ControlCenterEngine, type StoreSettings, type ThemeSettings } from '@/lib/engines/control-engine';

// Product Hooks
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ProductEngine.getAll(filters);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, refetch: () => {} };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ProductEngine.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch product'));
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [id]);

  return { product, loading, error };
}

// Order Hooks
export function useOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await OrderEngine.getAll(filters);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [JSON.stringify(filters)]);

  return { orders, loading, error, refetch: () => {} };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await OrderEngine.getById(id);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch order'));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [id]);

  return { order, loading, error };
}

// Customer Hooks
export function useCustomers(filters?: CustomerFilters) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await CustomerEngine.getAll(filters);
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomers();
  }, [JSON.stringify(filters)]);

  return { customers, loading, error, refetch: () => {} };
}

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await CustomerEngine.getById(id);
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch customer'));
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomer();
  }, [id]);

  return { customer, loading, error };
}

// WhatsApp AI Hooks
export function useWhatsAppAgent() {
  const [agent, setAgent] = useState<WhatsAppAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await WhatsAppAIEngine.getAgent();
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch WhatsApp agent'));
      } finally {
        setLoading(false);
      }
    };

    void fetchAgent();
  }, []);

  return { agent, loading, error, refetch: () => {} };
}

export function useWhatsAppConversations(filters?: any) {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await WhatsAppAIEngine.getAllConversations(filters);
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
      } finally {
        setLoading(false);
      }
    };

    void fetchConversations();
  }, [JSON.stringify(filters)]);

  return { conversations, loading, error, refetch: () => {} };
}

// Marketing Hooks
export function useCampaigns(filters?: any) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await MarketingEngine.getAllCampaigns(filters);
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch campaigns'));
      } finally {
        setLoading(false);
      }
    };

    void fetchCampaigns();
  }, [JSON.stringify(filters)]);

  return { campaigns, loading, error, refetch: () => {} };
}

export function usePromotions(filters?: any) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await MarketingEngine.getAllPromotions(filters);
        setPromotions(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch promotions'));
      } finally {
        setLoading(false);
      }
    };

    void fetchPromotions();
  }, [JSON.stringify(filters)]);

  return { promotions, loading, error, refetch: () => {} };
}

// Control Center Hooks
export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ControlCenterEngine.getStoreSettings();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch store settings'));
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  return { settings, loading, error, refetch: () => {} };
}

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ControlCenterEngine.getThemeSettings();
        setTheme(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch theme settings'));
      } finally {
        setLoading(false);
      }
    };

    void fetchTheme();
  }, []);

  return { theme, loading, error, refetch: () => {} };
}