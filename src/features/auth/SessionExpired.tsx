import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Clock, ArrowRight } from 'lucide-react';

export const SessionExpired: React.FC = () => {
  return (
    <div className="text-center w-full">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
        <Clock className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">Session Expired</h2>
      <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
        Your security token has expired after an extended period of inactivity. Please log back in to renew your authenticated credentials.
      </p>
      <div className="mt-6">
        <Link to="/auth/login">
          <Button size="md" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Sign In Again
          </Button>
        </Link>
      </div>
    </div>
  );
};
