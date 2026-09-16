import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';

interface TenantGuardProps {
  children: React.ReactNode;
}

export const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
  const { tenant } = useTenant();

  if (!tenant) {
    return <Navigate to="/auth/login" replace />;
  }

  if (tenant.status === 'suspended') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0b0f17] p-6 text-center text-white">
        <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-400">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Tenant Account Suspended</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Access for <strong>{tenant.name}</strong> is currently paused due to billing or compliance review. Please reach out to your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
