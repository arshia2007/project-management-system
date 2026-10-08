import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, FileText, Smartphone } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-sm shadow-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Resources
          </div>
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Swagger API Docs</span>
          </a>
        </div>

        {/* Sync notification card */}
        <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-sky-300">Web & Mobile Synced</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All updates synchronize in real-time with the Expo mobile app and SQLite/PostgreSQL database.
          </p>
        </div>
      </aside>
    </>
  );
};
