import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../../api/trips.api';
import { DataTable, ColumnDef } from '../../components/tables/DataTable';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Trip, Booking, TripStatus, VerticalType } from '../../types';
import { DispatchBoard } from './DispatchBoard';
import { TripDetailsDrawer } from './TripDetailsDrawer';
import { Navigation, Plus, Eye, Clock, Calendar, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export const TripsHub: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'trips' | 'bookings' | 'dispatch'>('trips');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    dropoffLocation: '',
    vertical: 'freight_logistics' as VerticalType,
    cargoDescription: '',
    estimatedAmount: 2500,
  });

  const { data: trips = [], isLoading: isTripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsApi.getTrips(),
  });

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => tripsApi.getBookings(),
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: typeof newBooking) => tripsApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsNewBookingModalOpen(false);
      setNewBooking({
        customerName: '',
        customerPhone: '',
        pickupLocation: '',
        dropoffLocation: '',
        vertical: 'freight_logistics',
        cargoDescription: '',
        estimatedAmount: 2500,
      });
    },
  });

  const getTripStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'in_transit':
        return <Badge variant="info" dot>In Transit</Badge>;
      case 'dispatched':
        return <Badge variant="purple" dot>Dispatched</Badge>;
      case 'loading':
        return <Badge variant="warning" dot>Loading</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const tripColumns: ColumnDef<Trip>[] = [
    {
      key: 'code',
      header: 'Trip Code & Customer',
      sortable: true,
      accessor: (r) => r.tripCode,
      render: (_, row) => (
        <div>
          <span className="font-bold font-mono text-white text-xs block">{row.tripCode}</span>
          <span className="text-slate-300 font-medium">{row.customerName}</span>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Linehaul Route',
      render: (_, row) => (
        <div className="text-xs">
          <span className="text-white block font-medium">{row.origin}</span>
          <span className="text-slate-400 text-[11px]">➔ {row.destination}</span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle Reg',
      accessor: (r) => r.vehicleReg,
      render: (val) => <span className="font-mono text-xs text-blue-400 font-bold">{val}</span>,
    },
    {
      key: 'driver',
      header: 'Assigned Driver',
      accessor: (r) => r.driverName,
      render: (val) => <span className="text-slate-200">{val}</span>,
    },
    {
      key: 'rate',
      header: 'Rate / Profit',
      sortable: true,
      accessor: (r) => r.commercialRate,
      render: (_, row) => (
        <div className="text-xs font-mono">
          <span className="text-emerald-400 font-bold">{formatCurrency(row.commercialRate)}</span>
          <span className="text-[10px] text-slate-500 block">Exp: {formatCurrency(row.expensesTotal)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (r) => r.status,
      render: (val) => getTripStatusBadge(val as TripStatus),
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
            setSelectedTrip(row);
          }}
          leftIcon={<Eye className="h-3.5 w-3.5 text-blue-400" />}
        >
          Track
        </Button>
      ),
    },
  ];

  const bookingColumns: ColumnDef<Booking>[] = [
    {
      key: 'bookingCode',
      header: 'Booking Code',
      accessor: (r) => r.bookingCode,
      render: (val) => <span className="font-mono font-bold text-white text-xs">{val}</span>,
    },
    {
      key: 'customer',
      header: 'Client & Phone',
      render: (_, row) => (
        <div>
          <span className="text-white font-medium block">{row.customerName}</span>
          <span className="text-[11px] text-slate-400">{row.customerPhone}</span>
        </div>
      ),
    },
    {
      key: 'cargo',
      header: 'Cargo / Load',
      render: (_, row) => (
        <div className="max-w-[200px] truncate">
          <span className="text-slate-300 block">{row.cargoDescription}</span>
          <span className="text-[10px] text-slate-500">{row.estimatedWeightKg?.toLocaleString()} kg</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Est. Value',
      accessor: (r) => r.estimatedAmount,
      render: (val) => <span className="font-mono font-bold text-emerald-400">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => r.status,
      render: (val: string) => {
        if (val === 'dispatched') return <Badge variant="purple">Dispatched</Badge>;
        if (val === 'confirmed') return <Badge variant="success">Confirmed</Badge>;
        return <Badge variant="warning">Pending</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings, Trips & Dispatch Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end linehaul movement, active GPS progression, expense logs, and dispatch board.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsNewBookingModalOpen(true)}
          >
            Create Customer Booking
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        tabs={[
          { id: 'trips', label: 'Active Trips & History', count: trips.length },
          { id: 'bookings', label: 'Customer Bookings', count: bookings.length },
          { id: 'dispatch', label: 'Live Dispatch Board' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        variant="underline"
      />

      {/* Tab 1: Trips Table */}
      {activeTab === 'trips' && (
        <DataTable
          columns={tripColumns}
          data={trips}
          isLoading={isTripsLoading}
          searchPlaceholder="Search trip code, client, vehicle reg, driver..."
          onRowClick={(row) => setSelectedTrip(row)}
        />
      )}

      {/* Tab 2: Bookings Table */}
      {activeTab === 'bookings' && (
        <DataTable
          columns={bookingColumns}
          data={bookings}
          isLoading={isBookingsLoading}
          searchPlaceholder="Search customer, booking code, phone..."
        />
      )}

      {/* Tab 3: Dispatch Board */}
      {activeTab === 'dispatch' && <DispatchBoard />}

      {/* Trip Details Drawer */}
      <TripDetailsDrawer
        trip={selectedTrip}
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
      />

      {/* New Booking Modal */}
      <Modal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        title="Create Customer Booking"
        description="Record an inbound transport or linehaul request."
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createBookingMutation.mutate(newBooking);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer / Shipper Name"
              required
              placeholder="e.g. Pfizer BioPharma, Target DC"
              value={newBooking.customerName}
              onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
            />

            <Input
              label="Customer Phone Contact"
              required
              placeholder="e.g. +1 (800) 555-0199"
              value={newBooking.customerPhone}
              onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
            />

            <Input
              label="Pickup Location / Hub"
              required
              placeholder="e.g. Distribution Facility, Kalamazoo, MI"
              value={newBooking.pickupLocation}
              onChange={(e) => setNewBooking({ ...newBooking, pickupLocation: e.target.value })}
            />

            <Input
              label="Dropoff Location / Terminal"
              required
              placeholder="e.g. Northwestern Memorial Hospital Hub, Chicago, IL"
              value={newBooking.dropoffLocation}
              onChange={(e) => setNewBooking({ ...newBooking, dropoffLocation: e.target.value })}
            />

            <Select
              label="Transport Vertical"
              value={newBooking.vertical}
              onChange={(e) => setNewBooking({ ...newBooking, vertical: e.target.value as VerticalType })}
              options={[
                { value: 'freight_logistics', label: 'Freight Logistics' },
                { value: 'cold_chain', label: 'Cold Chain & Temperature-Controlled' },
                { value: 'b2b_contract', label: 'B2B Contract Logistics' },
                { value: 'last_mile', label: 'Last-Mile Delivery' },
              ]}
            />

            <Input
              label="Commercial Agreed Rate ($)"
              type="number"
              value={newBooking.estimatedAmount}
              onChange={(e) => setNewBooking({ ...newBooking, estimatedAmount: Number(e.target.value) })}
            />

            <div className="md:col-span-2">
              <Input
                label="Cargo / Freight Description"
                placeholder="e.g. 22 Pallets Temperature-Sensitive Vaccines (-20°C strictly mandated)"
                value={newBooking.cargoDescription}
                onChange={(e) => setNewBooking({ ...newBooking, cargoDescription: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createBookingMutation.isPending}>
              Create Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
