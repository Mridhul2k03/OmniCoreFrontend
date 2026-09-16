import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../../api/platform.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tenant } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Receipt, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SubscriptionsList: React.FC = () => {
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['platformTenants'],
    queryFn: () => platformApi.getTenants(),
  });

  const columns: ColumnDef<Tenant>[] = [
    {
      key: 'name',
      header: 'Tenant Customer',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="font-semibold text-white block">{row.name}</span>
          <span className="text-[11px] text-slate-400">{row.primaryContactEmail}</span>
        </div>
      ),
    },
    {
      key: 'package',
      header: 'Tier',
      accessor: (row) => row.subscription.package,
      render: (val) => (
        <span className="font-bold text-blue-400 uppercase text-xs">
          {val}
        </span>
      ),
    },
    {
      key: 'cycle',
      header: 'Billing Cycle',
      accessor: (row) => row.subscription.billingCycle,
      render: (val) => (
        <span className="capitalize text-slate-300">
          {val}
        </span>
      ),
    },
    {
      key: 'mrr',
      header: 'MRR Value',
      sortable: true,
      accessor: (row) => row.subscription.mrr,
      render: (val) => (
        <span className="font-mono font-bold text-emerald-400">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'renewal',
      header: 'Next Renewal Date',
      sortable: true,
      accessor: (row) => row.subscription.renewalDate,
      render: (val) => (
        <span className="text-slate-300">
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'addons',
      header: 'Active Add-ons',
      accessor: (row) => row.subscription.enabledAddons.length,
      render: (val) => (
        <Badge variant="outline">{val} Add-ons</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Subscription Status',
      accessor: (row) => row.subscription.status,
      render: (val) => {
        if (val === 'active') return <Badge variant="success" dot>Active</Badge>;
        if (val === 'trial') return <Badge variant="info">Trial</Badge>;
        return <Badge variant="danger">{val}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ecosystem Subscriptions & Billing</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active recurring revenue streams, renewal timelines, and license entitlements.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        isLoading={isLoading}
        searchPlaceholder="Search customer, package, email..."
      />
    </div>
  );
};
