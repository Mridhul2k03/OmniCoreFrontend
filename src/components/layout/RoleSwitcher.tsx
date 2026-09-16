import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_USERS } from '../../api/mockData';
import { User, UserRole } from '../../types';
import { UserCheck, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const RoleSwitcher: React.FC = () => {
  const { user, switchUserRoleForDemo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadge = (u: User) => {
    if (u.isPlatformUser) return { label: 'Platform Super Admin', color: 'text-purple-400 bg-purple-500/10' };
    switch (u.tenantRole) {
      case 'tenant_admin':
        return { label: 'Tenant Admin', color: 'text-blue-400 bg-blue-500/10' };
      case 'operations_manager':
        return { label: 'Operations Mgr', color: 'text-emerald-400 bg-emerald-500/10' };
      case 'finance_user':
        return { label: 'Finance User', color: 'text-amber-400 bg-amber-500/10' };
      case 'driver_field_user':
        return { label: 'Driver / Field', color: 'text-cyan-400 bg-cyan-500/10' };
      default:
        return { label: u.tenantRole || 'User', color: 'text-slate-400 bg-slate-500/10' };
    }
  };

  const currentBadge = user ? getRoleBadge(user) : { label: 'Guest', color: 'text-slate-400' };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80 hover:border-slate-600 transition-all cursor-pointer"
        title="Quick Role Simulation Switcher"
      >
        <UserCheck className="h-3.5 w-3.5 text-blue-400" />
        <span className="font-medium hidden sm:inline">{user?.firstName || 'User'}:</span>
        <span className={cn('px-1.5 py-0.5 rounded text-[11px] font-semibold', currentBadge.color)}>
          {currentBadge.label}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-40">
            <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulate Role Permissions
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Observe dynamic navigation, actions, and security gate reactions live.
              </p>
            </div>

            {MOCK_USERS.map((u) => {
              const badge = getRoleBadge(u);
              const isCurrent = user?.id === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUserRoleForDemo(u);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer',
                    isCurrent ? 'bg-blue-600/20 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0', badge.color)}>
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
