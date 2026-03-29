import { api } from '@/lib/api-client';

interface IncidentReport {
    errorMessage: string;
    fingerprint?: string;
    route?: string;
    storeId?: string;
    userId?: string;
    stackHash?: string;
}

export class MerchantRescueService {
    static async reportIncident(data: IncidentReport): Promise<any> {
        const response = await api.post('/rescue/incidents', data);
        // Trigger analysis in background (non-blocking)
        this.analyzeAndSuggest(response.data.id).catch(err => console.error('[RescueService] AI background fail', err));
        return response.data;
    }
    
    static async getIncidentStatus(id: string): Promise<any> {
        const response = await api.get(`/rescue/incidents/${id}`);
        return response.data;
    }
    
    static async analyzeAndSuggest(incidentId: string): Promise<void> {
        try {
            const response = await api.post(`/rescue/incidents/${incidentId}/analyze`);
            return response.data;
        } catch (error) {
            console.error('[RescueService] Analysis failed', error);
        }
    }
    
    static async listIncidents(storeId: string, limit = 50): Promise<any[]> {
        const response = await api.get('/rescue/incidents/list', {
            params: { limit },
        });
        return response.data || [];
    }
    
    static async getStats(storeId: string, days = 7): Promise<{
        total: number;
        byStatus: Record<string, number>;
        bySeverity: Record<string, number>;
        topErrors: Array<{ errorMessage: string; count: number }>;
    }> {
        const response = await api.get('/rescue/stats', {
            params: { days },
        });
        return response.data || {};
    }
}
