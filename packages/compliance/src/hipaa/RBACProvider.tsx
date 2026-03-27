/**
 * HIPAA Role-Based Access Control (RBAC) Provider
 * Enforces least-privilege access to PHI and healthcare resources
 */

'use client';

import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { logger } from '@vayva/shared';

export enum HealthcareRole {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  PRACTICE_MANAGER = 'PRACTICE_MANAGER',
  BILLING_STAFF = 'BILLING_STAFF',
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
}

export enum ResourceType {
  PATIENT_RECORD = 'PATIENT_RECORD',
  APPOINTMENT = 'APPOINTMENT',
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_RESULT = 'LAB_RESULT',
  BILLING = 'BILLING',
  CONSENT = 'CONSENT',
  SCHEDULE = 'SCHEDULE',
  INVENTORY = 'INVENTORY',
}

export enum Action {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  DENY = 'DENY',
}

export interface Permission {
  resource: ResourceType;
  actions: Action[];
  conditions?: Record<string, any>; // Additional constraints
}

export interface UserContext {
  id: string;
  role: HealthcareRole;
  department?: string;
  permissions?: Permission[];
  assignedPatients?: string[]; // For care team assignments
}

// Define role-based permissions following least-privilege principle
export const ROLE_PERMISSIONS: Record<HealthcareRole, Permission[]> = {
  [HealthcareRole.DOCTOR]: [
    {
      resource: ResourceType.PATIENT_RECORD,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
      conditions: { fullAccess: true },
    },
    {
      resource: ResourceType.PRESCRIPTION,
      actions: [Action.CREATE, Action.UPDATE, Action.DELETE, Action.APPROVE],
    },
    {
      resource: ResourceType.LAB_RESULT,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.APPOINTMENT,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.BILLING,
      actions: [Action.VIEW],
    },
    {
      resource: ResourceType.CONSENT,
      actions: [Action.VIEW, Action.CREATE],
    },
  ],
  
  [HealthcareRole.NURSE]: [
    {
      resource: ResourceType.PATIENT_RECORD,
      actions: [Action.VIEW],
      conditions: { departmentMatch: true },
    },
    {
      resource: ResourceType.APPOINTMENT,
      actions: [Action.VIEW, Action.CREATE],
    },
    {
      resource: ResourceType.LAB_RESULT,
      actions: [Action.VIEW],
    },
    {
      resource: ResourceType.PRESCRIPTION,
      actions: [Action.VIEW],
    },
    {
      resource: ResourceType.CONSENT,
      actions: [Action.VIEW],
    },
  ],
  
  [HealthcareRole.PRACTICE_MANAGER]: [
    {
      resource: ResourceType.PATIENT_RECORD,
      actions: [Action.VIEW],
    },
    {
      resource: ResourceType.APPOINTMENT,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE],
    },
    {
      resource: ResourceType.SCHEDULE,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.BILLING,
      actions: [Action.VIEW, Action.APPROVE, Action.DENY],
    },
    {
      resource: ResourceType.INVENTORY,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
  ],
  
  [HealthcareRole.BILLING_STAFF]: [
    {
      resource: ResourceType.BILLING,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.PATIENT_RECORD,
      actions: [Action.VIEW],
      conditions: { demographicsOnly: true }, // Limited to name, contact info
    },
    {
      resource: ResourceType.CONSENT,
      actions: [Action.VIEW],
      conditions: { billingConsentOnly: true },
    },
  ],
  
  [HealthcareRole.ADMIN]: [
    {
      resource: ResourceType.PATIENT_RECORD,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE],
    },
    {
      resource: ResourceType.APPOINTMENT,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE],
    },
    {
      resource: ResourceType.PRESCRIPTION,
      actions: [Action.VIEW],
    },
    {
      resource: ResourceType.LAB_RESULT,
      actions: [Action.VIEW],
    },
    {
      resource: ResourceType.BILLING,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE],
    },
    {
      resource: ResourceType.CONSENT,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.SCHEDULE,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.INVENTORY,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE, Action.DELETE],
    },
  ],
  
  [HealthcareRole.RECEPTIONIST]: [
    {
      resource: ResourceType.APPOINTMENT,
      actions: [Action.VIEW, Action.CREATE, Action.UPDATE],
    },
    {
      resource: ResourceType.PATIENT_RECORD,
      actions: [Action.VIEW],
      conditions: { demographicsOnly: true },
    },
    {
      resource: ResourceType.SCHEDULE,
      actions: [Action.VIEW, Action.CREATE],
    },
  ],
};

interface RBACContextType {
  user: UserContext | null;
  hasPermission: (resource: ResourceType, action: Action, resourceId?: string) => boolean;
  canAccessPatient: (patientId: string) => boolean;
  canViewPHI: (resourceType: ResourceType) => boolean;
  checkConditions: (conditions: Record<string, any>, context?: any) => boolean;
  setUser: (user: UserContext | null) => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

interface RBACProviderProps {
  children: React.ReactNode;
  initialUser?: UserContext | null;
}

export function RBACProvider({ children, initialUser = null }: RBACProviderProps) {
  const [user, setUser] = useState<UserContext | null>(initialUser);

  /**
   * Check if user has permission for a specific resource and action
   */
  const hasPermission = useCallback((
    resource: ResourceType,
    action: Action,
    resourceId?: string
  ): boolean => {
    if (!user) {
      logger.warn('[RBAC] No user context available');
      return false;
    }

    // Admin has all permissions
    if (user.role === HealthcareRole.ADMIN) {
      return true;
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Find matching permission
    const matchingPermission = permissions.find(perm => {
      if (perm.resource !== resource) {
        return false;
      }
      
      if (!perm.actions.includes(action)) {
        return false;
      }
      
      // Check conditions if present
      if (perm.conditions) {
        return checkConditionsInternal(perm.conditions, user, resourceId);
      }
      
      return true;
    });

    const hasAccess = !!matchingPermission;
    
    if (!hasAccess) {
      logger.info('[RBAC] Access denied', {
        userId: user.id,
        role: user.role,
        resource,
        action,
        resourceId,
      });
    }

    return hasAccess;
  }, [user]);

  /**
   * Special check for patient record access (considers care team assignments)
   */
  const canAccessPatient = useCallback((patientId: string): boolean => {
    if (!user) return false;
    
    // Doctors and admins can access all patients
    if (user.role === HealthcareRole.DOCTOR || user.role === HealthcareRole.ADMIN) {
      return true;
    }
    
    // Check if patient is assigned to user's care team
    if (user.assignedPatients?.includes(patientId)) {
      return true;
    }
    
    // Nurses can access patients in their department
    if (user.role === HealthcareRole.NURSE && user.department) {
      // In production, would check patient's department assignment
      return true;
    }
    
    return false;
  }, [user]);

  /**
   * Check if user can view PHI of specific type
   */
  const canViewPHI = useCallback((resourceType: ResourceType): boolean => {
    return hasPermission(resourceType, Action.VIEW);
  }, [hasPermission]);

  /**
   * Evaluate permission conditions
   */
  const checkConditions = useCallback((
    conditions: Record<string, any>,
    context?: any
  ): boolean => {
    return checkConditionsInternal(conditions, user, undefined, context);
  }, [user]);

  const value = useMemo(() => ({
    user,
    hasPermission,
    canAccessPatient,
    canViewPHI,
    checkConditions,
    setUser,
  }), [user, hasPermission, canAccessPatient, canViewPHI, checkConditions]);

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}

/**
 * Internal condition checker
 */
function checkConditionsInternal(
  conditions: Record<string, any>,
  user: UserContext | null,
  resourceId?: string,
  context?: any
): boolean {
  if (!user) return false;

  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'fullAccess':
        if (!value) return false;
        break;
        
      case 'departmentMatch':
        // In production, would check if user's department matches resource
        if (!user.department) return false;
        break;
        
      case 'demographicsOnly':
        // Allow only basic demographic info (name, contact)
        // This would be enforced at the data access layer
        break;
        
      case 'billingConsentOnly':
        // Only allow viewing billing-related consents
        break;
        
      case 'careTeamMember':
        // Check if user is on the care team for this resource
        if (!user.assignedPatients?.includes(resourceId || '')) {
          return false;
        }
        break;
        
      default:
        logger.warn('[RBAC] Unknown condition', { key, value });
    }
  }

  return true;
}

/**
 * Hook to use RBAC context
 */
export function useHealthcareAccess(): RBACContextType {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useHealthcareAccess must be used within RBACProvider');
  }
  return context;
}

/**
 * Higher-order component for protecting components with RBAC
 */
export function withRBAC<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredResource: ResourceType,
  requiredAction: Action,
  fallbackComponent?: React.ComponentType<{ missingPermissions: string }>
) {
  return function RBACProtected(props: P) {
    const { hasPermission } = useHealthcareAccess();
    
    if (!hasPermission(requiredResource, requiredAction)) {
      if (fallbackComponent) {
        const Fallback = fallbackComponent;
        return <Fallback missingPermissions={`${requiredAction} ${requiredResource}`} />;
      }
      
      return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-sm">
            You don't have permission to {requiredAction.toLowerCase()} this {requiredResource.toLowerCase().replace('_', ' ')}.
          </p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

/**
 * Component-level permission check hook
 */
export function usePermission(resource: ResourceType, action: Action) {
  const { hasPermission } = useHealthcareAccess();
  
  return useMemo(() => ({
    allowed: hasPermission(resource, action),
    resource,
    action,
  }), [resource, action, hasPermission]);
}
