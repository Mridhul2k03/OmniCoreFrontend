import { apiClient } from './client';
import { Tenant, AuditLog, TenantCustomFeatureOverride, PackageTier, AddonKey } from '../types';
import { MOCK_TENANTS, MOCK_AUDIT_LOGS, MOCK_TENANT_FEATURE_OVERRIDES } from './mockData';

let overridesState: Record<string, TenantCustomFeatureOverride[]> = { ...MOCK_TENANT_FEATURE_OVERRIDES };

export interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  mrrTotal: number;
  arrTotal: number;
  newSubscriptionsThisMonth: number;
  renewalsThisMonth: number;
  outstandingPayments: number;
  packageDistribution: { name: string; count: number; value: number }[];
  verticalDistribution: { name: string; count: number }[];
  addonAdoption: { name: string; count: number; percentage: number }[];
  activeAlertsCount: number;
  incidentCount: number;
}

export const platformApi = {
  getStats: async (): Promise<PlatformStats> => {
    try {
      const response = await apiClient.get<PlatformStats>('/platform/stats/');
      return response.data;
    } catch {
      return {
        totalTenants: 148,
        activeTenants: 132,
        mrrTotal: 184500,
        arrTotal: 2214000,
        newSubscriptionsThisMonth: 14,
        renewalsThisMonth: 28,
        outstandingPayments: 18420,
        packageDistribution: [
          { name: 'Basic Starter', count: 35, value: 35 },
          { name: 'Standard Fleet', count: 52, value: 52 },
          { name: 'Corporate', count: 42, value: 42 },
          { name: 'OmniCore Enterprise', count: 19, value: 19 },
        ],
        verticalDistribution: [
          { name: 'Goods & Freight', count: 48 },
          { name: 'Cold Chain', count: 26 },
          { name: 'B2B Contracts', count: 24 },
          { name: 'Taxi / Cab Fleet', count: 22 },
          { name: 'Tourist / Bus', count: 16 },
          { name: 'Courier & Express', count: 18 },
          { name: 'Corporate Shuttle', count: 14 },
          { name: 'Last-Mile E-com', count: 12 },
        ],
        addonAdoption: [
          { name: 'GPS Telematics', count: 98, percentage: 66 },
          { name: 'Cold Chain Reefer', count: 32, percentage: 22 },
          { name: 'Contract & Tender SLA', count: 64, percentage: 43 },
          { name: 'Warehouse & Inventory', count: 54, percentage: 36 },
          { name: 'Fleet Maintenance Pro', count: 76, percentage: 51 },
        ],
        activeAlertsCount: 3,
        incidentCount: 1,
      };
    }
  },

  getTenants: async (params?: { search?: string; status?: string; vertical?: string }): Promise<Tenant[]> => {
    try {
      const response = await apiClient.get<Tenant[]>('/platform/tenants/', { params });
      return response.data;
    } catch {
      let tenants = [...MOCK_TENANTS];
      if (params?.search) {
        const query = params.search.toLowerCase();
        tenants = tenants.filter(
          (t) => t.name.toLowerCase().includes(query) || t.primaryContactName.toLowerCase().includes(query)
        );
      }
      if (params?.status && params.status !== 'all') {
        tenants = tenants.filter((t) => t.status === params.status);
      }
      return tenants;
    }
  },

  getTenantById: async (id: string): Promise<Tenant | null> => {
    try {
      const response = await apiClient.get<Tenant>(`/platform/tenants/${id}/`);
      return response.data;
    } catch {
      return MOCK_TENANTS.find((t) => t.id === id) || MOCK_TENANTS[0];
    }
  },

  createTenant: async (payload: Partial<Tenant>): Promise<Tenant> => {
    try {
      const response = await apiClient.post<Tenant>('/platform/tenants/', payload);
      return response.data;
    } catch {
      const newTenant: Tenant = {
        id: 'tenant_' + Math.random().toString(36).substring(2, 9),
        name: payload.name || 'New Enterprise Tenant',
        slug: payload.slug || 'new-enterprise-tenant',
        status: payload.status || 'active',
        primaryContactName: payload.primaryContactName || 'Admin Contact',
        primaryContactEmail: payload.primaryContactEmail || 'admin@tenant.com',
        primaryContactPhone: payload.primaryContactPhone || '+1 (555) 000-0000',
        country: payload.country || 'United States',
        city: payload.city || 'Chicago',
        address: payload.address || 'Corporate Way',
        verticals: payload.verticals || ['freight_logistics'],
        subscription: payload.subscription || {
          package: 'standard',
          status: 'active',
          billingCycle: 'monthly',
          startDate: new Date().toISOString(),
          renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          mrr: 399,
          currency: 'USD',
          enabledAddons: ['addon_telematics'],
          autoRenew: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        vehicleCount: 0,
        activeTripsCount: 0,
        userCount: 1,
        storageUsedGb: 0.1,
      };
      MOCK_TENANTS.unshift(newTenant);
      return newTenant;
    }
  },

  updateTenantStatus: async (tenantId: string, status: Tenant['status']): Promise<Tenant> => {
    try {
      const response = await apiClient.patch<Tenant>(`/platform/tenants/${tenantId}/status/`, { status });
      return response.data;
    } catch {
      const tenant = MOCK_TENANTS.find((t) => t.id === tenantId);
      if (tenant) {
        tenant.status = status;
        return { ...tenant };
      }
      throw new Error('Tenant not found');
    }
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      const response = await apiClient.get<AuditLog[]>('/platform/audit/');
      return response.data;
    } catch {
      return MOCK_AUDIT_LOGS;
    }
  },

  // Custom Feature Overrides
  getTenantCustomOverrides: async (tenantId: string): Promise<TenantCustomFeatureOverride[]> => {
    try {
      const response = await apiClient.get<TenantCustomFeatureOverride[]>(`/platform/tenants/${tenantId}/overrides/`);
      return response.data;
    } catch {
      return (
        overridesState[tenantId] || [
          { featureKey: 'courier_express', name: 'Courier & Express Delivery', description: 'AWB and hub management module', source: 'vertical', isEnabled: true },
          { featureKey: 'corporate_shuttle', name: 'Corporate Shuttle Operations', description: 'Employee routes and sequential stop schedules', source: 'vertical', isEnabled: true },
          { featureKey: 'cross_docking', name: 'Warehouse Cross-Docking', description: 'Inbound to outbound staging workspace', source: 'custom_provision', isEnabled: false },
          { featureKey: 'shipment_consolidation', name: 'Multi-Day Shipment Consolidation', description: 'Consolidation group packing & master sealing', source: 'custom_provision', isEnabled: false },
          { featureKey: 'social_promotions', name: 'Social Media & Digital Promotions', description: 'Campaign tracking across social ad channels', source: 'addon', isEnabled: false },
          { featureKey: 'public_portal', name: 'Tenant Public Mini-Website', description: 'Customer tracking and quote booking portal', source: 'package', isEnabled: true },
        ]
      );
    }
  },

  updateTenantCustomOverride: async (
    tenantId: string,
    featureKey: string,
    isEnabled: boolean
  ): Promise<TenantCustomFeatureOverride> => {
    try {
      const response = await apiClient.patch<TenantCustomFeatureOverride>(
        `/platform/tenants/${tenantId}/overrides/${featureKey}/`,
        { isEnabled }
      );
      return response.data;
    } catch {
      const tenantOverrides = overridesState[tenantId] || [];
      const itemIndex = tenantOverrides.findIndex((o) => o.featureKey === featureKey);
      let updated: TenantCustomFeatureOverride;
      if (itemIndex !== -1) {
        updated = {
          ...tenantOverrides[itemIndex],
          isEnabled,
          source: 'custom_provision',
          enabledBy: 'admin@omnicore.io',
          enabledAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
        tenantOverrides[itemIndex] = updated;
      } else {
        updated = {
          featureKey,
          name: featureKey.replace(/_/g, ' ').toUpperCase(),
          description: 'Platform custom provision override',
          source: 'custom_provision',
          isEnabled,
          enabledBy: 'admin@omnicore.io',
          enabledAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
        tenantOverrides.push(updated);
      }
      overridesState[tenantId] = tenantOverrides;
      return updated;
    }
  },

  upgradeTenantPackage: async (
    tenantId: string,
    newPackage: PackageTier,
    addons: AddonKey[]
  ): Promise<Tenant> => {
    try {
      const response = await apiClient.post<Tenant>(`/platform/tenants/${tenantId}/upgrade/`, {
        package: newPackage,
        enabledAddons: addons,
      });
      return response.data;
    } catch {
      const tenant = MOCK_TENANTS.find((t) => t.id === tenantId);
      if (!tenant) throw new Error('Tenant not found');
      tenant.subscription.package = newPackage;
      tenant.subscription.enabledAddons = addons;
      tenant.subscription.mrr = newPackage === 'enterprise' ? 1899 : newPackage === 'corporate' ? 899 : 399;
      tenant.updatedAt = new Date().toISOString().slice(0, 10);
      return { ...tenant };
    }
  },
};

