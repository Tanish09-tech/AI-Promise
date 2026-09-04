import React from 'react';
import { LayoutDashboard, FileText, ShieldCheck, AlertCircle, Clock, Users, BarChart3, Settings, ArrowRight, Sparkles } from 'lucide-react';

export type TabType = 'dashboard' | 'invoices' | 'commitments' | 'decision_center' | 'decision_engine' | 'exceptions' | 'audit' | 'customers' | 'reports' | 'settings' | 'inbox' | 'batch_eval';


interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  counts: {
    invoices: number;
    commitments: number;
    broken: number;
    exceptions: number;
    audit: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, counts }) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'decision_center',
      label: 'Decision Center',
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      id: 'exceptions',
      label: 'Exceptions',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: counts.exceptions || 8,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d1322] text-slate-300 p-4 flex flex-col justify-between shrink-0 md:min-h-screen border-b md:border-b-0 md:border-r border-slate-800/60 font-sans select-none">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-900/40">
              C
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d1322]"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-wider text-white font-mono">COMMIT</h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              AI Promise-to-Payment Recovery Agent
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/60 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards Area */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {/* Today's Summary Card */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 border border-slate-800/90 text-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-300 font-mono tracking-wide">Today's Summary</div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Actions Executed</span>
              <span className="font-bold text-white font-mono">24</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Reminders Sent</span>
              <span className="font-bold text-white font-mono">18</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Escalations</span>
              <span className="font-bold text-white font-mono">2</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Payments Received</span>
              <span className="font-bold text-emerald-400 font-mono">₹2,45,000</span>
            </div>
          </div>
        </div>

        {/* Promo Upgrade Banner Card */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 text-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4 fill-indigo-400/30" />
            </div>
          </div>
          <div>
            <div className="font-bold text-white text-xs">Recover more with COMMIT</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Turn promises into payments with AI-driven intelligence.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('reports')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-[11px] rounded-lg transition cursor-pointer shadow-md shadow-indigo-950/50"
          >
            <span>View Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

