import React from 'react';
import { ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { CommitEngine } from '../../services/engine';

interface RecoveryMatrixProps {
  engine: CommitEngine;
  onRefresh: () => void;
}

export const RecoveryMatrix: React.FC<RecoveryMatrixProps> = ({ engine, onRefresh }) => {
  const brokenCommitments = engine.commitments.filter(c => c.status === 'BROKEN' || c.status === 'RECOVERY_PENDING');

  const handleExecuteAction = (commitmentId: string) => {
    engine.executeRecoveryAction(commitmentId);
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recovery Rules & Policy Matrix</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Bounded recovery workflows governed by deterministic safety boundaries</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Max Reminder Limit: 2</span>
        </div>
      </div>

      <div className="commit-card p-5 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-indigo-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Deterministic Policy Rules Enforcement</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Condition</th>
                <th className="p-3">Evaluated Action</th>
                <th className="p-3">Policy Check</th>
                <th className="p-3">Execution Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-300 font-medium">
              <tr>
                <td className="p-3 font-semibold">Invoice fully paid / 0 balance</td>
                <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">STOP</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded font-mono text-[10px] font-bold">APPROVED</span></td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Halt all automated outreach immediately</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Ambiguous deadline / low confidence (&lt;85%)</td>
                <td className="p-3 font-mono font-bold text-red-600 dark:text-rose-400">NEEDS_REVIEW</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-red-100 dark:bg-rose-500/20 text-red-700 dark:text-rose-400 border border-red-200 dark:border-rose-500/30 rounded font-mono text-[10px] font-bold">ABSTAIN</span></td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Escalate to AR Review Queue for human review</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Deadline passed + Reminders sent &lt; 2</td>
                <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">SEND_REMINDER</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded font-mono text-[10px] font-bold">APPROVED</span></td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Dispatch payment reminder referencing schedule</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Deadline passed + Reminders sent ≥ 2</td>
                <td className="p-3 font-mono font-bold text-blue-600 dark:text-indigo-400">ESCALATE</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded font-mono text-[10px] font-bold">APPROVED</span></td>
                <td className="p-3 text-slate-500 dark:text-slate-400">Create CRM Escalation Ticket for AR Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Missed Schedules Awaiting Action ({brokenCommitments.length})</span>
        </h3>

        {brokenCommitments.length === 0 ? (
          <div className="commit-card p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Missed Schedules Pending Action</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">All customer promises are active or fulfilled. Advance the top date bar by 3 days to test deadline expirations!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {brokenCommitments.map(c => {
              const evalRes = engine.evaluateRecovery(c.id);
              const inv = engine.invoices.find(i => i.id === c.invoice_id);

              return (
                <div key={c.id} className="commit-card p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{c.id}</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">• {inv?.id} ({inv?.customer_name})</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        Overdue Balance: ₹{c.remaining_amount.toLocaleString()}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold">
                        Deadline Passed: <strong className="text-red-600 dark:text-rose-400">{c.deadline}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">1. Evaluated Facts</div>
                      <div className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex justify-between">
                          <span>Outstanding Balance:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">₹{c.remaining_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Score:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{(c.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prior Reminders Sent:</span>
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{c.reminder_count} / {engine.policy.max_reminders}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">2. Policy Gate Verification</div>
                      <div className="space-y-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confidence &ge; 85% PASSED</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Balance &gt; 0 PASSED</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reminder Limit &lt; 2 PASSED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-indigo-500/10 border border-blue-200 dark:border-indigo-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-blue-700 dark:text-indigo-300">
                        3. Approved Recovery Action
                      </span>
                      <span className="px-3 py-1 bg-blue-600 text-white font-mono font-bold rounded-lg text-xs shadow-2xs">
                        {evalRes.action}
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-[11px] font-semibold">
                      {evalRes.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleExecuteAction(c.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Action ({evalRes.action})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="commit-card p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Executed Recovery Actions History ({engine.actions.length})
        </h3>

        {engine.actions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400 font-medium">No recovery actions executed yet.</div>
        ) : (
          <div className="space-y-2">
            {engine.actions.map(act => (
              <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-blue-600 dark:text-indigo-400">{act.id} • {act.action_type}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{act.status}</span>
                </div>
                {act.simulated_payload && (
                  <p className="text-[11px] text-slate-800 dark:text-slate-300 font-mono bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 font-medium">
                    {act.simulated_payload}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

