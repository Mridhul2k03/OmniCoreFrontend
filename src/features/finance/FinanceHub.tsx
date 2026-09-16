import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../../api/finance.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Invoice, InvoiceStatus } from '../../types';
import { DollarSign, Plus, CheckCircle2, AlertTriangle, Receipt, Fuel, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatDate } from '../../lib/utils';

export const FinanceHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    clientName: 'Pfizer BioPharma North America',
    amount: 12500,
  });

  const { data: summary } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: () => financeApi.getSummary(),
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => financeApi.getInvoices(),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: typeof newInvoice) => financeApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsInvoiceModalOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      financeApi.updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const getInvoiceBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid in Full</Badge>;
      case 'issued':
        return <Badge variant="info">Issued / Sent</Badge>;
      case 'overdue':
        return <Badge variant="danger" dot>Overdue</Badge>;
      case 'partially_paid':
        return <Badge variant="warning">Partially Paid</Badge>;
      case 'draft':
        return <Badge variant="default">Draft</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      key: 'number',
      header: 'Invoice # & Client',
      sortable: true,
      accessor: (r) => r.invoiceNumber,
      render: (_, row) => (
        <div>
          <span className="font-mono font-bold text-white text-xs block">{row.invoiceNumber}</span>
          <span className="text-slate-300 font-medium">{row.clientName}</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Issue / Due Date',
      render: (_, row) => (
        <div className="text-xs">
          <span className="text-slate-300 block">{formatDate(row.issueDate)}</span>
          <span className="text-[10px] text-slate-500">Due: {formatDate(row.dueDate)}</span>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Invoiced',
      sortable: true,
      accessor: (r) => r.totalAmount,
      render: (val) => <span className="font-mono font-bold text-white text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'balance',
      header: 'Balance Due',
      sortable: true,
      accessor: (r) => r.balanceDue,
      render: (val) => (
        <span className={`font-mono font-bold text-xs ${val > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => r.status,
      render: (val) => getInvoiceBadge(val as InvoiceStatus),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.status !== 'paid' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ id: row.id, status: 'paid' })}
            >
              Record Payment
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Finance, Invoicing & P&L Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Accounts receivable, trip margins, fuel & toll overhead, and commercial invoices.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsInvoiceModalOpen(true)}
        >
          Create Invoice
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed Revenue (MTD)"
          value={formatCurrency(summary?.totalRevenue || 486500)}
          subtitle="Realized gross linehaul"
          icon={<DollarSign className="h-4 w-4" />}
          accentColor="emerald"
        />

        <StatCard
          title="Total Cash Collections"
          value={formatCurrency(summary?.totalCollections || 258728)}
          subtitle="Received to operating account"
          icon={<Receipt className="h-4 w-4" />}
          accentColor="blue"
        />

        <StatCard
          title="Fuel & Toll Overhead"
          value={formatCurrency((summary?.fuelExpenses || 78400) + (summary?.tollExpenses || 12600))}
          subtitle="Fleet operating variable cost"
          icon={<Fuel className="h-4 w-4" />}
          accentColor="rose"
        />

        <StatCard
          title="Net Operating Margin"
          value={formatCurrency(summary?.netMargin || 224600)}
          subtitle="46.1% Gross Margin"
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="cyan"
        />
      </div>

      {/* Monthly Revenue vs Expenses Chart */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Revenue vs Operating Burn</h3>
            <p className="text-xs text-slate-400">Gross revenue against fuel, tolls, maintenance, and driver payroll</p>
          </div>
          <Badge variant="outline">Past 6 Months</Badge>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary?.monthlyRevenueSeries || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="#10b981" name="Gross Revenue ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#3b82f6" name="Net Profit ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Invoices Table */}
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        searchPlaceholder="Search invoice #, client name..."
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Issue Commercial Invoice"
        description="Generate a billing invoice for dedicated linehaul or spot transport services."
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createInvoiceMutation.mutate(newInvoice);
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="Client / Shipper Legal Entity"
            required
            value={newInvoice.clientName}
            onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
          />

          <Input
            label="Invoice Subtotal Amount ($)"
            type="number"
            required
            value={newInvoice.amount}
            onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
          />

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createInvoiceMutation.isPending}>
              Issue & Transmit Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
