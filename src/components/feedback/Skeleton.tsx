import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-800/80',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4 my-1',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
