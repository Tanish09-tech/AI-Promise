import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { CommitEngine } from '../../services/engine';

interface AuditViewerProps {
  engine: CommitEngine;
}

export const AuditViewer: React.FC<AuditViewerProps> = ({ engine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const logs = engine.auditLogs.filter(log => {
    const matchesSearch = log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEntity = entityFilter === 'ALL' || log.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Activity & Audit History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Explainable sequence of all financial, commitment, and policy engine decisions</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit log..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
            />
          </div>

          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Entities</option>
            <option value="COMMITMENT">Commitment Events</option>
            <option value="PAYMENT">Payment Events</option>
            <option value="RECOVERY_ACTION">Recovery Actions</option>
            <option value="MESSAGE">Message Events</option>
          </select>
        </div>
      </div>

      <div className="commit-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800 pb-3 font-semibold">
          <span>{logs.length} Total Audit Records</span>
          <span>Policy Engine v1.0</span>
        </div>

        <div className="space-y-3">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 hover:border-slate-300 dark:hover:bg-slate-800/80 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600 dark:text-indigo-400">{log.timestamp}</span>
                  <span className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded font-bold border border-slate-300 dark:border-slate-700">
                    {log.entity_type}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">#{log.entity_id}</span>
                </div>

                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">{log.event_type}</span>
              </div>

              {(log.previous_state || log.new_state) && (
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">State Transition:</span>
                  <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded font-semibold">{log.previous_state || 'N/A'}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-indigo-500/20 text-blue-800 dark:text-indigo-300 rounded font-bold border border-blue-200 dark:border-indigo-500/30">{log.new_state}</span>
                </div>
              )}

              {log.reason && (
                <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed font-mono text-[11px]">
                  {log.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

