import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrApi } from '../../api/hr.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Employee, TenantRole } from '../../types';
import { useTenant } from '../../contexts/TenantContext';
import { Users, Plus, ShieldCheck, Lock, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const HrHub: React.FC = () => {
  const { can } = useTenant();
  const canViewPayroll = can('payroll.view');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrApi.getEmployees(),
  });

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'code',
      header: 'Employee Code & Name',
      sortable: true,
      accessor: (r) => `${r.firstName} ${r.lastName}`,
      render: (_, row) => (
        <div>
          <span className="font-bold text-white text-xs block">
            {row.firstName} {row.lastName}
          </span>
          <span className="text-[11px] font-mono text-slate-400">{row.employeeCode}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      accessor: (r) => r.department,
      render: (val) => <Badge variant="outline" size="sm">{val}</Badge>,
    },
    {
      key: 'role',
      header: 'Tenant Role',
      accessor: (r) => r.role,
      render: (val: string) => (
        <span className="text-blue-400 text-xs font-medium capitalize">
          {val.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'joining',
      header: 'Hire Date',
      accessor: (r) => r.joiningDate,
      render: (val) => <span className="text-slate-300 font-mono text-xs">{formatDate(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => r.status,
      render: (val) => <Badge variant="success" dot>Active</Badge>,
    },
    {
      key: 'salary',
      header: 'Monthly Compensation',
      render: (_, row) => {
        if (!canViewPayroll) {
          return (
            <span className="text-slate-500 flex items-center gap-1 text-[11px] italic">
              <Lock className="h-3 w-3" /> Confidential
            </span>
          );
        }
        return (
          <span className="font-mono font-bold text-emerald-400 text-xs">
            {row.salary ? formatCurrency(row.salary.netPay) : 'Configuring'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Human Resources & Staff Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operations personnel, departmental assignments, attendance, and permission-protected payroll.
          </p>
        </div>

        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Add Employee
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        searchPlaceholder="Search employee name, department, email..."
      />
    </div>
  );
};
