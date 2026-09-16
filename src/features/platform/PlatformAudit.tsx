import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../../api/platform.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { AuditLog } from '../../types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const PlatformAudit: React.FC = () => {
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['platformAuditLogs'],
    queryFn: () => platformApi.getAuditLogs(),
  });

  const columns: ColumnDef<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-400 text-[11px]">{val}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
          {val}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (val) => <Badge variant="outline" size="sm" className="capitalize">{val}</Badge>,
    },
    {
      key: 'details',
      header: 'Event Summary',
      render: (val) => <span className="text-slate-200">{val}</span>,
    },
    {
      key: 'actor',
      header: 'Actor & Role',
      render: (_, row) => (
        <div>
          <span className="text-slate-200 block truncate max-w-[150px]">{row.actorEmail}</span>
          <span className="text-[10px] text-slate-500">{row.actorRole}</span>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: 'Target Tenant',
      render: (_, row) => (
        <span className="text-slate-300 truncate max-w-[150px] block">
          {row.tenantName || 'Global Platform'}
        </span>
      ),
    },
    {
      key: 'ip',
      header: 'Origin IP',
      accessor: (r) => r.ipAddress,
      render: (val) => <span className="font-mono text-[11px] text-slate-400">{val}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Audit & SOC-2 Compliance</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable ledger of security actions, tenant provisioning mutations, and administrative operations.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={auditLogs}
        isLoading={isLoading}
        searchPlaceholder="Filter audit records by action, actor, IP, or summary..."
      />
    </div>
  );
};
