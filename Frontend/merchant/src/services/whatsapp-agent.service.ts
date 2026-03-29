import { api } from '@/lib/api-client';

export const WhatsAppAgentService = {
    // --- Agent Logic Settings ---
    getSettings: async (storeId: string) => {
        const response = await api.get(`/whatsapp/${storeId}/agent/settings`);
        return response.data || {};
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSettings: async (storeId: string, data: any) => {
        const response = await api.put(`/whatsapp/${storeId}/agent/settings`, data);
        return response.data || {};
    },

    // --- Connection (Channel) ---
    getChannel: async (storeId: string) => {
        const response = await api.get(`/whatsapp/${storeId}/channel`);
        return response.data || null;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateChannel: async (storeId: string, data: any) => {
        const response = await api.put(`/whatsapp/${storeId}/channel`, data);
        return response.data || {};
    },

    // --- Templates ---
    listTemplates: async (storeId: string) => {
        const response = await api.get(`/whatsapp/${storeId}/templates`);
        return response.data || [];
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createTemplate: async (storeId: string, data: any) => {
        const response = await api.post(`/whatsapp/${storeId}/templates`, {
            storeId,
            ...data,
        });
        return response.data || {};
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTemplate: async (storeId: string, templateId: any) => {
        const response = await api.get(`/whatsapp/templates/${templateId}`, { storeId });
        return response.data || null;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteTemplate: async (storeId: string, templateId: any) => {
        const response = await api.delete(`/whatsapp/templates/${templateId}`, {
            params: { storeId },
        });
        return response.data || {};
    }
};
