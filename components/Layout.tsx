
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const getNavLinks = () => {
    switch (user.role) {
      case UserRole.ADVOCATE:
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Search Similar Cases', path: '/search' },
          { name: 'E-File New Case', path: '/new-case' },
        ];
      case UserRole.REGISTRY:
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Search Similar Cases', path: '/search' },
          { name: 'Register Case', path: '/new-case' },
        ];
      case UserRole.JUDGE:
        return [
          { name: 'Court Dashboard', path: '/dashboard' },
          { name: 'Search Similar Cases', path: '/search' },
          { name: 'Judicial Hearings', path: '/hearings' },
        ];
      case UserRole.LITIGANT:
        return [
          { name: 'My Legal Portal', path: '/dashboard' },
          { name: 'Search Similar Case', path: '/search' },
        ];
      case UserRole.ADMIN:
        return [
          { name: 'System Admin', path: '/dashboard' },
          { name: 'Search Similar Case', path: '/search' },
        ];
      default:
        return [{ name: 'Dashboard', path: '/dashboard' }];
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-black tracking-[0.3em] leading-none uppercase">LEGALAI</span>
               <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1">Judicial Operations</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorized User</span>
              <span className="font-black text-blue-400 uppercase tracking-widest">{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition active:scale-95 ring-offset-2 hover:ring-2 hover:ring-rose-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <aside className="w-72 mr-12 hidden md:block">
          <div className="sticky top-32">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 ml-4">Command Centre</p>
            <nav className="space-y-3">
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    location.pathname === link.path
                      ? 'bg-slate-900 text-white shadow-2xl translate-x-2'
                      : 'text-slate-500 hover:bg-white hover:shadow-xl hover:text-slate-900'
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
