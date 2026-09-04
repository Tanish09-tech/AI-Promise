import { Invoice, Commitment, Payment, ExceptionCase, AuditLog } from '../types/commit';

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-1001',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-801',
    customer_name: 'Apex Logistics Inc.',
    customer_email: 'billing@apexlogistics.com',
    original_amount: 150000,
    outstanding_amount: 150000,
    due_date: '2026-08-15',
    status: 'OVERDUE',
    created_at: '2026-07-15'
  },
  {
    id: 'INV-1002',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-802',
    customer_name: 'Nexus Retail Corp',
    customer_email: 'ap@nexusretail.com',
    original_amount: 85000,
    outstanding_amount: 85000,
    due_date: '2026-08-20',
    status: 'OVERDUE',
    created_at: '2026-07-20'
  },
  {
    id: 'INV-1003',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-803',
    customer_name: 'Vanguard Industrial Parts',
    customer_email: 'finance@vanguardparts.com',
    original_amount: 220000,
    outstanding_amount: 110000,
    due_date: '2026-08-10',
    status: 'PARTIALLY_PAID',
    created_at: '2026-07-10'
  },
  {
    id: 'INV-1004',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-804',
    customer_name: 'Starlight Media Pvt Ltd',
    customer_email: 'accounts@starlightmedia.com',
    original_amount: 45000,
    outstanding_amount: 45000,
    due_date: '2026-08-25',
    status: 'OVERDUE',
    created_at: '2026-07-25'
  },
  {
    id: 'INV-1005',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-805',
    customer_name: 'Horizon Software Solutions',
    customer_email: 'payables@horizonsoft.com',
    original_amount: 310000,
    outstanding_amount: 310000,
    due_date: '2026-08-01',
    status: 'OVERDUE',
    created_at: '2026-07-01'
  },
  {
    id: 'INV-1008',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-808',
    customer_name: 'CyberPulse Security',
    customer_email: 'finance@cyberpulse.io',
    original_amount: 95000,
    outstanding_amount: 95000,
    due_date: '2026-08-28',
    status: 'OVERDUE',
    created_at: '2026-07-28'
  }
];

export const initialCommitments: Commitment[] = [
  {
    id: 'COMM-501',
    invoice_id: 'INV-1001',
    promised_amount: 150000,
    remaining_amount: 150000,
    deadline: '2026-09-08',
    status: 'ACTIVE',
    confidence: 0.94,
    source_text: "We will transfer the full ₹150,000 on September 8th after CFO signoff.",
    created_at: '2026-09-01',
    updated_at: '2026-09-01',
    reminder_count: 0
  },
  {
    id: 'COMM-502',
    invoice_id: 'INV-1002',
    promised_amount: 42500,
    remaining_amount: 42500,
    deadline: '2026-09-05',
    status: 'ACTIVE',
    confidence: 0.91,
    source_text: "Will pay 50% (₹42,500) by September 5th and remainder on September 15th.",
    created_at: '2026-09-02',
    updated_at: '2026-09-02',
    reminder_count: 1,
    part_index: 1,
    total_parts: 2
  },
  {
    id: 'COMM-503',
    invoice_id: 'INV-1002',
    promised_amount: 42500,
    remaining_amount: 42500,
    deadline: '2026-09-15',
    status: 'ACTIVE',
    confidence: 0.91,
    source_text: "Will pay 50% (₹42,500) by September 5th and remainder on September 15th.",
    created_at: '2026-09-02',
    updated_at: '2026-09-02',
    reminder_count: 0,
    part_index: 2,
    total_parts: 2
  },
  {
    id: 'COMM-504',
    invoice_id: 'INV-1003',
    promised_amount: 110000,
    remaining_amount: 0,
    deadline: '2026-09-02',
    status: 'FULFILLED',
    confidence: 0.96,
    source_text: "Payment of ₹110,000 scheduled for Sept 2.",
    created_at: '2026-08-28',
    updated_at: '2026-09-02',
    reminder_count: 0
  },
  {
    id: 'COMM-505',
    invoice_id: 'INV-1005',
    promised_amount: 310000,
    remaining_amount: 310000,
    deadline: '2026-09-03',
    status: 'BROKEN',
    confidence: 0.89,
    source_text: "Clear full invoice on September 3rd guaranteed.",
    created_at: '2026-08-25',
    updated_at: '2026-09-04',
    reminder_count: 2
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'PAY-901',
    invoice_id: 'INV-1003',
    amount: 110000,
    payment_reference: 'UTR-993847201',
    payment_date: '2026-09-02',
    matched_commitment_id: 'COMM-504'
  }
];

export const initialExceptions: ExceptionCase[] = [
  {
    id: 'EXC-101',
    invoice_id: 'INV-1004',
    exception_type: 'AMBIGUOUS_DEADLINE',
    raw_message: "I'll pay half sometime next week when our vendor payments clear.",
    reason: "Date 'sometime next week' is too vague for financial commitment contract.",
    status: 'NEEDS_REVIEW',
    created_at: '2026-09-03'
  },
  {
    id: 'EXC-102',
    invoice_id: 'INV-1008',
    exception_type: 'AMBIGUOUS_AMOUNT',
    raw_message: "We will pay a small token amount on Friday.",
    reason: "Amount 'small token amount' cannot be quantified safely.",
    status: 'NEEDS_REVIEW',
    created_at: '2026-09-04'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-01T10:30:00Z',
    entity_type: 'COMMITMENT',
    entity_id: 'COMM-501',
    event_type: 'COMMITMENT_EXTRACTED',
    new_state: 'ACTIVE',
    decision: 'ACCEPT',
    reason: 'Confidence 0.94 >= threshold 0.85',
    policy_version: 'v1.2.0'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-02T14:15:00Z',
    entity_type: 'PAYMENT',
    entity_id: 'PAY-901',
    event_type: 'PAYMENT_MATCHED',
    previous_state: 'ACTIVE',
    new_state: 'FULFILLED',
    decision: 'FULFILL_COMMITMENT',
    reason: 'Exact amount match ₹110,000 for COMM-504',
    policy_version: 'v1.2.0'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-04T00:01:00Z',
    entity_type: 'COMMITMENT',
    entity_id: 'COMM-505',
    event_type: 'COMMITMENT_BROKEN',
    previous_state: 'ACTIVE',
    new_state: 'BROKEN',
    decision: 'MARK_BROKEN',
    reason: 'Current date 2026-09-07 exceeded deadline 2026-09-03 without payment.',
    policy_version: 'v1.2.0'
  }
];
