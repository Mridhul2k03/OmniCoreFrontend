import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#0b0f17] text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20 shadow-xl">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-red-400">
        403 Forbidden
      </span>
      <h1 className="mt-2 text-3xl font-extrabold text-white">Access Denied</h1>
      <p className="mt-2 max-w-md text-xs text-slate-400 leading-relaxed">
        Your current user role does not possess the requisite permissions to access this screen. If you believe this is in error, contact your tenant administrator or switch to an authorized role in the top header.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/app/dashboard">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
