import { api } from './api-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logActivity({ storeId, actorUserId, action, targetType, targetId, before, after, reason }: { storeId: string; actorUserId: any; action: string; targetType: string; targetId: string; before?: any; after?: any; reason?: any }) {
    try {
        // Calculate minimal diff if both states provided
        let diffBefore: any = null;
        let diffAfter: any = null;
        
        if (before && after) {
            diffBefore = {};
            diffAfter = {};
            const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
            
            allKeys.forEach((key: string) => {
                const valBefore = before[key];
                const valAfter = after[key];
                
                if (valBefore !== valAfter) {
                    diffBefore[key] = valBefore;
                    diffAfter[key] = valAfter;
                }
            });
            
            // If no changes, don't log
            if (Object.keys(diffBefore).length === 0) {
                return;
            }
        } else {
            // One-sided log (Creation or Deletion)
            diffBefore = before;
            diffAfter = after;
        }
        
        // Call backend API to log activity
        await api.post('/audit/log', {
            storeId,
            actorUserId,
            action,
            targetType,
            targetId,
            reason,
            before: diffBefore || undefined,
            after: diffAfter || undefined,
        });
    } catch (error) {
        // Fail silently - logs shouldn't break app flow
        console.error('[ACTIVITY] Failed to log activity', error);
    }
}
