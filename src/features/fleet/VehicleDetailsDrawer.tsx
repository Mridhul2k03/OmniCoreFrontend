import React, { useState } from 'react';
import { Drawer } from '../../components/common/Drawer';
import { Tabs } from '../../components/common/Tabs';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Vehicle, VehicleDocument } from '../../types';
import {
  Truck,
  FileCheck,
  UserCheck,
  Navigation,
  Wrench,
  Fuel,
  History,
  AlertTriangle,
  Radio,
  Clock,
  Gauge,
  Snowflake,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export interface VehicleDetailsDrawerProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleDetailsDrawer: React.FC<VehicleDetailsDrawerProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!vehicle) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Truck className="h-3.5 w-3.5" /> },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileCheck className="h-3.5 w-3.5" />,
      count: vehicle.documents.length,
    },
    { id: 'assignments', label: 'Driver Assignment', icon: <UserCheck className="h-3.5 w-3.5" /> },
    { id: 'trips', label: 'Trips', icon: <Navigation className="h-3.5 w-3.5" />, count: vehicle.totalTripsCount },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="h-3.5 w-3.5" /> },
    { id: 'fuel', label: 'Fuel & Telematics', icon: <Fuel className="h-3.5 w-3.5" /> },
    { id: 'history', label: 'Audit Log', icon: <History className="h-3.5 w-3.5" /> },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${vehicle.registrationNumber} • ${vehicle.make} ${vehicle.model}`}
      subtitle={`VIN: ${vehicle.vin} • Vertical: ${vehicle.vertical.replace('_', ' ').toUpperCase()}`}
      width="xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5 text-xs">
            {/* Telemetry quick bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
                <span className="text-slate-400 block text-[11px]">Vehicle Status</span>
                <Badge
                  variant={
                    vehicle.status === 'available'
                      ? 'success'
                      : vehicle.status === 'on_trip'
                      ? 'info'
                      : vehicle.status === 'maintenance'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                  className="mt-1 capitalize"
                >
                  {vehicle.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
                <span className="text-slate-400 block text-[11px]">Odometer Reading</span>
                <span className="text-base font-bold text-white font-mono mt-0.5 block">
                  {vehicle.odometerKm.toLocaleString()} km
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
                <span className="text-slate-400 block text-[11px]">Fuel Level</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                  {vehicle.fuelLevelPercent}%
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
                <span className="text-slate-400 block text-[11px]">Payload Capacity</span>
                <span className="text-base font-bold text-slate-200 mt-0.5 block">
                  {(vehicle.capacityKg ? vehicle.capacityKg / 1000 : 25)} Tons
                </span>
              </div>
            </div>

            {/* Cold Chain Reefer Sensor if available */}
            {vehicle.temperatureSensor && (
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <div>
                      <h4 className="font-semibold text-white">Live Reefer Telemetry (Pharma Grade)</h4>
                      <p className="text-[11px] text-slate-400">Continuous sensor ping via Iridium dual-satellite</p>
                    </div>
                  </div>
                  <Badge variant="glow">Sensor Online</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-cyan-900/40">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CURRENT TEMPERATURE</span>
                    <span className="text-xl font-bold font-mono text-cyan-300">
                      {vehicle.temperatureSensor.currentTempC}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SETPOINT TARGET</span>
                    <span className="text-xl font-bold font-mono text-slate-300">
                      {vehicle.temperatureSensor.targetTempC}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CARGO HUMIDITY</span>
                    <span className="text-xl font-bold font-mono text-slate-300">
                      {vehicle.temperatureSensor.humidityPercent}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live GPS Telematics Box */}
            {vehicle.currentLocation && (
              <div className="rounded-xl border border-slate-800 bg-[#141c2e] p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">Live Geolocation Feed</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Pinged {vehicle.currentLocation.lastUpdated}</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-200">{vehicle.currentLocation.address}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Lat: {vehicle.currentLocation.lat.toFixed(4)}, Lng: {vehicle.currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-blue-400">{vehicle.currentLocation.speedKmh}</span>
                    <span className="text-[10px] text-slate-400 block">KM/H Speed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Documents & Expiry Warnings */}
        {activeTab === 'documents' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300">Statutory & Regulatory Documents</span>
              <Button size="sm" variant="outline">
                Upload Document
              </Button>
            </div>

            {vehicle.documents.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No documents uploaded for this asset.</p>
            ) : (
              vehicle.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg border border-slate-800 bg-[#141c2e] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">
                        {doc.type.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono">
                        {doc.documentNumber}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Issued: {formatDate(doc.issueDate)}</span>
                      <span>•</span>
                      <span>Expires: {formatDate(doc.expiryDate)}</span>
                    </div>
                  </div>

                  <div>
                    {doc.isExpired ? (
                      <Badge variant="danger" dot>Expired Document</Badge>
                    ) : doc.isExpiringSoon ? (
                      <Badge variant="warning" dot>Expiring in &lt; 30 Days</Badge>
                    ) : (
                      <Badge variant="success">Verified Valid</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-[#141c2e] p-4">
              <span className="text-slate-400 block text-[11px]">Assigned Linehaul Driver</span>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    {vehicle.assignedDriverName ? vehicle.assignedDriverName.substring(0, 2) : 'NA'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {vehicle.assignedDriverName || 'Unassigned / Available for Roster'}
                    </h4>
                    <span className="text-slate-400 text-[11px]">Primary Operator</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Reassign Driver
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Trips */}
        {activeTab === 'trips' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-400">Recent completed linehaul voyages and assigned manifests.</p>
            <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-white block">TRP-2026-8801</span>
                  <span className="text-slate-400 text-[11px]">Abbott Park, IL ➔ St. Louis, MO</span>
                </div>
                <Badge variant="info">In Transit</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Next Service Interval: {vehicle.nextServiceKm ? `${vehicle.nextServiceKm.toLocaleString()} km` : 'Scheduled'}</span>
              <Button size="sm" variant="outline">Log Service</Button>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-white">80,000 km Scheduled Service</span>
                <span className="text-emerald-400 font-bold">$400</span>
              </div>
              <p className="text-slate-400 text-[11px]">Refrigerant R-452A recharged, compressor belt replaced.</p>
            </div>
          </div>
        )}

        {/* Tab 6: Fuel & Telematics */}
        {activeTab === 'fuel' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
                <span className="text-slate-400 block text-[11px]">Fuel Type</span>
                <span className="font-bold text-white uppercase text-sm mt-0.5 block">{vehicle.fuelType}</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#141c2e] p-3">
                <span className="text-slate-400 block text-[11px]">Average Consumption</span>
                <span className="font-bold text-white text-sm mt-0.5 block">29.4 L / 100 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: History */}
        {activeTab === 'history' && (
          <div className="space-y-2 text-xs">
            <p className="text-slate-400 text-[11px]">System registration created on 2024-03-15 by Fleet Administrator.</p>
          </div>
        )}
      </div>
    </Drawer>
  );
};
