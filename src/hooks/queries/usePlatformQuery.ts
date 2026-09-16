import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { platformApi } from '../../api/platform.api';
import { Tenant, PackageTier, AddonKey } from '../../types';

// ==================== QUERIES ====================

export function usePlatformTenants(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.platform.tenants(filters),
    queryFn: () => platformApi.getTenants(),
  });
}

export function useTenantDetail(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.platform.tenantDetail(tenantId),
    queryFn: () => platformApi.getTenantById(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useTenantCustomOverrides(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.platform.features(tenantId),
    queryFn: () => platformApi.getTenantCustomOverrides(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function usePlatformDashboard() {
  return useQuery({
    queryKey: queryKeys.platform.dashboard,
    queryFn: () => platformApi.getStats(),
  });
}

// ==================== MUTATIONS ====================

export function useUpdateTenantCustomOverrideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      featureKey,
      isEnabled,
    }: {
      tenantId: string;
      featureKey: string;
      isEnabled: boolean;
    }) => platformApi.updateTenantCustomOverride(tenantId, featureKey, isEnabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.platform.features(variables.tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.current,
      });
    },
  });
}

export function useCreateCustomFeatureDefinitionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      featureKey,
      isEnabled = true,
    }: {
      tenantId: string;
      featureKey: string;
      featureName?: string;
      description?: string;
      isEnabled?: boolean;
    }) => platformApi.updateTenantCustomOverride(tenantId, featureKey, isEnabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.platform.features(variables.tenantId),
      });
    },
  });
}

export function useUpgradeTenantPackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantId,
      newPackage,
      addons = [],
    }: {
      tenantId: string;
      newPackage: PackageTier;
      addons?: AddonKey[];
    }) => platformApi.upgradeTenantPackage(tenantId, newPackage, addons),
    onSuccess: (updatedTenant: Tenant) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.platform.tenantDetail(updatedTenant.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.platform.tenants(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.current,
      });
    },
  });
}
