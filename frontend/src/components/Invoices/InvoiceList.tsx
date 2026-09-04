import React, { useState } from 'react';
import { Search, ChevronRight, X, Sparkles, CreditCard, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { CommitEngine } from '../../services/engine';
import { createRazorpayOrder, simulateRazorpayWebhook } from '../../services/api';

interface InvoiceListProps {
  engine: CommitEngine;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ engine, onRefresh, onShowToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [testModalOrder, setTestModalOrder] = useState<{ order_id: string; amount: number; invoice_id: string } | null>(null);

  const [newMessageText, setNewMessageText] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const invoices = engine.invoices.filter(inv => {
    const matchesSearch = inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedInvoice = engine.invoices.find(i => i.id === selectedInvoiceId);
  const selectedCommitments = engine.commitments.filter(c => c.invoice_id === selectedInvoiceId);
  const selectedPayments = engine.payments.filter(p => p.invoice_id === selectedInvoiceId);

  const handleSimulateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !newMessageText) return;
    const res = engine.processCustomerMessage(selectedInvoiceId, newMessageText);
    if (res.success && res.commitments) {
      onShowToast('success', 'Commitment Extracted!', `Extracted ${res.commitments.length} commitment(s) from customer response.`);
    } else if (res.exception) {
      onShowToast('warning', 'Ambiguous Promise Refused!', res.exception.reason);
    }
    setNewMessageText('');
    onRefresh();
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !paymentAmount) return;
    const amt = parseFloat(paymentAmount);
    const ref = paymentRef || `RTGS-${Date.now().toString().slice(-4)}`;
    engine.ingestPayment(selectedInvoiceId, amt, ref);
    onShowToast('success', 'Bank Payment Verified!', `Recorded ₹${amt.toLocaleString()} bank transfer (Ref: ${ref}).`);
    setPaymentAmount('');
    setPaymentRef('');
    onRefresh();
  };

  const handleRazorpayCheckout = async () => {
    if (!selectedInvoiceId || !selectedInvoice) return;
    const orderRes = await createRazorpayOrder(selectedInvoiceId);

    if (orderRes && orderRes.order_id) {
      selectedInvoice.razorpay_order_id = orderRes.order_id;
      onRefresh();

      const isRealKey = orderRes.key_id && !orderRes.key_id.includes('demo') && orderRes.key_id.startsWith('rzp_test_');

      if (isRealKey && typeof (window as any).Razorpay !== 'undefined') {
        try {
          const options = {
            key: orderRes.key_id,
            amount: orderRes.amount,
            currency: orderRes.currency || 'INR',
            name: 'COMMIT OS',
            description: `Payment for Invoice ${selectedInvoice.id}`,
            order_id: orderRes.order_id,
            prefill: {
              name: selectedInvoice.customer_name,
              email: selectedInvoice.customer_email || 'billing@customer.com'
            },
            theme: { color: '#2563eb' },
            handler: async function (response: any) {
              onShowToast('info', 'Payment Submitted', `Razorpay Payment ID ${response.razorpay_payment_id}. Triggering backend webhook verification...`);
              await handleSimulateWebhook();
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function () {
            setTestModalOrder({ order_id: orderRes.order_id, amount: selectedInvoice.outstanding_amount, invoice_id: selectedInvoice.id });
          });
          rzp.open();
          return;
        } catch (e) {
          console.warn('Razorpay SDK failed, opening test modal:', e);
        }
      }

      // Show clean interactive Razorpay Test Mode modal
      setTestModalOrder({
        order_id: orderRes.order_id,
        amount: selectedInvoice.outstanding_amount,
        invoice_id: selectedInvoice.id
      });
    } else {
      onShowToast('warning', 'Order Creation Failed', 'Could not create Razorpay Test Mode Order.');
    }
  };

  const handleSimulateWebhook = async () => {
    if (!selectedInvoice) return;
    const res = await simulateRazorpayWebhook(selectedInvoice.id, selectedInvoice.razorpay_order_id, selectedInvoice.outstanding_amount);
    if (res && res.success) {
      onShowToast('success', 'Razorpay Webhook Verified!', `Authoritative payment.captured webhook verified! State updated: Invoice ${res.result?.invoice?.status || 'PAID'}, Commitment ${res.result?.matchedCommitment?.status || 'FULFILLED'}.`);
      onRefresh();
    } else {
      onShowToast('warning', 'Webhook Verification Failed', res?.message || 'Could not verify webhook payment.');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Invoices & Customer Activity</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Manage accounts, record incoming promises, and match verified bank payments</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      <div className="commit-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] font-bold">
              <tr>
                <th className="px-5 py-3.5">Invoice ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Original Amount</th>
                <th className="px-5 py-3.5">Progress / Outstanding</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {invoices.map(inv => {
                const invCommitments = engine.commitments.filter(c => c.invoice_id === inv.id);
                const paidPct = Math.round(((inv.original_amount - inv.outstanding_amount) / inv.original_amount) * 100);

                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{inv.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{inv.customer_name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{inv.customer_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">₹{inv.original_amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">₹{inv.outstanding_amount.toLocaleString()}</span>
                          <span className="text-slate-500 dark:text-slate-400">{paidPct}% paid</span>
                        </div>
                        <div className="w-28 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all" style={{ width: `${paidPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-mono">{inv.due_date}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-mono border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-100 dark:bg-indigo-500/15 text-blue-700 dark:text-indigo-400 border-blue-200 dark:border-indigo-500/30'
                            : 'bg-red-100 dark:bg-rose-500/15 text-red-700 dark:text-rose-400 border-red-200 dark:border-rose-500/30'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invCommitments.length > 0 && (
                          <span className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-indigo-500/15 text-blue-700 dark:text-indigo-300 rounded border border-blue-200 dark:border-indigo-500/30 font-mono font-bold">
                            {invCommitments.length} Commitment(s)
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-6 flex flex-col justify-between h-full shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-indigo-400">{selectedInvoice.id}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono border ${
                        selectedInvoice.status === 'PAID'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-red-100 dark:bg-rose-500/20 text-red-700 dark:text-rose-400 border-red-200 dark:border-rose-500/30'
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedInvoice.customer_name}</h3>
                </div>

                <button
                  onClick={() => setSelectedInvoiceId(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-slate-500 dark:text-slate-400 font-semibold">Original Total</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    ₹{selectedInvoice.original_amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400 font-semibold">Outstanding Balance</div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    ₹{selectedInvoice.outstanding_amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400 font-semibold">Original Due Date</div>
                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-1 font-bold">{selectedInvoice.due_date}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Tracked Promises & Commitments ({selectedCommitments.length})
                </h4>

                {selectedCommitments.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No active commitments extracted for this invoice yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCommitments.map(c => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">₹{c.promised_amount.toLocaleString()}</span>
                            {c.part_index && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                                (Part {c.part_index} of {c.total_parts})
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                            Deadline: <span className="text-blue-600 dark:text-indigo-400 font-mono font-bold">{c.deadline}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-mono border ${
                              c.status === 'FULFILLED'
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                : c.status === 'BROKEN'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                : 'bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 border-blue-200 dark:border-indigo-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Verified Payment Ledger ({selectedPayments.length})
                </h4>
                {selectedPayments.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No verified payments recorded for this invoice yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPayments.map(p => (
                      <div key={p.id} className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-emerald-800 dark:text-emerald-300 font-mono">₹{p.amount.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Ref: {p.payment_reference} • Date: {p.payment_date}</div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          MATCHED ✓
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Simulate Incoming Customer Promise Message</span>
                  </label>
                  <form onSubmit={handleSimulateMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. I will pay ₹30,000 tomorrow and rest on Friday"
                      value={newMessageText}
                      onChange={e => setNewMessageText(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0 shadow-xs"
                    >
                      Extract
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Simulate Incoming Bank Payment</span>
                  </label>
                  <form onSubmit={handleSimulatePayment} className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Amount ₹"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
                    />
                    <input
                      type="text"
                      placeholder="Ref (optional)"
                      value={paymentRef}
                      onChange={e => setPaymentRef(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                    >
                      Record Pay
                    </button>
                  </form>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>Razorpay Test Mode Payment & Webhook</span>
                    </label>
                    {selectedInvoice.razorpay_order_id && (
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {selectedInvoice.razorpay_order_id}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRazorpayCheckout}
                      disabled={selectedInvoice.outstanding_amount <= 0}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>1. Pay via Razorpay (₹{selectedInvoice.outstanding_amount.toLocaleString()})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateWebhook}
                      disabled={selectedInvoice.outstanding_amount <= 0}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>2. Trigger Webhook (`payment.captured`)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Authoritative Backend: Webhook HMAC SHA256 verification marks invoice & commitment as verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {testModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-blue-500/40 shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold font-mono text-sm border border-white/20">
                  R
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>Razorpay Test Checkout</span>
                    <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-mono font-bold uppercase">TEST</span>
                  </div>
                  <div className="text-[10px] text-blue-100 font-mono mt-0.5">Order ID: {testModalOrder.order_id}</div>
                </div>
              </div>

              <button
                onClick={() => setTestModalOrder(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>Invoice ID:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{testModalOrder.invoice_id}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>Customer Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice?.customer_name}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Amount Payable:</span>
                  <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">₹{testModalOrder.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Simulated Payment Method
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-500 rounded-xl font-bold text-blue-700 dark:text-blue-300 text-center cursor-pointer">
                    💳 Card (Test)
                  </button>
                  <button className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 text-center font-medium opacity-70">
                    📲 UPI
                  </button>
                  <button className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 text-center font-medium opacity-70">
                    🏦 NetBanking
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={async () => {
                    setTestModalOrder(null);
                    await handleSimulateWebhook();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Test Payment (₹{testModalOrder.amount.toLocaleString()})</span>
                </button>

                <p className="text-[10px] text-center text-slate-400 italic">
                  Dispatches Razorpay <code className="font-mono text-blue-500">payment.captured</code> webhook with valid HMAC SHA256 signature to backend
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

