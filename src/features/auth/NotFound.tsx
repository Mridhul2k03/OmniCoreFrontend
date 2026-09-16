import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#0b0f17] text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20 shadow-xl">
        <Compass className="h-8 w-8 animate-spin-slow" />
      </div>
      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-400">
        404 Not Found
      </span>
      <h1 className="mt-2 text-3xl font-extrabold text-white">Route Off-Grid</h1>
      <p className="mt-2 max-w-md text-xs text-slate-400 leading-relaxed">
        The requested screen or resource waypoint does not exist in the OmniCore logistics ecosystem.
      </p>
      <div className="mt-6">
        <Link to="/app/dashboard">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Return to Fleet Hub
          </Button>
        </Link>
      </div>
    </div>
  );
};
