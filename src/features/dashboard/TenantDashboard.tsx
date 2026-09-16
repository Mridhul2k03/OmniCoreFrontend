import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import {
  Truck,
  Navigation,
  DollarSign,
  AlertTriangle,
  Users,
  Wrench,
  Boxes,
  Clock,
  ShieldCheck,
  Fuel,
  Receipt,
  FileText,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Snowflake,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

export const TenantDashboard: React.FC = () => {
  const { tenant, packageTier, enabledAddons, can } = useTenant();
  const [dateRange, setDateRange] = useState('7d');

  // Chart data
  const tripTrendData = [
    { day: 'Mon', completed: 18, active: 6, delayed: 1 },
    { day: 'Tue', completed: 22, active: 8, delayed: 0 },
    { day: 'Wed', completed: 24, active: 9, delayed: 2 },
    { day: 'Thu', completed: 29, active: 11, delayed: 1 },
    { day: 'Fri', completed: 34, active: 14, delayed: 1 },
    { day: 'Sat', completed: 21, active: 7, delayed: 0 },
    { day: 'Sun', completed: 16, active: 4, delayed: 0 },
  ];

  const financialTrend = [
    { date: 'Sep 10', revenue: 14200, fuel: 3200, tolls: 450 },
    { date: 'Sep 11', revenue: 18900, fuel: 3800, tolls: 620 },
    { date: 'Sep 12', revenue: 22400, fuel: 4100, tolls: 780 },
    { date: 'Sep 13', revenue: 21000, fuel: 3900, tolls: 710 },
    { date: 'Sep 14', revenue: 26500, fuel: 4800, tolls: 890 },
    { date: 'Sep 15', revenue: 19800, fuel: 3600, tolls: 590 },
    { date: 'Sep 16', revenue: 24100, fuel: 4300, tolls: 740 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Fleet Operations Hub</h1>
            <Badge variant="glow">{tenant.name}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, trip dispatch orchestration, vehicle status, and financial performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Action Shortcuts */}
          <Link to="/app/trips">
            <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              New Dispatch
            </Button>
          </Link>
          <Link to="/app/fleet">
            <Button size="sm" variant="outline" leftIcon={<Truck className="h-4 w-4" />}>
              Add Vehicle
            </Button>
          </Link>
          {can('finance.view') && (
            <Link to="/app/finance">
              <Button size="sm" variant="outline" leftIcon={<Receipt className="h-4 w-4" />}>
                Record Expense
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Critical Operational Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-amber-500/20 p-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-200">2 Documents Expiring Within 15 Days</p>
              <p className="text-amber-300/80 text-[11px]">Volvo FH16 (IL-9428-TX) insurance & Sanjay Patel CDL renewal</p>
            </div>
          </div>
          <Link to="/app/fleet" className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 shrink-0 underline">
            Resolve
          </Link>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full bg-cyan-500/20 p-2 text-cyan-400">
              <Snowflake className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-cyan-200">Reefer Telemetry: Active Cold-Chain Transit</p>
              <p className="text-cyan-300/80 text-[11px]">2 Pharma reefers maintaining -19.4°C & 3.8°C compliant</p>
            </div>
          </div>
          <Link to="/app/trips" className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 shrink-0 underline">
            Telemetry
          </Link>
        </div>
      </div>

      {/* 15 Primary Operations & Finance Widgets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Row 1: Fleet & Trips */}
        <StatCard
          title="Active In-Transit"
          value="24 Trips"
          subtitle="92% on schedule"
          icon={<Navigation className="h-4 w-4" />}
          accentColor="blue"
          trend={{ value: 14, direction: 'up' }}
        />

        <StatCard
          title="Available Fleet"
          value="41 Units"
          subtitle={`${tenant.vehicleCount} total registered`}
          icon={<Truck className="h-4 w-4" />}
          accentColor="emerald"
        />

        <StatCard
          title="Fleet Utilization"
          value="78.4%"
          subtitle="Target: >75%"
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="cyan"
          trend={{ value: 3.2, direction: 'up' }}
        />

        <StatCard
          title="Active Drivers"
          value="38 Drivers"
          subtitle="4 on rest break"
          icon={<Users className="h-4 w-4" />}
          accentColor="purple"
        />

        <StatCard
          title="Maintenance Due"
          value="3 Work Orders"
          subtitle="1 turbo overhaul"
          icon={<Wrench className="h-4 w-4" />}
          accentColor="amber"
        />

        {/* Row 2: Finance & Inventory */}
        {can('finance.view') && (
          <StatCard
            title="Revenue (Month)"
            value={formatCurrency(486500)}
            subtitle="Collections: 53%"
            icon={<DollarSign className="h-4 w-4" />}
            accentColor="emerald"
            trend={{ value: 18.2, direction: 'up' }}
          />
        )}

        {can('finance.view') && (
          <StatCard
            title="Fuel & Toll Spend"
            value={formatCurrency(91000)}
            subtitle="Avg $0.44/km"
            icon={<Fuel className="h-4 w-4" />}
            accentColor="rose"
            trend={{ value: 2.1, direction: 'down' }}
          />
        )}

        {can('finance.view') && (
          <StatCard
            title="Overdue Invoices"
            value={formatCurrency(73872)}
            subtitle="Target DC (1 day)"
            icon={<Receipt className="h-4 w-4" />}
            accentColor="amber"
          />
        )}

        <StatCard
          title="Low Stock Spares"
          value="2 SKUs"
          subtitle="Heavy tyres & brake pads"
          icon={<Boxes className="h-4 w-4" />}
          accentColor="rose"
        />

        <StatCard
          title="Contract SLA Rate"
          value="99.4%"
          subtitle="Commitment: 99.0%"
          icon={<FileText className="h-4 w-4" />}
          accentColor="blue"
        />
      </div>

      {/* Main Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Volume chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Dispatch Volume & Trip Velocity</h3>
              <p className="text-xs text-slate-400">Completed linehaul vs active in-transit loads</p>
            </div>
            <Badge variant="outline">Past 7 Days</Badge>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed Trips" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" fill="#06b6d4" name="Active Dispatches" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Trajectory or Fleet Readiness */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue & Operating Burn</h3>
              <p className="text-xs text-slate-400">Gross earnings vs fuel/tolls</p>
            </div>
            <Badge variant="success">Positive Margin</Badge>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revGrad)" name="Revenue ($)" />
                <Area type="monotone" dataKey="fuel" stroke="#ef4444" fill="none" name="Fuel Burn ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Live Dispatches & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Live Dispatched Hauls</h3>
            </div>
            <Link to="/app/trips" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Dispatch Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 mt-2">
            <div className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">TRP-2026-8801</span>
                  <Badge variant="glow">Cold Chain Reefer</Badge>
                  <span className="text-[10px] text-cyan-400 font-mono">-19.4°C</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Abbott Park, IL ➔ St. Louis, MO (Carlos Mendoza)</p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold">$4,100</span>
                <span className="text-[10px] text-slate-500 block">ETA: 14:00 Today</span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">TRP-2026-8802</span>
                  <Badge variant="glow">Cold Chain Reefer</Badge>
                  <span className="text-[10px] text-cyan-400 font-mono">+3.8°C</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Indianapolis, IN ➔ Columbus, OH (Sanjay Patel)</p>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold">$2,950</span>
                <span className="text-[10px] text-slate-500 block">ETA: 13:00 Today</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Upcoming Maintenance & Expiries</h3>
            </div>
            <Link to="/app/maintenance" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Workshop <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 mt-2">
            <div className="py-3 flex items-start justify-between text-xs">
              <div>
                <span className="font-semibold text-white">WO-2026-441: Turbocharger Boost Overhaul</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Mack Anthem (WI-3211-BT) • Milwaukee Bay 4</p>
              </div>
              <Badge variant="warning" dot>In Progress</Badge>
            </div>

            <div className="py-3 flex items-start justify-between text-xs">
              <div>
                <span className="font-semibold text-white">Commercial Insurance Renewal Due</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Volvo FH16 (IL-9428-TX) • Allianz Policy 88219</p>
              </div>
              <span className="text-amber-400 font-medium text-[11px]">15 Days Left</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
