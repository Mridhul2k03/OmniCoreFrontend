import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Navigation,
  FileText,
  Wrench,
  Boxes,
  DollarSign,
  UserCheck,
  Building2,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Receipt,
  Headphones,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Megaphone,
  LifeBuoy,
  PackageCheck,
  Bus,
  Globe,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../common/Badge';

export interface SidebarProps {
  isPlatform?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isPlatform = false,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { tenant, packageTier, enabledAddons, can } = useTenant();
  const { user } = useAuth();

  // Platform / Super Admin Navigation Items
  const platformNav = [
    { label: 'Platform Overview', path: '/platform/dashboard', icon: LayoutDashboard },
    { label: 'Tenants & Provisioning', path: '/platform/tenants', icon: Building2 },
    { label: 'Packages & Tiers', path: '/platform/packages', icon: Package },
    { label: 'Features & Add-ons', path: '/platform/features', icon: Layers },
    { label: 'Subscriptions', path: '/platform/subscriptions', icon: Receipt },
    { label: 'Sales & Growth', path: '/platform/sales', icon: TrendingUp },
    { label: 'Support & Tickets', path: '/platform/support', icon: Headphones },
    { label: 'Platform Audit Log', path: '/platform/audit', icon: ShieldCheck },
  ];

  // Tenant Operations Navigation Items (Dynamically filtered by entitlements & permissions)
  const tenantNav = [
    {
      label: 'Operations Hub',
      path: '/app/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Fleet Management',
      path: '/app/fleet',
      icon: Truck,
      show: true,
      badge: `${tenant.vehicleCount}`,
    },
    {
      label: 'Driver Directory',
      path: '/app/drivers',
      icon: Users,
      show: true,
    },
    {
      label: 'Bookings & Dispatch',
      path: '/app/trips',
      icon: Navigation,
      show: true,
      badge: `${tenant.activeTripsCount} live`,
      badgeVariant: 'success' as const,
    },
    {
      label: 'Courier & Express',
      path: '/app/courier',
      icon: PackageCheck,
      show: tenant.verticals.includes('courier_express') || tenant.verticals.includes('all_verticals') || packageTier === 'enterprise',
      badge: 'AWB Hub',
      badgeVariant: 'success' as const,
    },
    {
      label: 'Corporate Shuttle',
      path: '/app/shuttle',
      icon: Bus,
      show: tenant.verticals.includes('corporate_shuttle') || tenant.verticals.includes('all_verticals') || packageTier === 'enterprise',
      badge: 'Routes',
    },
    {
      label: 'Contracts & Tenders',
      path: '/app/contracts',
      icon: FileText,
      // Enabled if addon or corporate/enterprise
      show: enabledAddons.includes('addon_contracts') || ['corporate', 'enterprise'].includes(packageTier),
    },
    {
      label: 'Workshop & Maintenance',
      path: '/app/maintenance',
      icon: Wrench,
      // Enabled on standard, corporate, enterprise
      show: packageTier !== 'basic',
    },
    {
      label: 'Warehouse & Spare Parts',
      path: '/app/warehouse',
      icon: Boxes,
      // Enabled if addon or corporate/enterprise
      show: enabledAddons.includes('addon_warehouse') || ['corporate', 'enterprise'].includes(packageTier),
    },
    {
      label: 'CRM & Pipeline',
      path: '/app/crm',
      icon: UserCheck,
      // Enabled on corporate & enterprise
      show: ['corporate', 'enterprise'].includes(packageTier),
    },
    {
      label: 'Finance & Invoicing',
      path: '/app/finance',
      icon: DollarSign,
      // Permission-gated: only if user has finance permission
      show: can('finance.view'),
    },
    {
      label: 'HR & Personnel',
      path: '/app/hr',
      icon: Users,
      // Permission-gated: only if user has hr permission
      show: can('hr.view'),
    },
    {
      label: 'Insurance & Claims',
      path: '/app/insurance',
      icon: ShieldCheck,
      show: true,
    },
    {
      label: 'Marketing Campaigns',
      path: '/app/marketing',
      icon: Megaphone,
      show: ['corporate', 'enterprise'].includes(packageTier),
    },
    {
      label: 'Public Booking Portal',
      path: `/public/${tenant.slug || 'apex-global'}`,
      icon: Globe,
      show: true,
      badge: 'Live',
    },
    {
      label: 'Reports & Analytics',
      path: '/app/reports',
      icon: FileBarChart,
      show: true,
    },
    {
      label: 'Tenant Settings',
      path: '/app/settings',
      icon: Settings,
      show: can('settings.manage') || user?.tenantRole === 'tenant_admin',
    },
  ];

  const items = isPlatform ? platformNav : tenantNav.filter((i) => i.show);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-[#0f172a] transition-all duration-300 lg:static',
          collapsed ? 'w-18' : 'w-64',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
              OC
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-bold text-sm tracking-tight text-white block truncate">
                  Omni<span className="text-blue-400">Core</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block -mt-1">
                  {isPlatform ? 'Super Admin' : 'Fleet Ecosystem'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Tenant Vertical Badge in Sidebar */}
        {!isPlatform && !collapsed && (
          <div className="px-4 py-2.5 bg-[#0b0f17]/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Tier:</span>
              <span className="font-semibold text-blue-400 uppercase tracking-wider">
                {packageTier}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {tenant.verticals.slice(0, 2).map((v) => (
                <span
                  key={v}
                  className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-300 capitalize"
                >
                  {v.replace('_', ' ')}
                </span>
              ))}
              {tenant.verticals.length > 2 && (
                <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-slate-400">
                  +{tenant.verticals.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1">{item.label}</span>
                    {(item as any).badge ? (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.2 text-[10px] font-bold shrink-0',
                          isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                        )}
                      >
                        {(item as any).badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Support / SLA info */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-800/80 bg-[#0b0f17]/40">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-cyan-400" />
                <span className="text-[11px] font-medium text-slate-300">
                  {isPlatform ? 'API Gateway Healthy' : 'Mission SLA Active'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {isPlatform ? '99.98% Platform Uptime' : '24/7 Telemetry Stream'}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
