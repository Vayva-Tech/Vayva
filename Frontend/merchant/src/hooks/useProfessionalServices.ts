import { useState, useEffect } from "react";
import { apiJson } from "@/lib/api-client-shared";
import type { 
  ProfessionalDashboardResponse, 
  ApiResponse,
  ProfessionalAnalytics 
} from "@/types/professional";

interface UseProfessionalDashboardReturn {
  data: ProfessionalDashboardResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useProfessionalDashboard(): UseProfessionalDashboardReturn {
  const [data, setData] = useState<ProfessionalDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiJson<ApiResponse<ProfessionalDashboardResponse>>(
        "/professional/dashboard"
      );
      
      if (response?.data) {
        setData(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error("No data received from API");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
      console.error("[USE_PROFESSIONAL_DASHBOARD_ERROR]", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      void fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    lastUpdated,
  };
}

// Hook for specific professional analytics
interface UseProfessionalAnalyticsReturn {
  data: ProfessionalAnalytics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProfessionalAnalytics(timeframe: 'day' | 'week' | 'month' = 'month'): UseProfessionalAnalyticsReturn {
  const [data, setData] = useState<ProfessionalAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiJson<ApiResponse<ProfessionalAnalytics>>(
        `/api/professional/analytics?t=${timeframe}`
      );
      
      if (response?.data) {
        setData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
      console.error("[USE_PROFESSIONAL_ANALYTICS_ERROR]", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [timeframe]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

// Hook for matters data
interface UseMattersReturn {
  data: any[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createMatter: (matterData: any) => Promise<any>;
  updateMatter: (matterId: string, updates: any) => Promise<any>;
}

export function useMatters(filters?: { status?: string; practiceArea?: string }): UseMattersReturn {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.practiceArea) queryParams.append('practiceArea', filters.practiceArea);
      
      const response = await apiJson<ApiResponse<any[]>>(
        `/api/professional/matters?${queryParams.toString()}`
      );
      
      if (response?.data) {
        setData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch matters";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createMatter = async (matterData: any) => {
    try {
      const response = await apiJson<ApiResponse<any>>(
        "/professional/matters",
        {
          method: "POST",
          body: JSON.stringify(matterData),
        }
      );
      
      if (response?.data) {
        await fetchData(); // Refresh the list
        return response.data;
      }
      throw new Error("Failed to create matter");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create matter";
      setError(errorMessage);
      throw err;
    }
  };

  const updateMatter = async (matterId: string, updates: any) => {
    try {
      const response = await apiJson<ApiResponse<any>>(
        `/api/professional/matters/${matterId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        }
      );
      
      if (response?.data) {
        await fetchData(); // Refresh the list
        return response.data;
      }
      throw new Error("Failed to update matter");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update matter";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    void fetchData();
  }, [filters?.status, filters?.practiceArea]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    createMatter,
    updateMatter,
  };
}

// Hook for clients data
interface UseClientsReturn {
  data: any[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createClient: (clientData: any) => Promise<any>;
}

export function useClients(filters?: { type?: string; isActive?: boolean }): UseClientsReturn {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
      
      const response = await apiJson<ApiResponse<any[]>>(
        `/api/professional/clients?${queryParams.toString()}`
      );
      
      if (response?.data) {
        setData(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch clients";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: any) => {
    try {
      const response = await apiJson<ApiResponse<any>>(
        "/professional/clients",
        {
          method: "POST",
          body: JSON.stringify(clientData),
        }
      );
      
      if (response?.data) {
        await fetchData(); // Refresh the list
        return response.data;
      }
      throw new Error("Failed to create client");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create client";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    void fetchData();
  }, [filters?.type, filters?.isActive]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    createClient,
  };
}

// Hook for time entries and billing
interface UseBillingReturn {
  timeEntries: any[] | null;
  invoices: any[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logTime: (timeEntry: any) => Promise<any>;
  createInvoice: (invoiceData: any) => Promise<any>;
}

export function useBilling(filters?: { matterId?: string; status?: string }): UseBillingReturn {
  const [timeEntries, setTimeEntries] = useState<any[] | null>(null);
  const [invoices, setInvoices] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch time entries
      const timeParams = new URLSearchParams();
      if (filters?.matterId) timeParams.append('matterId', filters.matterId);
      
      const timeResponse = await apiJson<ApiResponse<any[]>>(
        `/api/professional/billing/time-entries?${timeParams.toString()}`
      );
      
      if (timeResponse?.data) {
        setTimeEntries(timeResponse.data);
      }
      
      // Fetch invoices
      const invoiceParams = new URLSearchParams();
      if (filters?.status) invoiceParams.append('status', filters.status);
      
      const invoiceResponse = await apiJson<ApiResponse<any[]>>(
        `/api/professional/billing/invoices?${invoiceParams.toString()}`
      );
      
      if (invoiceResponse?.data) {
        setInvoices(invoiceResponse.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch billing data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logTime = async (timeEntry: any) => {
    try {
      const response = await apiJson<ApiResponse<any>>(
        "/professional/billing/time-entries",
        {
          method: "POST",
          body: JSON.stringify(timeEntry),
        }
      );
      
      if (response?.data) {
        await fetchData();
        return response.data;
      }
      throw new Error("Failed to log time");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to log time";
      setError(errorMessage);
      throw err;
    }
  };

  const createInvoice = async (invoiceData: any) => {
    try {
      const response = await apiJson<ApiResponse<any>>(
        "/professional/billing/invoices",
        {
          method: "POST",
          body: JSON.stringify(invoiceData),
        }
      );
      
      if (response?.data) {
        await fetchData();
        return response.data;
      }
      throw new Error("Failed to create invoice");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create invoice";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    void fetchData();
  }, [filters?.matterId, filters?.status]);

  return {
    timeEntries,
    invoices,
    loading,
    error,
    refresh: fetchData,
    logTime,
    createInvoice,
  };
}