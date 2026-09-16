import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../../api/trips.api';
import { fleetApi } from '../../api/fleet.api';
import { driversApi } from '../../api/drivers.api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Booking, Vehicle, Driver } from '../../types';
import {
  Navigation,
  Truck,
  Users,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Sparkles,
  Radio,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const DispatchBoard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => tripsApi.getBookings(),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['fleetVehicles', 'available'],
    queryFn: () => fleetApi.getVehicles({ status: 'available' }),
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => driversApi.getDrivers({ status: 'available' }),
  });

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');

  const dispatchMutation = useMutation({
    mutationFn: () =>
      tripsApi.dispatchBooking(
        selectedBookingId!,
        selectedVehicleId || vehicles[0]?.id,
        selectedDriverId || drivers[0]?.id
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSelectedBookingId(null);
    },
  });

  const activeBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="space-y-6">
      {/* Dispatch Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Unassigned Bookings Queue */}
        <Card className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-400" />
                Unassigned Bookings
              </h3>
              <p className="text-[11px] text-slate-400">Select customer haul to dispatch</p>
            </div>
            <Badge variant="glow">{pendingBookings.length} In Queue</Badge>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {pendingBookings.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">No pending customer bookings.</p>
            ) : (
              pendingBookings.map((bk) => {
                const isSelected = selectedBookingId === bk.id;

                return (
                  <div
                    key={bk.id}
                    onClick={() => {
                      setSelectedBookingId(bk.id);
                      if (vehicles[0]) setSelectedVehicleId(vehicles[0].id);
                      if (drivers[0]) setSelectedDriverId(drivers[0].id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/40'
                        : 'border-slate-800 bg-[#0f172a]/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{bk.bookingCode}</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatCurrency(bk.estimatedAmount)}</span>
                    </div>

                    <p className="font-medium text-slate-200">{bk.customerName}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{bk.pickupLocation} ➔ {bk.dropoffLocation}</p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                      <span>Pickup: {bk.scheduledPickupTime}</span>
                      <span className="capitalize text-blue-400 font-medium">{bk.vertical.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Column 2: Vehicle & Driver Matching Dock */}
        <Card className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                Dispatch Assignment Dock
              </h3>
              <p className="text-[11px] text-slate-400">Bind available vehicle asset and qualified CDL operator</p>
            </div>
            {activeBooking && (
              <Badge variant="info">Booking {activeBooking.bookingCode} Active</Badge>
            )}
          </div>

          {!activeBooking ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Truck className="h-10 w-10 mx-auto text-slate-600 mb-2" />
              <p className="font-medium text-slate-400">Select an unassigned booking from the left queue to begin dispatch.</p>
            </div>
          ) : (
            <div className="space-y-5 text-xs">
              {/* Selected Booking Summary Card */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-white">{activeBooking.customerName}</span>
                    <p className="text-slate-400 text-xs mt-0.5">{activeBooking.cargoDescription}</p>
                    <p className="text-blue-300 text-xs mt-1">
                      {activeBooking.pickupLocation} ➔ {activeBooking.dropoffLocation}
                    </p>
                  </div>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {formatCurrency(activeBooking.estimatedAmount)}
                  </span>
                </div>
              </div>

              {/* Vehicle Selection Box */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">Select Available Linehaul Vehicle</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => {
                    const isPicked = selectedVehicleId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isPicked
                            ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/40'
                            : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-white font-mono">{v.registrationNumber}</span>
                          <span className="block text-[11px] text-slate-400">{v.make} {v.model}</span>
                        </div>
                        <Badge variant="success" size="sm">Available</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Driver Selection Box */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">Select Qualified Commercial Driver</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {drivers.map((d) => {
                    const isPicked = selectedDriverId === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDriverId(d.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isPicked
                            ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/40'
                            : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={d.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80'}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-white">{d.firstName} {d.lastName}</span>
                            <span className="block text-[10px] text-slate-400">{d.licenseType}</span>
                          </div>
                        </div>
                        <span className="text-emerald-400 font-mono font-semibold">{d.safetyScore}/100</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final Dispatch Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => dispatchMutation.mutate()}
                  isLoading={dispatchMutation.isPending}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Confirm & Dispatch Trip
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
