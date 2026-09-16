import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  const renderIcon = (icon?: React.ReactNode | React.ComponentType<{ className?: string }>) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && '$$typeof' in (icon as any))) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        variant === 'underline'
          ? 'flex border-b border-slate-800 gap-6 overflow-x-auto no-scrollbar'
          : 'flex p-1 bg-slate-900/80 rounded-lg border border-slate-800 gap-1 overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {renderIcon(tab.icon)}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 pb-3 pt-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              isActive
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {renderIcon(tab.icon)}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
