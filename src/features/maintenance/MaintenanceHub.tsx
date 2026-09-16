import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../../api/maintenance.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatCard } from '../../components/common/StatCard';
import { MaintenanceRecord, MaintenanceType, WorkOrderStatus } from '../../types';
import { Wrench, Plus, AlertTriangle, CheckCircle2, Clock, ShieldAlert, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const MaintenanceHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const [newOrder, setNewOrder] = useState({
    vehicleReg: 'IL-9428-TX',
    type: 'preventive' as MaintenanceType,
    workshopName: 'Apex Central Workshop, Chicago',
    issueDescription: '',
    laborCost: 200,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['maintenanceRecords'],
    queryFn: () => maintenanceApi.getRecords(),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: typeof newOrder) =>
      maintenanceApi.createRecord({
        vehicleReg: data.vehicleReg,
        type: data.type,
        workshopName: data.workshopName,
        issueDescription: data.issueDescription,
        laborCost: data.laborCost,
        totalCost: data.laborCost,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceRecords'] });
      setIsNewOrderModalOpen(false);
    },
  });

  const columns: ColumnDef<MaintenanceRecord>[] = [
    {
      key: 'code',
      header: 'Work Order & Vehicle',
      sortable: true,
      accessor: (r) => r.recordCode,
      render: (_, row) => (
        <div>
          <span className="font-bold font-mono text-white text-xs block">{row.recordCode}</span>
          <span className="font-mono text-blue-400 font-semibold">{row.vehicleReg}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Service Type',
      accessor: (r) => r.type,
      render: (val: string) => {
        if (val === 'breakdown') return <Badge variant="danger" dot>Breakdown</Badge>;
        if (val === 'accident_repair') return <Badge variant="warning">Accident</Badge>;
        return <Badge variant="info">Preventive</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'in_progress') return <Badge variant="warning" dot>In Workshop</Badge>;
        if (val === 'completed') return <Badge variant="success">Completed</Badge>;
        return <Badge variant="default">{val}</Badge>;
      },
    },
    {
      key: 'workshop',
      header: 'Workshop & Mechanic',
      render: (_, row) => (
        <div className="text-xs">
          <span className="text-white block font-medium">{row.workshopName}</span>
          <span className="text-slate-400 text-[11px]">{row.technicianName}</span>
        </div>
      ),
    },
    {
      key: 'reported',
      header: 'Service Date',
      accessor: (r) => r.reportedDate,
      render: (val) => <span className="text-slate-300 font-mono text-xs">{formatDate(val)}</span>,
    },
    {
      key: 'cost',
      header: 'Total Repair Cost',
      sortable: true,
      accessor: (r) => r.totalCost,
      render: (val) => <span className="font-mono font-bold text-white text-xs">{formatCurrency(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance, Workshop & Compliance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Service schedules, parts consumption, statutory fitness certificates, and breakdown telemetry.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsNewOrderModalOpen(true)}
        >
          Create Work Order
        </Button>
      </div>

      {/* Statutory Reminders Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Road Tax Renewals Due"
          value="1 Vehicle"
          subtitle="IFTA IL-4401 in 30 days"
          icon={<Clock className="h-4 w-4" />}
          accentColor="amber"
        />

        <StatCard
          title="Active Workshop Orders"
          value="1 In Progress"
          subtitle="WI-3211-BT Turbo overhaul"
          icon={<Wrench className="h-4 w-4" />}
          accentColor="rose"
        />

        <StatCard
          title="Maintenance Spend (MTD)"
          value={formatCurrency(2948)}
          subtitle="Within $3,500 budget"
          icon={<DollarSign className="h-4 w-4" />}
          accentColor="emerald"
        />
      </div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        searchPlaceholder="Search work order, vehicle reg, workshop, mechanic..."
      />

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Create Workshop Repair Order"
        description="Schedule preventative maintenance or log emergency breakdown service."
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createOrderMutation.mutate(newOrder);
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="Vehicle Registration Plate"
            required
            value={newOrder.vehicleReg}
            onChange={(e) => setNewOrder({ ...newOrder, vehicleReg: e.target.value })}
          />

          <Select
            label="Maintenance Type"
            value={newOrder.type}
            onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value as MaintenanceType })}
            options={[
              { value: 'preventive', label: 'Scheduled Preventive Maintenance' },
              { value: 'breakdown', label: 'Emergency Mechanical Breakdown' },
              { value: 'accident_repair', label: 'Accident & Collision Damage' },
              { value: 'statutory_inspection', label: 'Statutory Fitness Inspection' },
            ]}
          />

          <Input
            label="Assigned Workshop / Bay"
            required
            value={newOrder.workshopName}
            onChange={(e) => setNewOrder({ ...newOrder, workshopName: e.target.value })}
          />

          <Input
            label="Diagnosed Issue / Fault Description"
            required
            placeholder="e.g. Engine oil leak, brake pad wear beyond limit, air pressure sensor fail"
            value={newOrder.issueDescription}
            onChange={(e) => setNewOrder({ ...newOrder, issueDescription: e.target.value })}
          />

          <Input
            label="Estimated Labor Cost ($)"
            type="number"
            value={newOrder.laborCost}
            onChange={(e) => setNewOrder({ ...newOrder, laborCost: Number(e.target.value) })}
          />

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createOrderMutation.isPending}>
              Issue Repair Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
