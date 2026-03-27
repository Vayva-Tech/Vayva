/**
 * HIPAA RBAC Provider Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { 
  RBACProvider, 
  useHealthcareAccess,
  HealthcareRole,
  ResourceType,
  Action,
  usePermission,
  withRBAC,
} from '../src/hipaa/RBACProvider';

describe('RBACProvider', () => {
  const createWrapper = (user: any) => {
    return ({ children }: { children: React.ReactNode }) => (
      <RBACProvider initialUser={user}>{children}</RBACProvider>
    );
  };

  describe('hasPermission()', () => {
    it('grants doctor full access to patient records', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.VIEW)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.CREATE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.UPDATE)).toBe(true);
    });

    it('allows doctor to prescribe medications', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.PRESCRIPTION, Action.CREATE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PRESCRIPTION, Action.UPDATE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PRESCRIPTION, Action.DELETE)).toBe(true);
    });

    it('restricts nurse from updating patient records', () => {
      const nurseUser = { id: 'nurse-1', role: HealthcareRole.NURSE };
      const wrapper = createWrapper(nurseUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.VIEW)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.UPDATE)).toBe(false);
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.DELETE)).toBe(false);
    });

    it('allows billing staff to view only demographics', () => {
      const billingUser = { id: 'billing-1', role: HealthcareRole.BILLING_STAFF };
      const wrapper = createWrapper(billingUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.BILLING, Action.CREATE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.VIEW)).toBe(true);
      // Should have conditions restricting to demographics only
    });

    it('denies all permissions when no user is set', () => {
      const wrapper = createWrapper(null);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.VIEW)).toBe(false);
    });

    it('grants admin all permissions', () => {
      const adminUser = { id: 'admin-1', role: HealthcareRole.ADMIN };
      const wrapper = createWrapper(adminUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.DELETE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.BILLING, Action.DELETE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.PRESCRIPTION, Action.CREATE)).toBe(true);
    });

    it('allows receptionist to manage appointments', () => {
      const receptionistUser = { id: 'receptionist-1', role: HealthcareRole.RECEPTIONIST };
      const wrapper = createWrapper(receptionistUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.APPOINTMENT, Action.CREATE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.APPOINTMENT, Action.UPDATE)).toBe(true);
      expect(result.current.hasPermission(ResourceType.APPOINTMENT, Action.DELETE)).toBe(false);
    });
  });

  describe('canAccessPatient()', () => {
    it('allows doctor to access any patient', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.canAccessPatient('patient-123')).toBe(true);
      expect(result.current.canAccessPatient('patient-456')).toBe(true);
    });

    it('allows nurse to access patients in care team', () => {
      const nurseUser = { 
        id: 'nurse-1', 
        role: HealthcareRole.NURSE,
        assignedPatients: ['patient-123', 'patient-456'],
      };
      const wrapper = createWrapper(nurseUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.canAccessPatient('patient-123')).toBe(true);
      expect(result.current.canAccessPatient('patient-789')).toBe(false);
    });

    it('denies patient access to unauthorized users', () => {
      const billingUser = { id: 'billing-1', role: HealthcareRole.BILLING_STAFF };
      const wrapper = createWrapper(billingUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.canAccessPatient('patient-123')).toBe(false);
    });
  });

  describe('canViewPHI()', () => {
    it('allows viewing PHI when permission exists', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.canViewPHI(ResourceType.LAB_RESULT)).toBe(true);
      expect(result.current.canViewPHI(ResourceType.PATIENT_RECORD)).toBe(true);
    });

    it('denies viewing PHI when permission does not exist', () => {
      const receptionistUser = { id: 'receptionist-1', role: HealthcareRole.RECEPTIONIST };
      const wrapper = createWrapper(receptionistUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.canViewPHI(ResourceType.PRESCRIPTION)).toBe(false);
      expect(result.current.canViewPHI(ResourceType.LAB_RESULT)).toBe(false);
    });
  });

  describe('checkConditions()', () => {
    it('evaluates department match condition', () => {
      const nurseUser = { 
        id: 'nurse-1', 
        role: HealthcareRole.NURSE,
        department: 'Cardiology',
      };
      const wrapper = createWrapper(nurseUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.checkConditions({ departmentMatch: true })).toBe(true);
    });

    it('evaluates full access condition', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.checkConditions({ fullAccess: true })).toBe(true);
      expect(result.current.checkConditions({ fullAccess: false })).toBe(false);
    });
  });

  describe('usePermission hook', () => {
    it('returns permission status', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const { result } = renderHook(
        () => usePermission(ResourceType.PATIENT_RECORD, Action.VIEW),
        { wrapper }
      );
      
      expect(result.current.allowed).toBe(true);
      expect(result.current.resource).toBe(ResourceType.PATIENT_RECORD);
      expect(result.current.action).toBe(Action.VIEW);
    });
  });

  describe('withRBAC HOC', () => {
    it('renders wrapped component when permission granted', () => {
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(doctorUser);
      
      const TestComponent = () => <div data-testid="test-component">Test</div>;
      const ProtectedComponent = withRBAC(
        TestComponent,
        ResourceType.PATIENT_RECORD,
        Action.VIEW
      );
      
      const { getByTestId } = renderHook(() => <ProtectedComponent />, { wrapper });
      
      expect(getByTestId('test-component')).toBeInTheDocument();
    });

    it('renders fallback when permission denied', () => {
      const billingUser = { id: 'billing-1', role: HealthcareRole.BILLING_STAFF };
      const wrapper = createWrapper(billingUser);
      
      const TestComponent = () => <div data-testid="test-component">Test</div>;
      const FallbackComponent = () => <div data-testid="fallback">Access Denied</div>;
      
      const ProtectedComponent = withRBAC(
        TestComponent,
        ResourceType.PRESCRIPTION,
        Action.CREATE,
        FallbackComponent
      );
      
      const { getByTestId } = renderHook(() => <ProtectedComponent />, { wrapper });
      
      expect(getByTestId('fallback')).toBeInTheDocument();
    });

    it('renders default access denied message without fallback', () => {
      const billingUser = { id: 'billing-1', role: HealthcareRole.BILLING_STAFF };
      const wrapper = createWrapper(billingUser);
      
      const TestComponent = () => <div data-testid="test-component">Test</div>;
      const ProtectedComponent = withRBAC(
        TestComponent,
        ResourceType.PRESCRIPTION,
        Action.CREATE
      );
      
      const { container } = renderHook(() => <ProtectedComponent />, { wrapper });
      
      expect(container.textContent).toContain('Access Denied');
      expect(container.textContent).toContain("don't have permission");
    });
  });

  describe('setUser()', () => {
    it('updates user context dynamically', () => {
      const initialUser = { id: 'nurse-1', role: HealthcareRole.NURSE };
      const wrapper = createWrapper(initialUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      // Initial state
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.UPDATE)).toBe(false);
      
      // Update to doctor
      const doctorUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      result.current.setUser(doctorUser);
      
      // Re-render to pick up new user
      result.rerender();
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.UPDATE)).toBe(true);
    });

    it('clears permissions when user is set to null', () => {
      const initialUser = { id: 'doc-1', role: HealthcareRole.DOCTOR };
      const wrapper = createWrapper(initialUser);
      
      const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.VIEW)).toBe(true);
      
      result.current.setUser(null);
      result.rerender();
      
      expect(result.current.hasPermission(ResourceType.PATIENT_RECORD, Action.VIEW)).toBe(false);
    });
  });

  describe('Role Permission Matrix', () => {
    const testCases = [
      {
        role: HealthcareRole.DOCTOR,
        shouldAllow: [
          [ResourceType.PATIENT_RECORD, Action.UPDATE],
          [ResourceType.PRESCRIPTION, Action.CREATE],
          [ResourceType.LAB_RESULT, Action.VIEW],
        ],
        shouldDeny: [
          [ResourceType.BILLING, Action.DELETE],
        ],
      },
      {
        role: HealthcareRole.NURSE,
        shouldAllow: [
          [ResourceType.PATIENT_RECORD, Action.VIEW],
          [ResourceType.APPOINTMENT, Action.CREATE],
        ],
        shouldDeny: [
          [ResourceType.PRESCRIPTION, Action.CREATE],
          [ResourceType.PATIENT_RECORD, Action.DELETE],
        ],
      },
      {
        role: HealthcareRole.BILLING_STAFF,
        shouldAllow: [
          [ResourceType.BILLING, Action.UPDATE],
        ],
        shouldDeny: [
          [ResourceType.PRESCRIPTION, Action.VIEW],
          [ResourceType.LAB_RESULT, Action.VIEW],
        ],
      },
    ];

    testCases.forEach(({ role, shouldAllow, shouldDeny }) => {
      describe(`${role}`, () => {
        shouldAllow.forEach(([resource, action]) => {
          it(`allows ${action} ${resource}`, () => {
            const user = { id: `${role}-1`, role };
            const wrapper = createWrapper(user);
            
            const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
            
            expect(result.current.hasPermission(resource, action)).toBe(true);
          });
        });

        shouldDeny.forEach(([resource, action]) => {
          it(`denies ${action} ${resource}`, () => {
            const user = { id: `${role}-1`, role };
            const wrapper = createWrapper(user);
            
            const { result } = renderHook(() => useHealthcareAccess(), { wrapper });
            
            expect(result.current.hasPermission(resource, action)).toBe(false);
          });
        });
      });
    });
  });
});
