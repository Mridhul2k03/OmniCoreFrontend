import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '../../api/contracts.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Contract, Tender, ContractStatus, TenderStatus } from '../../types';
import { FileText, Plus, CheckCircle2, AlertTriangle, Calculator, Briefcase, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const ContractsHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'contracts' | 'tenders'>('contracts');
  const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Proposal cost estimation state
  const [newTender, setNewTender] = useState({
    title: '',
    clientName: '',
    industry: '',
    estimatedValue: 1200000,
    estimatedVehicleRequired: 6,
    fleetCosts: 450000,
    fuelEstimates: 280000,
    crewPayroll: 310000,
    margins: 160000,
  });

  const { data: contracts = [], isLoading: isContractsLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.getContracts(),
  });

  const { data: tenders = [], isLoading: isTendersLoading } = useQuery({
    queryKey: ['tenders'],
    queryFn: () => contractsApi.getTenders(),
  });

  const tenderMutation = useMutation({
    mutationFn: (data: typeof newTender) =>
      contractsApi.createTender({
        title: data.title,
        clientName: data.clientName,
        industry: data.industry,
        estimatedValue: data.estimatedValue,
        estimatedVehicleRequired: data.estimatedVehicleRequired,
        costBreakdown: {
          fleetCosts: data.fleetCosts,
          fuelEstimates: data.fuelEstimates,
          crewPayroll: data.crewPayroll,
          margins: data.margins,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      setIsTenderModalOpen(false);
    },
  });

  const contractColumns: ColumnDef<Contract>[] = [
    {
      key: 'code',
      header: 'Contract Code & Title',
      sortable: true,
      accessor: (r) => r.contractCode,
      render: (_, row) => (
        <div>
          <span className="font-bold font-mono text-white text-xs block">{row.contractCode}</span>
          <span className="text-slate-300 font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Enterprise Client',
      accessor: (r) => r.clientName,
      render: (val) => <span className="font-semibold text-slate-200">{val}</span>,
    },
    {
      key: 'value',
      header: 'Contract Value',
      sortable: true,
      accessor: (r) => r.totalContractValue,
      render: (_, row) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-white block">{formatCurrency(row.totalContractValue)}</span>
          <span className="text-[10px] text-emerald-400">Realized: {formatCurrency(row.realizedRevenue)}</span>
        </div>
      ),
    },
    {
      key: 'sla',
      header: 'SLA Performance',
      render: (_, row) => (
        <div className="text-xs">
          <span className="font-bold text-emerald-400 font-mono">{row.slaActualPercent}%</span>
          <span className="text-[10px] text-slate-400 block">Target: {row.slaTargetPercent}%</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Period & Expiry',
      render: (_, row) => (
        <div className="text-xs">
          <span className="text-slate-300 block">{formatDate(row.startDate)} to {formatDate(row.endDate)}</span>
          {row.status === 'expiring_soon' && (
            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
              <AlertTriangle className="h-3 w-3" /> Expiry Alert: {row.renewalAlertDays} Days
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'active') return <Badge variant="success" dot>Active SLA</Badge>;
        if (val === 'expiring_soon') return <Badge variant="warning" dot>Renewal Due</Badge>;
        return <Badge variant="default">{val}</Badge>;
      },
    },
  ];

  const tenderColumns: ColumnDef<Tender>[] = [
    {
      key: 'tenderCode',
      header: 'Tender ID & RFP',
      accessor: (r) => r.tenderCode,
      render: (_, row) => (
        <div>
          <span className="font-mono font-bold text-white text-xs block">{row.tenderCode}</span>
          <span className="text-slate-300 font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client / Agency',
      accessor: (r) => r.clientName,
      render: (_, row) => (
        <div>
          <span className="text-slate-200 block font-medium">{row.clientName}</span>
          <span className="text-[10px] text-slate-400">{row.industry}</span>
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Estimated Value',
      accessor: (r) => r.estimatedValue,
      render: (val) => <span className="font-mono font-bold text-emerald-400 text-xs">{formatCurrency(val)}</span>,
    },
    {
      key: 'deadline',
      header: 'Submission Deadline',
      accessor: (r) => r.submissionDeadline,
      render: (val) => <span className="text-slate-300 text-xs font-mono">{formatDate(val)}</span>,
    },
    {
      key: 'status',
      header: 'Proposal Status',
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'submitted') return <Badge variant="info">Submitted</Badge>;
        if (val === 'under_review') return <Badge variant="purple">Under Review</Badge>;
        return <Badge variant="default">{val}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contracts & Tender Proposals</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tender cost estimators, digital SLA tracking, minimum guarantee billing, and renewal alerts.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsTenderModalOpen(true)}
        >
          Build Tender Proposal
        </Button>
      </div>

      {/* Visual Contract Lifecycle Progression Bar */}
      <Card className="p-4 bg-[#141c2e]">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">1</span>
            <span className="text-slate-300 font-semibold">Tender Notice</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">2</span>
            <span className="text-slate-300 font-semibold">Cost Estimation</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">3</span>
            <span className="text-slate-300 font-semibold">Proposal Submission</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">4</span>
            <span className="text-emerald-300 font-semibold">Active Contract Execution</span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">5</span>
            <span className="text-amber-300 font-semibold">SLA Renewal</span>
          </div>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'contracts', label: 'Active Enterprise Contracts', count: contracts.length },
          { id: 'tenders', label: 'Tenders & Proposals', count: tenders.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {activeTab === 'contracts' && (
        <DataTable
          columns={contractColumns}
          data={contracts}
          isLoading={isContractsLoading}
          searchPlaceholder="Search contract title, code, client name..."
        />
      )}

      {activeTab === 'tenders' && (
        <DataTable
          columns={tenderColumns}
          data={tenders}
          isLoading={isTendersLoading}
          searchPlaceholder="Search tender ID, client, industry..."
        />
      )}

      {/* Tender Cost Estimator & Proposal Builder Modal */}
      <Modal
        isOpen={isTenderModalOpen}
        onClose={() => setIsTenderModalOpen(false)}
        title="Tender Cost Estimator & Proposal Builder"
        description="Estimate fleet equipment costs, crew payroll, fuel margins, and projected contract value."
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tenderMutation.mutate(newTender);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tender Project Title"
              required
              placeholder="e.g. Regional Highway Haulage Contract"
              value={newTender.title}
              onChange={(e) => setNewTender({ ...newTender, title: e.target.value })}
            />

            <Input
              label="Issuing Client / Authority"
              required
              placeholder="e.g. USPS, Pfizer, Target"
              value={newTender.clientName}
              onChange={(e) => setNewTender({ ...newTender, clientName: e.target.value })}
            />

            <Input
              label="Industry Classification"
              placeholder="e.g. Pharmaceuticals, Retail, Energy"
              value={newTender.industry}
              onChange={(e) => setNewTender({ ...newTender, industry: e.target.value })}
            />

            <Input
              label="Dedicated Vehicles Required"
              type="number"
              value={newTender.estimatedVehicleRequired}
              onChange={(e) => setNewTender({ ...newTender, estimatedVehicleRequired: Number(e.target.value) })}
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] space-y-3">
            <span className="font-semibold text-white block flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-blue-400" />
              Automated Cost Breakdown & Margins
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Fleet Amortization ($)"
                type="number"
                value={newTender.fleetCosts}
                onChange={(e) => setNewTender({ ...newTender, fleetCosts: Number(e.target.value) })}
              />
              <Input
                label="Projected Fuel ($)"
                type="number"
                value={newTender.fuelEstimates}
                onChange={(e) => setNewTender({ ...newTender, fuelEstimates: Number(e.target.value) })}
              />
              <Input
                label="Crew Payroll ($)"
                type="number"
                value={newTender.crewPayroll}
                onChange={(e) => setNewTender({ ...newTender, crewPayroll: Number(e.target.value) })}
              />
              <Input
                label="Target Margin ($)"
                type="number"
                value={newTender.margins}
                onChange={(e) => setNewTender({ ...newTender, margins: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Total Tender Proposal Value:</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatCurrency(newTender.fleetCosts + newTender.fuelEstimates + newTender.crewPayroll + newTender.margins)}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsTenderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={tenderMutation.isPending}>
              Save & Build Proposal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
