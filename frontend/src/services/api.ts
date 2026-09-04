import type { Invoice, Commitment, ExceptionCase, AuditLog, BatchMetrics, ExtractionResult } from '../types/commit';
import { engineInstance } from './engine';

const API_BASE_URL = 'http://localhost:8000/api';

export async function getDashboardMetrics(): Promise<{
  total_overdue: number;
  total_promised: number;
  verified_paid: number;
  agent_recovered: number;
  active_commitments: number;
  broken_commitments: number;
  exceptions: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback to client engine instance
  }
  
  const batch = engineInstance.runBatchEvaluation();
  return {
    total_overdue: engineInstance.invoices.reduce((s, i) => s + i.outstanding_amount, 0),
    total_promised: engineInstance.commitments.reduce((s, c) => s + c.promised_amount, 0),
    verified_paid: engineInstance.payments.reduce((s, p) => s + p.amount, 0),
    agent_recovered: batch.agent_recovered,
    active_commitments: engineInstance.commitments.filter(c => c.status === 'ACTIVE').length,
    broken_commitments: engineInstance.commitments.filter(c => c.status === 'BROKEN').length,
    exceptions: engineInstance.exceptions.filter(e => e.status === 'NEEDS_REVIEW').length
  };
}

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return engineInstance.invoices;
}

export async function getCommitments(): Promise<Commitment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/commitments`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return engineInstance.commitments;
}

export async function getExceptions(): Promise<ExceptionCase[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/exceptions`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return engineInstance.exceptions;
}

export async function resolveException(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/exceptions/${id}/resolve`, {
      method: 'POST'
    });
    if (res.ok) return true;
  } catch (e) {
    // Fallback
  }
  const exc = engineInstance.exceptions.find(e => e.id === id);
  if (exc) {
    exc.status = 'RESOLVED';
    engineInstance.addAuditLog('COMMITMENT', id, 'EXCEPTION_RESOLVED_MANUAL', 'NEEDS_REVIEW', 'RESOLVED', 'RESOLVE', 'AR Manager resolved case.');
    return true;
  }
  return false;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/audit`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return engineInstance.auditLogs;
}

export async function extractCommitments(invoiceId: string, text: string): Promise<ExtractionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/commitments/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, text_snippet: text })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  const inv = engineInstance.invoices.find(i => i.id === invoiceId) || engineInstance.invoices[0];
  return engineInstance.extractCommitmentsFromText(text, inv);
}

export async function processMessage(invoiceId: string, text: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, message_text: text })
    });
    if (res.ok) {
      const data = await res.json();
      // Sync local engine
      engineInstance.processCustomerMessage(invoiceId, text);
      return data;
    }
  } catch (e) {
    // Fallback
  }
  return engineInstance.processCustomerMessage(invoiceId, text);
}

export async function ingestPayment(invoiceId: string, amount: number, ref: string, date?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, amount, reference: ref, payment_date: date })
    });
    if (res.ok) {
      const data = await res.json();
      // Sync local engine
      engineInstance.ingestPayment(invoiceId, amount, ref, date);
      return data;
    }
  } catch (e) {
    // Fallback
  }
  return engineInstance.ingestPayment(invoiceId, amount, ref, date);
}

export async function createRazorpayOrder(invoiceId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/create-order/${invoiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to call backend create-order API, falling back to client engine:', e);
  }

  // Client-side fallback guarantees order creation never fails
  const inv = engineInstance.invoices.find(i => i.id === invoiceId);
  const orderId = `order_${Math.random().toString(36).substring(2, 14)}`;
  if (inv) {
    inv.razorpay_order_id = orderId;
  }

  return {
    success: true,
    order_id: orderId,
    amount: inv ? Math.round(inv.outstanding_amount * 100) : 5000000,
    currency: 'INR',
    key_id: 'rzp_test_commit_demo_key',
    invoice_id: invoiceId
  };
}

export async function simulateRazorpayWebhook(invoiceId: string, orderId?: string, amount?: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/simulate-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: invoiceId, razorpay_order_id: orderId, amount })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to call backend simulate-webhook API, falling back to client engine:', e);
  }

  // Client-side fallback guarantees webhook simulation state update
  const inv = engineInstance.invoices.find(i => i.id === invoiceId);
  const payAmt = amount || (inv ? inv.outstanding_amount : 30000);
  const ref = `pay_${Math.random().toString(36).substring(2, 14)}`;
  const ingestRes = engineInstance.ingestPayment(invoiceId, payAmt, ref);

  return {
    success: true,
    message: 'Simulated Razorpay webhook verified on client engine!',
    result: ingestRes
  };
}

export async function runBatchEvaluation(): Promise<BatchMetrics> {
  try {
    const res = await fetch(`${API_BASE_URL}/batch/evaluate`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return engineInstance.runBatchEvaluation();
}
