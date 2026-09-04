import React, { useState } from 'react';
import { Sparkles, CheckCircle2, FastForward, CreditCard, ShieldCheck, X, Play } from 'lucide-react';
import { CommitEngine } from '../../services/engine';

interface GuidedDemoModalProps {
  engine: CommitEngine;
  onClose: () => void;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({ engine, onClose, onRefresh, onShowToast }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleStep1_IngestPromise = () => {
    engine.processCustomerMessage('INV-1001', "I'll pay ₹30,000 tomorrow (2026-09-04) and remaining ₹20,000 by Friday (2026-09-06).");
    onShowToast('success', 'Commitments Extracted!', 'Created 2 active commitments: ₹30k (Sep 4) & ₹20k (Sep 6).');
    onRefresh();
    setCurrentStep(2);
  };

  const handleStep2_MatchPayment = () => {
    engine.ingestPayment('INV-1001', 30000, 'RTGS-20260904-8831', '2026-09-04');
    onShowToast('success', 'Bank Payment Verified!', '₹30,000 matched against Part 1 (Sep 4). Status: FULFILLED ✓');
    onRefresh();
    setCurrentStep(3);
  };

  const handleStep3_ScrubDeadline = () => {
    engine.setSimulatedDate('2026-09-07');
    onShowToast('warning', 'Deadline Expired!', 'Date advanced to 2026-09-07. Part 2 (Sep 6) status changed to BROKEN ⚠');
    onRefresh();
    setCurrentStep(4);
  };

  const handleStep4_ExecuteRecovery = () => {
    engine.executeRecoveryAction('CMT-1001-B');
    onShowToast('info', 'Recovery Action Dispatched!', 'Policy Gate passed. Executed SEND_REMINDER action.');
    onRefresh();
    setCurrentStep(5);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-950/50">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Product Demo Tour — 60-Second Walkthrough</h3>
              <p className="text-xs text-slate-400 font-medium">Step-by-step interactive demonstration of COMMIT's core recovery loop</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className={`p-2 rounded-xl border font-bold ${currentStep >= 1 ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            1. Promise
          </div>
          <div className={`p-2 rounded-xl border font-bold ${currentStep >= 2 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            2. Payment
          </div>
          <div className={`p-2 rounded-xl border font-bold ${currentStep >= 3 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            3. Breach
          </div>
          <div className={`p-2 rounded-xl border font-bold ${currentStep >= 4 ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            4. Recover
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold">
                <span>STEP 1: Ingest Unstructured Payment Promise</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Customer at Apex Industrial Logistics responds to overdue invoice INV-1001 (₹50,000):
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-white italic font-mono font-medium">
                "I'll pay ₹30,000 tomorrow and the remaining ₹20,000 by Friday."
              </div>
              <button
                onClick={handleStep1_IngestPromise}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-950/50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract Structured Commitments</span>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>STEP 2: Match Verified Bank Payment</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Tomorrow arrives. A bank transfer of ₹30,000 is received with ref RTGS-8831.
              </p>
              <div className="p-3 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/30 font-mono font-semibold">
                ✓ Commitment 1 (₹30,000 due Sep 4) → FULFILLED<br />
                ⏳ Commitment 2 (₹20,000 due Sep 6) → STILL ACTIVE
              </div>
              <button
                onClick={handleStep2_MatchPayment}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/50"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simulate Payment Arrival (₹30,000)</span>
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
                <FastForward className="w-4 h-4" />
                <span>STEP 3: Fast-Forward Timeline Past Deadline</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                Friday passes with no payment. We fast-forward the current date to 2026-09-07.
              </p>
              <div className="p-3 bg-amber-500/10 text-amber-300 rounded-xl border border-amber-500/30 font-mono font-semibold">
                ⚠ Commitment 2 (₹20,000) → DEADLINE EXPIRED → BROKEN
              </div>
              <button
                onClick={handleStep3_ScrubDeadline}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950/50"
              >
                <FastForward className="w-4 h-4" />
                <span>Fast-Forward Date to Sep 7 (+3 Days)</span>
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>STEP 4: Evaluate Recovery Rules & Policy Gate</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                The Recovery Agent evaluates the broken commitment. All policy rules pass (confidence &ge; 85%, balance &gt; 0, prior reminders = 0 &lt; 2).
              </p>
              <div className="p-3 bg-indigo-500/10 text-indigo-300 rounded-xl border border-indigo-500/30 font-mono font-semibold">
                Approved Action: SEND_REMINDER (Simulated Dispatch)
              </div>
              <button
                onClick={handleStep4_ExecuteRecovery}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-950/50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Recovery Action</span>
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-3 text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Full Recovery Loop Demonstrated!</h4>
              <p className="text-slate-300 leading-relaxed font-medium">
                You have experienced the complete COMMIT cycle: Promise → Schedule → Bank Match → Breach → Policy Enforcement → Recovery Execution.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl cursor-pointer shadow-md shadow-indigo-950/50"
              >
                Close Tour & Explore Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
