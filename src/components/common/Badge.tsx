import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'outline'
    | 'glow'
    | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border shrink-0';

  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    outline: 'bg-transparent text-slate-400 border-slate-700',
    glow: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20',
  };

  const dotColors = {
    default: 'bg-slate-400',
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400',
    danger: 'bg-red-400 animate-pulse',
    info: 'bg-blue-400',
    purple: 'bg-purple-400',
    outline: 'bg-slate-400',
    glow: 'bg-cyan-400 animate-ping',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.2 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
