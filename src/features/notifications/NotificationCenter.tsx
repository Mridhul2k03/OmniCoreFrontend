import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { NotificationType } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'critical') return n.severity === 'critical' || n.severity === 'high';
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="danger" dot>Critical Severity</Badge>;
      case 'high':
        return <Badge variant="warning" dot>High Priority</Badge>;
      default:
        return <Badge variant="info">Standard</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Mission Control Notification Center</h1>
            {unreadCount > 0 && (
              <Badge variant="glow">{unreadCount} Actionable</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time regulatory alerts, driver license expiries, low parts triggers, and dispatch warnings.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CheckCheck className="h-4 w-4" />}
            onClick={markAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            filterType === 'unread'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterType('critical')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
            filterType === 'critical'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Critical & High Severity
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            <Bell className="h-8 w-8 mx-auto text-slate-600 mb-2" />
            <p>No alerts matching this filter.</p>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.isRead ? 'border-blue-500/40 bg-blue-950/20' : 'bg-[#141c2e]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  {getSeverityBadge(item.severity)}
                  <span className="text-[11px] text-slate-500 font-mono">• {item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{item.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(item.id)}
                  >
                    Mark Read
                  </Button>
                )}
                {item.linkUrl && (
                  <Link to={item.linkUrl}>
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Action
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
