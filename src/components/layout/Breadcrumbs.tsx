import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-400">
      <Link
        to={pathnames[0] === 'platform' ? '/platform/dashboard' : '/app/dashboard'}
        className="flex items-center hover:text-slate-200 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = name
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-blue-400 truncate max-w-[180px]">
                {formattedName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-slate-200 transition-colors capitalize truncate max-w-[120px]"
              >
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
