import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PACKAGES, ADDONS, VERTICALS } from '../../config/constants';
import { Check, Plus, Package as PackageIcon, Layers, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const PackageManagement: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Packages, Add-ons & Feature Entitlements</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure multi-tenant SaaS tiers, feature-to-package entitlement matrix, and specialized domain add-ons.
        </p>
      </div>

      {/* Packages Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <PackageIcon className="h-5 w-5 text-blue-400" />
            Core Subscription Tiers
          </h2>
          <Button size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />}>
            Create New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(PACKAGES).map((pkg) => (
            <Card key={pkg.id} className="flex flex-col justify-between relative overflow-hidden">
              {pkg.id === 'enterprise' && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase">
                  Flagship
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{pkg.id}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{pkg.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{pkg.tagline}</p>

                <div className="my-4 pb-3 border-b border-slate-800">
                  <span className="text-3xl font-black text-white">{formatCurrency(pkg.monthlyPrice)}</span>
                  <span className="text-xs text-slate-400"> /mo</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    {formatCurrency(pkg.annualPrice)} /year prepaid
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Fleet Capacity:</span>
                    <span className="font-bold text-white">{pkg.maxVehicles} Units</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">User Seats:</span>
                    <span className="font-bold text-white">{pkg.maxUsers} Users</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Included Modules:
                    </span>
                    {pkg.coreFeatures.map((feat) => (
                      <div key={feat} className="flex items-start gap-1.5 text-slate-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Active</span>
                <Button size="sm" variant="outline">
                  Edit Plan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add-ons Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            Specialized Domain Add-ons
          </h2>
          <Button size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />}>
            Create Add-on
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADDONS.map((addon) => (
            <Card key={addon.key} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">{addon.name}</h4>
                  <Badge variant="outline" size="sm" className="mt-1">
                    {addon.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    +${addon.monthlyPrice}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/month</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{addon.description}</p>

              {addon.requiredForVerticals && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="text-amber-400 font-medium">Auto-bundled for:</span>
                  {addon.requiredForVerticals.map((v) => (
                    <span key={v} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                      {v.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
