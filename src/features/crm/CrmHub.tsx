import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../../api/crm.api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Lead, Customer, LeadStage } from '../../types';
import { UserCheck, Plus, DollarSign, Building2, Phone, Mail, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const CrmHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'pipeline' | 'customers'>('pipeline');

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => crmApi.getLeads(),
  });

  const { data: customers = [], isLoading: isCustLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => crmApi.getCustomers(),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ leadId, stage }: { leadId: string; stage: LeadStage }) =>
      crmApi.updateLeadStage(leadId, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const stages: { id: LeadStage; label: string; color: string }[] = [
    { id: 'inquiry', label: 'Inquiries', color: 'border-blue-500/40 text-blue-400' },
    { id: 'qualification', label: 'Qualification', color: 'border-purple-500/40 text-purple-400' },
    { id: 'proposal', label: 'Proposal Sent', color: 'border-cyan-500/40 text-cyan-400' },
    { id: 'negotiation', label: 'Negotiation', color: 'border-amber-500/40 text-amber-400' },
    { id: 'won', label: 'Won / Signed', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  const customerColumns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Entity',
      sortable: true,
      accessor: (r) => r.name,
      render: (_, row) => (
        <div>
          <span className="font-bold text-white text-xs block">{row.name}</span>
          <span className="text-[11px] font-mono text-slate-400">{row.code}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Person',
      render: (_, row) => (
        <div className="text-xs">
          <span className="text-slate-200 block font-medium">{row.contactPerson}</span>
          <span className="text-[11px] text-slate-400">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'credit',
      header: 'Credit Limit / Balance',
      render: (_, row) => (
        <div className="text-xs font-mono">
          <span className="text-slate-200 block">Limit: {formatCurrency(row.creditLimit)}</span>
          <span className="text-amber-400 font-semibold">Due: {formatCurrency(row.outstandingBalance)}</span>
        </div>
      ),
    },
    {
      key: 'trips',
      header: 'Completed Trips',
      accessor: (r) => r.totalTripsCompleted,
      render: (val) => <span className="font-bold font-mono text-white text-xs">{val} Journeys</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Enterprise Shipper Accounts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logistics freight pipeline, qualification, contract negotiations, and corporate customer profiles.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'pipeline', label: 'Sales Pipeline (Kanban)' },
            { id: 'customers', label: 'Customer Directory', count: customers.length },
          ]}
          activeTab={viewMode}
          onChange={(id) => setViewMode(id as any)}
          variant="pills"
        />
      </div>

      {/* Kanban Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const totalStageValue = stageLeads.reduce((sum, l) => sum + l.estimatedMonthlyValue, 0);

            return (
              <div key={stage.id} className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-3.5 space-y-3 min-w-[220px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{stage.label}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {formatCurrency(totalStageValue)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="p-3 bg-[#141c2e] hover:border-blue-500/50 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white block truncate">{lead.companyName}</span>
                        <Badge variant="outline" size="sm" className="capitalize text-[9px]">
                          {lead.verticalInterest.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">{lead.notes}</p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formatCurrency(lead.estimatedMonthlyValue)}/mo
                        </span>
                        {stage.id !== 'won' && (
                          <button
                            onClick={() => {
                              const nextIdx = stages.findIndex((s) => s.id === stage.id) + 1;
                              if (nextIdx < stages.length) {
                                updateStageMutation.mutate({ leadId: lead.id, stage: stages[nextIdx].id });
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                            title="Advance Stage"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customers Table View */}
      {viewMode === 'customers' && (
        <DataTable
          columns={customerColumns}
          data={customers}
          isLoading={isCustLoading}
          searchPlaceholder="Search customer account, contact person..."
        />
      )}
    </div>
  );
};
