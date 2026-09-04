import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, Calendar, FastForward, RotateCcw, PlusCircle, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onReset: () => void;
  onOpenSandbox: () => void;
  onOpenGuidedTour: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onReset,
  onOpenSandbox,
  onOpenGuidedTour,
  isDarkMode,
  onToggleTheme
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleAdvanceDays = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    onDateChange(dateStr);
  };

  return (
    <header className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-3 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Search Bar with CMD+K */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search invoices, customers or commitments..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-12 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
          />
          <div className="absolute right-3 top-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-400 shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Center: Date Machine Simulator Controls */}
        <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Simulated Date: <strong className="text-slate-900 dark:text-white font-bold">{currentDate}</strong></span>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-300 dark:bg-slate-800 mx-1"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAdvanceDays(1)}
              className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md transition text-[10px] font-semibold cursor-pointer"
              title="Advance simulated date by 1 day"
            >
              <FastForward className="w-3 h-3 text-blue-500" />
              <span>+1d</span>
            </button>
            <button
              onClick={() => handleAdvanceDays(3)}
              className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md transition text-[10px] font-semibold cursor-pointer"
              title="Advance simulated date by 3 days"
            >
              <FastForward className="w-3 h-3 text-blue-500" />
              <span>+3d</span>
            </button>
            <button
              onClick={onReset}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition cursor-pointer"
              title="Reset simulation date"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Actions, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGuidedTour}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Tour</span>
          </button>

          <button
            onClick={onOpenSandbox}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Promise</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
              12
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
              AM
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Arjun Mehta</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Finance Manager</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

