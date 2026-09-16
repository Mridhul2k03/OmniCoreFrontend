import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../common/Button';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-800 bg-[#0f172a]/40',
        className
      )}
    >
      <div className="rounded-full bg-slate-800/80 p-3.5 text-slate-400 mb-3.5">
        {icon || <PackageOpen className="h-7 w-7" />}
      </div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
