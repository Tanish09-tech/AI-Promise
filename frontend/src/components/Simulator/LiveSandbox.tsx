import React, { useState } from 'react';
import { Sparkles, CreditCard, FastForward, X, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { CommitEngine } from '../../services/engine';
import type { ExtractionResult } from '../../types/commit';
import { processMessage } from '../../services/api';

interface LiveSandboxProps {
  engine: CommitEngine;
  onClose: () => void;
  onRefresh: () => void;
}

export const LiveSandbox: React.FC<LiveSandboxProps> = ({ engine, onClose, onRefresh }) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(engine.invoices[0]?.id || 'INV-1001');
  const [customMessageText, setCustomMessageText] = useState<string>("I will pay ₹30,000 tomorrow and remaining on Friday.");
  
  const [lastExtraction, setLastExtraction] = useState<ExtractionResult | null>(null);
  const [paymentInput, setPaymentInput] = useState<string>('30000');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedInvoice = engine.invoices.find(i => i.id === selectedInvoiceId) || engine.invoices[0];

  const presets = [
    {
      label: 'Multi-Part Promise',
      text: "I will pay ₹30,000 tomorrow and remaining on Friday."
    },
    {
      label: 'Full Payment Promise',
      text: `Releasing full payment of ₹${selectedInvoice.outstanding_amount.toLocaleString()} on 2026-09-08 via RTGS.`
    },
    {
      label: 'Ambiguous Promise (Refusal Test)',
      text: "I'll pay half sometime next week when vendor payments clear."
    }
  ];

  const handleTestExtract = () => {
    if (!customMessageText.trim()) return;
    const res = engine.extractCommitmentsFromText(customMessageText, selectedInvoice);
    setLastExtraction(res);
  };

  const handleProcessMessage = async () => {
    if (!customMessageText.trim()) return;
    setIsSubmitting(true);
    try {
      await processMessage(selectedInvoiceId, customMessageText);
      const res = engine.extractCommitmentsFromText(customMessageText, selectedInvoice);
      setLastExtraction(res);
      onRefresh();
    } catch (e) {
      console.error('Error processing message:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = () => {
    if (!paymentInput) return;
    const amt = parseFloat(paymentInput);
    engine.ingestPayment(selectedInvoiceId, amt, `RTGS-LIVE-${Date.now().toString().slice(-4)}`);
    onRefresh();
  };

  const handleScrubDate = (days: number) => {
    const d = new Date(engine.currentDate);
    d.setDate(d.getDate() + days);
    engine.setSimulatedDate(d.toISOString().split('T')[0]);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/40">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>Add & Test Customer Payment Promise</span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded font-mono font-bold">
                  LIVE ENGINE
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Type any custom customer payment message to extract commitments and update recovery workflow</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Invoice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Step 1: Select Invoice Context</label>
            <select
              value={selectedInvoiceId}
              onChange={e => setSelectedInvoiceId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {engine.invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.id} — {inv.customer_name} (Due: ₹{inv.outstanding_amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {engine.invoices.slice(0, 3).map(inv => (
              <button
                key={inv.id}
                onClick={() => setSelectedInvoiceId(inv.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedInvoiceId === inv.id
                    ? 'bg-blue-50 dark:bg-indigo-500/10 border-blue-500 dark:border-indigo-500/50 text-blue-900 dark:text-white font-semibold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-mono font-bold text-xs text-blue-600 dark:text-indigo-400">{inv.id}</div>
                <div className="text-xs font-semibold truncate">{inv.customer_name}</div>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-bold">₹{inv.outstanding_amount.toLocaleString()} Outstanding</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Customer Promise Text */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Step 2: Type or Select Promise Text</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomMessageText(p.text);
                    setLastExtraction(null);
                  }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] transition cursor-pointer font-mono font-bold border border-slate-200 dark:border-slate-700"
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setCustomMessageText('');
                  setLastExtraction(null);
                }}
                className="px-2 py-1 bg-red-50 dark:bg-rose-500/10 hover:bg-red-100 text-red-600 dark:text-rose-400 rounded-lg text-[10px] transition cursor-pointer font-mono font-bold border border-red-200 dark:border-rose-500/20 flex items-center gap-1"
                title="Clear text box"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={customMessageText}
              onChange={e => setCustomMessageText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-2xs leading-relaxed"
              placeholder="Type customer promise message (e.g. Will pay ₹50,000 on Friday)..."
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestExtract}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              Preview AI Extraction
            </button>

            <button
              onClick={handleProcessMessage}
              disabled={isSubmitting || !customMessageText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Extracting...' : 'Create & Ingest Promise'}</span>
            </button>
          </div>
        </div>

        {/* Extraction Result Card */}
        {lastExtraction && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">AI Extraction Result</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lastExtraction.is_valid ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-red-100 dark:bg-rose-500/20 text-red-700 dark:text-rose-400 border border-red-200 dark:border-rose-500/30'}`}>
                {lastExtraction.is_valid ? 'VALID PROPOSAL ✓' : 'ABSTAINED / REFUSED ⚠'}
              </span>
            </div>

            {lastExtraction.refusal_reason ? (
              <div className="p-3 bg-red-50 dark:bg-rose-500/10 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-500/30 rounded-xl font-mono font-medium">
                {lastExtraction.refusal_reason}
              </div>
            ) : (
              <div className="space-y-1.5">
                {lastExtraction.commitments.map((c, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-emerald-700 dark:text-emerald-400 font-bold flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Promised: ₹{c.amount.toLocaleString()}</span>
                    </span>
                    <span>Deadline: {c.deadline} (Conf: {(c.confidence * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Fast Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Simulate Bank Payment Arrival</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={paymentInput}
                onChange={e => setPaymentInput(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                placeholder="Amount ₹"
              />
              <button
                onClick={handleRecordPayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Record Pay
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FastForward className="w-4 h-4 text-blue-500" />
              <span>Fast-Forward Timeline</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScrubDate(1)}
                className="flex-1 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold transition cursor-pointer"
              >
                +1 Day
              </button>
              <button
                onClick={() => handleScrubDate(3)}
                className="flex-1 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold transition cursor-pointer"
              >
                +3 Days (Breach)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
