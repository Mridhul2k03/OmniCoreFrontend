import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { driversApi } from '../../api/drivers.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Driver } from '../../types';
import { DriverProfileDrawer } from './DriverProfileDrawer';
import { Users, Plus, Eye, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const DriverList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers', statusFilter],
    queryFn: () => driversApi.getDrivers({ status: statusFilter }),
  });

  const columns: ColumnDef<Driver>[] = [
    {
      key: 'name',
      header: 'Driver Name & Contact',
      sortable: true,
      accessor: (r) => `${r.firstName} ${r.lastName}`,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
            alt={row.firstName}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
          />
          <div>
            <span className="font-bold text-white block">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-[11px] text-slate-400">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'license',
      header: 'License & Validity',
      accessor: (r) => r.licenseNumber,
      render: (_, row) => {
        const isExpiringSoon = new Date(row.licenseExpiryDate).getTime() - Date.now() < 30 * 86400000;

        return (
          <div>
            <span className="font-mono text-xs text-slate-200 block font-semibold">
              {row.licenseNumber}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-slate-400">Exp: {formatDate(row.licenseExpiryDate)}</span>
              {isExpiringSoon && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3" /> Due Soon
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Duty Status',
      sortable: true,
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'available') return <Badge variant="success" dot>Available</Badge>;
        if (val === 'on_trip') return <Badge variant="info" dot>On Trip</Badge>;
        if (val === 'on_duty') return <Badge variant="purple" dot>On Duty</Badge>;
        return <Badge variant="default">{val}</Badge>;
      },
    },
    {
      key: 'assignedVehicle',
      header: 'Assigned Vehicle',
      render: (_, row) => (
        <div>
          {row.assignedVehicleReg ? (
            <span className="font-mono text-blue-400 font-semibold text-xs block">
              {row.assignedVehicleReg}
            </span>
          ) : (
            <span className="text-slate-500 italic text-xs">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'safety',
      header: 'Safety & On-Time',
      sortable: true,
      accessor: (r) => r.safetyScore,
      render: (_, row) => (
        <div className="text-xs">
          <span className="font-bold text-emerald-400 font-mono">{row.safetyScore}/100</span>
          <span className="text-[10px] text-slate-400 block">{row.onTimeDeliveryRate}% on-time</span>
        </div>
      ),
    },
    {
      key: 'trips',
      header: 'Trips Completed',
      sortable: true,
      accessor: (r) => r.totalTrips,
      render: (val) => <span className="font-mono text-slate-300 font-bold">{val}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDriver(row);
          }}
          leftIcon={<Eye className="h-3.5 w-3.5 text-blue-400" />}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Commercial Driver Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            CDL credentials, license expirations, safety telematics, and permission-protected payroll.
          </p>
        </div>

        <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          Add Driver
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        isLoading={isLoading}
        searchPlaceholder="Search driver name, license number, phone..."
        onRowClick={(row) => setSelectedDriver(row)}
        filterSlot={
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 h-9 text-xs"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'available', label: 'Available' },
              { value: 'on_trip', label: 'On Trip' },
              { value: 'on_duty', label: 'On Duty' },
            ]}
          />
        }
      />

      {/* Driver Profile Drawer */}
      <DriverProfileDrawer
        driver={selectedDriver}
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
      />
    </div>
  );
};
