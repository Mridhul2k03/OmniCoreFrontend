import React from 'react';
import { AddonKey } from '../../types';
import { useTenant } from '../../contexts/TenantContext';

interface FeatureGuardProps {
  feature?: string;
  addon?: AddonKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  addon,
  fallback = null,
  children,
}) => {
  const { hasFeature, hasAddon } = useTenant();

  if (addon && !hasAddon(addon)) {
    return <>{fallback}</>;
  }

  if (feature && !hasFeature(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
