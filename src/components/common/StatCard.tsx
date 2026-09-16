import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: {
    value: number; // percentage
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  accentColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  change,
  changeType = 'neutral',
  trend,
  accentColor = 'blue',
  className,
  onClick,
}) => {
  const accentClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && '$$typeof' in (icon as any))
    ) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="h-5 w-5" />;
    }
    return null;
  };

  return (
    <Card
      hoverable={Boolean(onClick)}
      className={cn('relative overflow-hidden cursor-default', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('rounded-lg border p-2.5 shrink-0', accentClasses[accentColor])}>
            {renderIcon()}
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-800/60 text-xs">
          <span
            className={cn(
              'font-medium',
              changeType === 'positive' && 'text-emerald-400',
              changeType === 'negative' && 'text-rose-400',
              changeType === 'neutral' && 'text-slate-400'
            )}
          >
            {change}
          </span>
        </div>
      )}

      {trend && !change && (
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-800/60 text-xs">
          {trend.direction === 'up' && (
            <span className="flex items-center gap-0.5 font-medium text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              +{trend.value}%
            </span>
          )}
          {trend.direction === 'down' && (
            <span className="flex items-center gap-0.5 font-medium text-rose-400">
              <TrendingDown className="h-3.5 w-3.5" />
              -{trend.value}%
            </span>
          )}
          {trend.direction === 'neutral' && (
            <span className="flex items-center gap-0.5 font-medium text-slate-400">
              <Minus className="h-3.5 w-3.5" />
              {trend.value}%
            </span>
          )}
          <span className="text-slate-500">{trend.label || 'vs last month'}</span>
        </div>
      )}
    </Card>
  );
};
