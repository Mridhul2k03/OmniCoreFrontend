import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationDropdown } from './NotificationDropdown';
import { RoleSwitcher } from './RoleSwitcher';
import { TenantSwitcher } from './TenantSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, Shield, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  isPlatform?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isPlatform = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-[#0f172a]/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {!isPlatform ? (
          <TenantSwitcher />
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-300">
            <Shield className="h-3.5 w-3.5" />
            <span>Platform Super Admin Workspace</span>
          </div>
        )}

        <div className="hidden md:block pl-2">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Workspace Switcher Link */}
        {user?.isPlatformUser && (
          <Link
            to={isPlatform ? '/app/dashboard' : '/platform/dashboard'}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-blue-400" />
            {isPlatform ? 'Switch to Tenant Operations' : 'Switch to Super Admin'}
          </Link>
        )}

        {/* Live Role Switcher for dynamic authorization inspection */}
        <RoleSwitcher />

        {/* Notification bell */}
        <NotificationDropdown />

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
