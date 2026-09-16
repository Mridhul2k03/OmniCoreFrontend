import React from 'react';
import { useTenant } from '../../contexts/TenantContext';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { can } = useTenant();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
