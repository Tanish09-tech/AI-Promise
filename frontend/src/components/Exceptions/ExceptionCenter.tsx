import React from 'react';
import { ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';
import { CommitEngine } from '../../services/engine';

interface ExceptionCenterProps {
  engine: CommitEngine;
  onRefresh: () => void;
}

export const ExceptionCenter: React.FC<ExceptionCenterProps> = ({ engine, onRefresh }) => {
  const unresolvedExceptions = engine.exceptions.filter(e => e.status === 'NEEDS_REVIEW');

  const handleResolveException = (excId: string) => {
    const exc = engine.exceptions.find(e => e.id === excId);
    if (exc) {
      exc.status = 'RESOLVED';
      engine.addAuditLog('COMMITMENT', excId, 'EXCEPTION_RESOLVED_MANUAL', 'NEEDS_REVIEW', 'RESOLVED', 'RESOLVE', 'AR Manager manually reviewed and resolved exception.');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            AR Review Queue &amp; Exceptions
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
            Cases where COMMIT refused auto-scheduling due to date or amount ambiguity
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-xl text-xs font-mono font-bold shadow-xs">
          {unresolvedExceptions.length} Case(s) Require AR Review
        </span>
      </div>

      <div className="commit-card p-6 border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Refusal Guardrail: Abstention Over Hallucination
          </h3>
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          Standard generic AI collection bots hallucinate financial dates when given vague inputs like <em className="text-rose-900 dark:text-rose-300 font-mono font-bold bg-rose-200/60 dark:bg-rose-900/40 px-1.5 py-0.5 rounded">"I'll pay half sometime next week"</em>. COMMIT implements a strict <strong className="text-slate-900 dark:text-white font-bold">Ambiguity Guardrail</strong>. If a date or amount cannot be confirmed with &ge; 85% confidence, auto-scheduling is refused and routed to this queue.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Unresolved Review Queue
        </h3>

        {unresolvedExceptions.length === 0 ? (
          <div className="commit-card p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review Queue Empty</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">All customer responses met strict deterministic validation criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unresolvedExceptions.map(exc => {
              const inv = engine.invoices.find(i => i.id === exc.invoice_id);
              return (
                <div key={exc.id} className="commit-card p-5 border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">{exc.id}</span>
                      <span className="text-xs text-slate-800 dark:text-slate-300 font-mono font-bold">• Invoice: {exc.invoice_id} ({inv?.customer_name})</span>
                    </div>

                    <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-md">
                      {exc.exception_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-xl border border-slate-800 space-y-1.5 shadow-xs">
                      <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Raw Customer Message</div>
                      <p className="text-slate-100 italic font-mono font-semibold text-xs leading-relaxed">"{exc.raw_message}"</p>
                    </div>

                    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-1.5 shadow-xs">
                      <div className="text-[10px] font-mono text-rose-800 dark:text-rose-400 uppercase font-bold tracking-wider">Refusal Rationale</div>
                      <p className="text-rose-950 dark:text-rose-200 font-semibold text-xs leading-relaxed">{exc.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-bold">Status: <span className="text-amber-600 dark:text-amber-400">NEEDS_REVIEW</span></span>
                    <button
                      onClick={() => handleResolveException(exc.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-xs"
                    >
                      <UserCheck className="w-4 h-4 text-white" />
                      <span>Manually Clarify &amp; Resolve Case</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

