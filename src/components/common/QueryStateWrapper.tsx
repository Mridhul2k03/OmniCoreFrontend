import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertCircle, RefreshCw, Inbox, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface QueryStateWrapperProps {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null | unknown;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  onRetry?: () => void;
  loadingMessage?: string;
  skeletonCount?: number;
  skeletonHeight?: string;
  children: React.ReactNode;
  className?: string;
}

export const QueryStateWrapper: React.FC<QueryStateWrapperProps> = ({
  isLoading,
  isError = false,
  error,
  isEmpty = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There is currently no data to display for the selected criteria.',
  emptyAction,
  onRetry,
  loadingMessage = 'Loading data...',
  skeletonCount = 3,
  skeletonHeight = 'h-16',
  children,
  className,
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className={cn('w-full space-y-3', className)}>
        <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-xs font-medium">{loadingMessage}</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'w-full rounded-lg bg-slate-900/60 border border-slate-800 animate-pulse',
                skeletonHeight
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'An error occurred while fetching data from the server.';

    return (
      <Card className={cn('p-6 border-red-500/30 bg-red-500/5 text-center', className)}>
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-white">Failed to Load Content</h4>
        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">{errorMessage}</p>
        {onRetry && (
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="border-red-500/30 hover:bg-red-500/10 text-red-300"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Retry Connection
            </Button>
          </div>
        )}
      </Card>
    );
  }

  // Empty State
  if (isEmpty) {
    return (
      <Card className={cn('p-8 text-center border-dashed border-slate-800 bg-slate-900/30', className)}>
        <div className="inline-flex p-3 rounded-full bg-slate-800/80 text-slate-400 mb-3">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">{emptyTitle}</h4>
        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">{emptyMessage}</p>
        {emptyAction && (
          <div className="mt-4">
            <Button
              size="sm"
              variant="primary"
              onClick={emptyAction.onClick}
              leftIcon={emptyAction.icon}
            >
              {emptyAction.label}
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return <>{children}</>;
};
