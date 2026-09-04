import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { CommitEngine } from '../../services/engine';

interface CommitmentTrackerProps {
  engine: CommitEngine;
  onRefresh: () => void;
}

export const CommitmentTracker: React.FC<CommitmentTrackerProps> = ({ engine }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredCommitments = engine.commitments.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payment Schedules & Commitments</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Structured financial schedules parsed from unstructured customer promises</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All States</option>
            <option value="ACTIVE">ACTIVE (Pending Deadline)</option>
            <option value="FULFILLED">FULFILLED (Paid)</option>
            <option value="PARTIALLY_FULFILLED">PARTIALLY FULFILLED</option>
            <option value="BROKEN">BROKEN (Deadline Expired)</option>
          </select>
        </div>
      </div>

      {/* State Machine Visual Banner */}
      <div className="commit-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-indigo-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Commitment Lifecycle States</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold font-mono">Deterministic transitions strictly governed by bank payment & deadline events</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-300 font-mono">1. CREATED</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">LLM proposal</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-indigo-500/10 rounded-xl border border-blue-200 dark:border-indigo-500/30 space-y-1">
            <div className="font-bold text-blue-700 dark:text-indigo-300 font-mono">2. ACTIVE</div>
            <div className="text-[10px] text-blue-600 dark:text-indigo-400 font-medium">Valid date & amount</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30 space-y-1">
            <div className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">3. FULFILLED</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Bank deposit verified</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30 space-y-1">
            <div className="font-bold text-amber-700 dark:text-amber-300 font-mono">4. BROKEN</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Deadline passed</div>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
            <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">5. ACTION</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Rule execution</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommitments.map(c => {
          const inv = engine.invoices.find(i => i.id === c.invoice_id);
          return (
            <div
              key={c.id}
              className={`commit-card p-5 space-y-4 border ${
                c.status === 'BROKEN'
                  ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/30 dark:bg-amber-500/5'
                  : c.status === 'FULFILLED'
                  ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-indigo-400">{c.id}</span>
                  {c.part_index && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold border border-slate-200 dark:border-slate-700">
                      Part {c.part_index}/{c.total_parts}
                    </span>
                  )}
                </div>

                <span
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-mono border ${
                    c.status === 'FULFILLED'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : c.status === 'PARTIALLY_FULFILLED'
                      ? 'bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 border-blue-200 dark:border-indigo-500/30'
                      : c.status === 'BROKEN'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                      : 'bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 border-blue-200 dark:border-indigo-500/30'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Promised Amount</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    ₹{c.promised_amount.toLocaleString()}
                  </div>
                  {c.remaining_amount !== c.promised_amount && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 font-bold">
                      ₹{c.remaining_amount.toLocaleString()} unpaid
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Contract Deadline</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-indigo-400 font-mono mt-0.5">
                    {c.deadline}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {(c.confidence * 100).toFixed(0)}% AI confidence
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Customer Context</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{inv?.customer_name || c.invoice_id}</span>
                  <span className="text-slate-500 font-mono text-[11px]">({c.invoice_id})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic font-mono text-[11px] bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  "{c.source_text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                <span>Reminders Sent: {c.reminder_count}/2</span>
                <span>Created: {c.created_at}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

