import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insuranceApi } from '../../api/insurance.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { InsurancePolicy, InsuranceClaim } from '../../types';
import { ShieldCheck, Plus, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const InsuranceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims'>('policies');

  const { data: policies = [], isLoading: isPolLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => insuranceApi.getPolicies(),
  });

  const { data: claims = [], isLoading: isClmLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: () => insuranceApi.getClaims(),
  });

  const policyColumns: ColumnDef<InsurancePolicy>[] = [
    {
      key: 'number',
      header: 'Policy Number & Underwriter',
      sortable: true,
      accessor: (r) => r.policyNumber,
      render: (_, row) => (
        <div>
          <span className="font-mono font-bold text-white text-xs block">{row.policyNumber}</span>
          <span className="text-slate-300 font-medium">{row.provider}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Coverage Type',
      accessor: (r) => r.type,
      render: (val: string) => (
        <Badge variant="outline" size="sm" className="capitalize">
          {val.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'coverage',
      header: 'Coverage Amount',
      sortable: true,
      accessor: (r) => r.coverageAmount,
      render: (val) => <span className="font-mono font-bold text-emerald-400 text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'premium',
      header: 'Annual Premium',
      sortable: true,
      accessor: (r) => r.premiumAmount,
      render: (val) => <span className="font-mono text-slate-300 text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'expiry',
      header: 'Policy Expiry',
      accessor: (r) => r.expiryDate,
      render: (val, row) => (
        <div className="text-xs font-mono">
          <span className="text-slate-200">{formatDate(val)}</span>
          {row.status === 'expiring_soon' && (
            <span className="text-amber-400 font-bold block text-[10px]">Renewal Due Soon</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'active') return <Badge variant="success" dot>Active Policy</Badge>;
        if (val === 'expiring_soon') return <Badge variant="warning" dot>Expiring</Badge>;
        return <Badge variant="danger">{val}</Badge>;
      },
    },
  ];

  const claimColumns: ColumnDef<InsuranceClaim>[] = [
    {
      key: 'claimNumber',
      header: 'Claim Number',
      accessor: (r) => r.claimNumber,
      render: (val) => <span className="font-mono font-bold text-white text-xs">{val}</span>,
    },
    {
      key: 'vehicle',
      header: 'Asset & Incident Date',
      render: (_, row) => (
        <div className="text-xs">
          <span className="font-mono text-blue-400 font-bold block">{row.vehicleReg}</span>
          <span className="text-slate-400 text-[11px]">{formatDate(row.incidentDate)}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Claimed / Settled',
      render: (_, row) => (
        <div className="text-xs font-mono">
          <span className="text-white font-bold block">{formatCurrency(row.claimAmount)}</span>
          {row.settledAmount && (
            <span className="text-emerald-400 text-[10px]">Settled: {formatCurrency(row.settledAmount)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Claim Status',
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'settled') return <Badge variant="success">Settled</Badge>;
        if (val === 'approved') return <Badge variant="info">Approved</Badge>;
        return <Badge variant="warning">Under Review</Badge>;
      },
    },
    {
      key: 'desc',
      header: 'Damage Report Summary',
      accessor: (r) => r.description,
      render: (val) => <span className="text-slate-300 text-xs truncate max-w-[200px] block">{val}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Insurance, Claims & Legal Compliance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Underwriter policies, goods-in-transit spoilage cover, and accident damage claim files.
          </p>
        </div>

        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          File Insurance Claim
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'policies', label: 'Active Insurance Policies', count: policies.length },
          { id: 'claims', label: 'Claims Ledger', count: claims.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {activeTab === 'policies' && (
        <DataTable
          columns={policyColumns}
          data={policies}
          isLoading={isPolLoading}
          searchPlaceholder="Search policy number, provider..."
        />
      )}

      {activeTab === 'claims' && (
        <DataTable
          columns={claimColumns}
          data={claims}
          isLoading={isClmLoading}
          searchPlaceholder="Search claim number, vehicle..."
        />
      )}
    </div>
  );
};
