import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, User, ShieldCheck } from 'lucide-react';
import { CommitEngine } from '../../services/engine';
import type { ExtractionResult } from '../../types/commit';

interface CustomerInboxProps {
  engine: CommitEngine;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const CustomerInbox: React.FC<CustomerInboxProps> = ({ engine, onRefresh, onShowToast }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('Apex Industrial Logistics');
  const [messageInput, setMessageInput] = useState<string>("I'll pay ₹30,000 tomorrow and the remaining ₹20,000 by Friday.");
  const [livePreview, setLivePreview] = useState<ExtractionResult | null>(null);

  const customerInvoices = engine.invoices.filter(i => i.customer_name === selectedCustomer);
  const activeInvoice = customerInvoices[0] || engine.invoices[0];

  const presets = [
    {
      label: 'Multi-Part Schedule',
      text: "I'll pay ₹30,000 tomorrow and the remaining ₹20,000 by Friday."
    },
    {
      label: 'Full Payment Promise',
      text: `We will release full payment of ₹${activeInvoice.outstanding_amount.toLocaleString()} on 2026-09-05 via RTGS.`
    },
    {
      label: 'Vague Date (Refusal Guardrail)',
      text: "I'll pay half sometime next week when vendor payments clear."
    }
  ];

  const handleInputChange = (text: string) => {
    setMessageInput(text);
    if (text.trim().length > 5) {
      const result = engine.extractCommitmentsFromText(text, activeInvoice);
      setLivePreview(result);
    } else {
      setLivePreview(null);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    engine.processCustomerMessage(activeInvoice.id, messageInput);
    const extraction = engine.extractCommitmentsFromText(messageInput, activeInvoice);

    if (extraction.is_valid && extraction.commitments.length > 0) {
      onShowToast('success', 'Payment Schedule Created', `Extracted ${extraction.commitments.length} commitment(s) for ${activeInvoice.customer_name}`);
    } else {
      onShowToast('warning', 'Routed to AR Review Queue', extraction.refusal_reason || 'Ambiguous promise flagged for human review');
    }

    onRefresh();
    setMessageInput('');
    setLivePreview(null);
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      {/* Header Banner */}
      <div className="commit-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-400 border border-blue-200 dark:border-indigo-500/20 rounded-full">
              Real-Time AI Extraction
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">• Customer Communication Portal</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            <span>Customer Communication Inbox & Live AI Chat</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Simulate incoming WhatsApp & Email customer payment responses and preview real-time LLM promise extraction.
          </p>
        </div>

        {/* Customer Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-2xs">
          <User className="w-4 h-4 text-blue-600 dark:text-indigo-400 ml-1" />
          <select
            value={selectedCustomer}
            onChange={e => setSelectedCustomer(e.target.value)}
            className="bg-transparent text-xs text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer py-1 pr-2 font-mono"
          >
            <option value="Apex Industrial Logistics" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Apex Industrial Logistics</option>
            <option value="Precision Auto Components" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Precision Auto Components</option>
            <option value="Matrix Retail Distributors" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Matrix Retail Distributors</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Chat Feeds */}
        <div className="lg:col-span-7 commit-card p-5 space-y-4 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-indigo-600/20 border border-blue-200 dark:border-indigo-500/30 text-blue-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedCustomer}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">Invoice #{activeInvoice.id} • Balance ₹{activeInvoice.outstanding_amount.toLocaleString()}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded font-mono font-bold">
              WHATSAPP ACTIVE
            </span>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 p-3 rounded-2xl max-w-[80%] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                <p className="font-mono text-[11px] text-blue-600 dark:text-indigo-400 font-bold">System Notice (COMMIT Agent)</p>
                <p className="font-medium">Reminder: Invoice {activeInvoice.id} for ₹{activeInvoice.outstanding_amount.toLocaleString()} is overdue. Please share your payment timeline.</p>
                <span className="text-[9px] text-slate-400 block text-right font-mono font-medium">10:14 AM</span>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-blue-600 text-white p-3 rounded-2xl max-w-[80%] space-y-1 shadow-2xs">
                <p className="font-mono text-[11px] text-blue-100 font-bold">Customer ({selectedCustomer})</p>
                <p className="font-medium">"I'll pay ₹30,000 tomorrow and the remaining ₹20,000 by Friday."</p>
                <span className="text-[9px] text-blue-200 block text-right font-mono">10:16 AM ✓✓</span>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 p-3 rounded-2xl max-w-[85%] border border-emerald-200 dark:border-emerald-500/30 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>COMMIT AI Extraction Verified</span>
                </div>
                <p className="text-[11px] leading-relaxed font-medium">
                  Part 1: ₹30,000 due 2026-09-04 (Confidence 98%)<br />
                  Part 2: ₹20,000 due 2026-09-06 (Confidence 95%)
                </p>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block text-right font-mono font-bold">Automated Schedule Ingested</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-mono font-semibold">Sample Customer Responses:</span>
              <button
                onClick={() => {
                  setMessageInput('');
                  setLivePreview(null);
                }}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition text-[10px] flex items-center gap-1 cursor-pointer font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInputChange(p.text)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-[10px] transition cursor-pointer font-mono font-bold border border-slate-200 dark:border-slate-800 shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Type or select a customer payment message..."
              value={messageInput}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send & Process</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time AI Extraction Preview Console */}
        <div className="lg:col-span-5 commit-card p-5 space-y-4 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Real-Time AI Extraction Console</h4>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded font-mono font-bold">
              LLM PARSER
            </span>
          </div>

          {livePreview ? (
            <div className="flex-1 space-y-3 font-mono text-xs overflow-y-auto">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Target Invoice</span>
                <div className="text-slate-900 dark:text-white font-bold">{activeInvoice.id} • {activeInvoice.customer_name}</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold">Outstanding Balance: ₹{activeInvoice.outstanding_amount.toLocaleString()}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Extraction Status</span>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${livePreview.is_valid ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-red-100 dark:bg-rose-500/20 text-red-700 dark:text-rose-400 border-red-200 dark:border-rose-500/30'}`}>
                    {livePreview.is_valid ? 'PROPOSAL VALID ✓' : 'ABSTAINED / REFUSED ⚠'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Confidence Threshold: &ge; 85%</span>
                </div>
              </div>

              {livePreview.refusal_reason ? (
                <div className="p-4 bg-red-50 dark:bg-rose-500/10 text-red-900 dark:text-rose-300 border border-red-200 dark:border-rose-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Guardrail Refusal Alert</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">{livePreview.refusal_reason}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 font-sans">Will be automatically routed to human AR Review Queue.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Parsed Payment Commitments</span>
                  {livePreview.commitments.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-slate-200">
                        <span>Part {i + 1}: ₹{c.amount.toLocaleString()}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{(c.confidence * 100).toFixed(0)}% Confidence</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Target Date: {c.deadline}</span>
                        <span className="text-blue-600 dark:text-indigo-400 font-bold">Status: ACTIVE</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-400 dark:text-slate-600" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Type or select a sample customer response to view live AI extraction parameters & refusal guardrails.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
