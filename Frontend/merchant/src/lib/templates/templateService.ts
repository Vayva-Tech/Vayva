import { api } from '@/lib/api-client';

export class TemplateService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async applyTemplate(storeId: string, templateId: any, userId: string) {
        const response = await api.post(`/templates/${templateId}/apply`, {
            storeId,
            userId,
        });
        return response.data || { success: true };
    }

    static async rollback(storeId: string, userId: string) {
        const response = await api.post(`/templates/rollback`, {
            storeId,
            userId,
        });
        return response.data || { success: true };
    }
}
