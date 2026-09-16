import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { PlatformLayout } from '../layouts/PlatformLayout';
import { AppLayout } from '../layouts/AppLayout';

// Guards
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { TenantGuard } from '../components/guards/TenantGuard';
import { PermissionGuard } from '../components/guards/PermissionGuard';
import { FeatureGuard } from '../components/guards/FeatureGuard';

// Auth Pages
import { Login } from '../features/auth/Login';
import { MfaVerification } from '../features/auth/MfaVerification';
import { ForgotPassword } from '../features/auth/ForgotPassword';
import { ResetPassword } from '../features/auth/ResetPassword';
import { SessionExpired } from '../features/auth/SessionExpired';
import { Unauthorized } from '../features/auth/Unauthorized';
import { NotFound } from '../features/auth/NotFound';

// Platform Super Admin Pages
import { PlatformDashboard } from '../features/platform/PlatformDashboard';
import { TenantList } from '../features/platform/TenantList';
import { PackageManagement } from '../features/platform/PackageManagement';
import { SubscriptionsList } from '../features/platform/SubscriptionsList';
import { PlatformAudit } from '../features/platform/PlatformAudit';

// Tenant Operations Pages
import { TenantDashboard } from '../features/dashboard/TenantDashboard';
import { FleetList } from '../features/fleet/FleetList';
import { DriverList } from '../features/drivers/DriverList';
import { TripsHub } from '../features/trips/TripsHub';
import { ContractsHub } from '../features/contracts/ContractsHub';
import { MaintenanceHub } from '../features/maintenance/MaintenanceHub';
import { WarehouseHub } from '../features/warehouse/WarehouseHub';
import { FinanceHub } from '../features/finance/FinanceHub';
import { CrmHub } from '../features/crm/CrmHub';
import { HrHub } from '../features/hr/HrHub';
import { InsuranceHub } from '../features/insurance/InsuranceHub';
import { MarketingHub } from '../features/marketing/MarketingHub';
import { ReportsHub } from '../features/reports/ReportsHub';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { TenantSettings } from '../features/settings/TenantSettings';

// New Add-on & Vertical Pages
import { CourierDashboard } from '../features/courier/CourierDashboard';
import { ShuttleDashboard } from '../features/shuttle/ShuttleDashboard';
import { CustomFeatureOverrides } from '../features/platform/CustomFeatureOverrides';
import { PublicPortalLayout } from '../features/public/PublicPortalLayout';
import { PublicHome } from '../features/public/PublicHome';
import { PublicTracking } from '../features/public/PublicTracking';
import { PublicBooking } from '../features/public/PublicBooking';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

      {/* A. Authentication Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="mfa" element={<MfaVerification />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="session-expired" element={<SessionExpired />} />
      </Route>

      {/* Error Screens */}
      <Route path="/auth/unauthorized" element={<Unauthorized />} />
      <Route path="/auth/404" element={<NotFound />} />

      {/* B. Platform / Super Admin Portal */}
      <Route
        path="/platform"
        element={
          <ProtectedRoute requirePlatformAdmin={true}>
            <PlatformLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/platform/dashboard" replace />} />
        <Route path="dashboard" element={<PlatformDashboard />} />
        <Route path="tenants" element={<TenantList />} />
        <Route path="tenants/:id/features" element={<CustomFeatureOverrides />} />
        <Route path="packages" element={<PackageManagement />} />
        <Route path="features" element={<PackageManagement />} />
        <Route path="subscriptions" element={<SubscriptionsList />} />
        <Route path="sales" element={<SubscriptionsList />} />
        <Route path="support" element={<PlatformAudit />} />
        <Route path="audit" element={<PlatformAudit />} />
      </Route>

      {/* C. Tenant Application Workspace */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <TenantGuard>
              <AppLayout />
            </TenantGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="fleet" element={<FleetList />} />
        <Route path="drivers" element={<DriverList />} />
        <Route path="trips" element={<TripsHub />} />
        <Route path="courier" element={<CourierDashboard />} />
        <Route path="shuttle" element={<ShuttleDashboard />} />

        {/* Feature/Entitlement Protected Routes */}
        <Route
          path="contracts"
          element={
            <FeatureGuard
              addon="addon_contracts"
              fallback={<Unauthorized />}
            >
              <ContractsHub />
            </FeatureGuard>
          }
        />
        <Route path="maintenance" element={<MaintenanceHub />} />
        <Route
          path="warehouse"
          element={
            <FeatureGuard
              addon="addon_warehouse"
              fallback={<Unauthorized />}
            >
              <WarehouseHub />
            </FeatureGuard>
          }
        />
        <Route path="crm" element={<CrmHub />} />

        {/* Permission Protected Routes */}
        <Route
          path="finance"
          element={
            <PermissionGuard permission="finance.view" fallback={<Unauthorized />}>
              <FinanceHub />
            </PermissionGuard>
          }
        />
        <Route
          path="hr"
          element={
            <PermissionGuard permission="hr.view" fallback={<Unauthorized />}>
              <HrHub />
            </PermissionGuard>
          }
        />

        <Route path="insurance" element={<InsuranceHub />} />
        <Route path="marketing" element={<MarketingHub />} />
        <Route path="reports" element={<ReportsHub />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="settings" element={<TenantSettings />} />
      </Route>

      {/* D. Tenant Public Mini-Website & Booking Portal */}
      <Route path="/public/:tenantSlug" element={<PublicPortalLayout />}>
        <Route index element={<PublicHome />} />
        <Route path="track" element={<PublicTracking />} />
        <Route path="book" element={<PublicBooking />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/auth/404" replace />} />
    </Routes>
  );
};
