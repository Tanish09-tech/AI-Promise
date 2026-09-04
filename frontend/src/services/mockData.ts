import type { Invoice, CustomerMessage, Commitment, Payment, ExceptionCase, AuditLog } from '../types/commit';

export interface SyntheticTestCase {
  id: string; // e.g. CASE-001
  category: 'CLEAR_SINGLE' | 'MULTI_PART' | 'FULL_FULFILLMENT' | 'PARTIAL_FULFILLMENT' | 'BROKEN' | 'AMBIGUOUS' | 'NO_COMMITMENT';
  is_heldout: boolean;
  invoice: Invoice;
  message?: CustomerMessage;
  expected_commitments_count: number;
  payments?: Payment[];
  simulated_current_date: string;
}

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-1001',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-801',
    customer_name: 'Apex Industrial Logistics',
    customer_email: 'finance@apexlogistics.com',
    original_amount: 50000,
    outstanding_amount: 50000,
    due_date: '2026-08-28',
    status: 'OVERDUE',
    created_at: '2026-08-01'
  },
  {
    id: 'INV-1002',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-802',
    customer_name: 'NovaTech Solutions',
    customer_email: 'accounts@novatech.io',
    original_amount: 120000,
    outstanding_amount: 120000,
    due_date: '2026-08-25',
    status: 'OVERDUE',
    created_at: '2026-07-25'
  },
  {
    id: 'INV-1003',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-803',
    customer_name: 'Zenith Retail Outlets',
    customer_email: 'billing@zenithretail.in',
    original_amount: 75000,
    outstanding_amount: 75000,
    due_date: '2026-08-20',
    status: 'OVERDUE',
    created_at: '2026-07-20'
  },
  {
    id: 'INV-1004',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-804',
    customer_name: 'Starlight Media Pvt Ltd',
    customer_email: 'payables@starlight.co',
    original_amount: 45000,
    outstanding_amount: 45000,
    due_date: '2026-08-30',
    status: 'OVERDUE',
    created_at: '2026-08-05'
  },
  {
    id: 'INV-1005',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-805',
    customer_name: 'Quantum BioPharma',
    customer_email: 'ap@quantumbio.com',
    original_amount: 210000,
    outstanding_amount: 210000,
    due_date: '2026-08-15',
    status: 'OVERDUE',
    created_at: '2026-07-15'
  },
  {
    id: 'INV-1006',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-806',
    customer_name: 'Vortex Cloud Infrastructure',
    customer_email: 'finance@vortexcloud.net',
    original_amount: 90000,
    outstanding_amount: 90000,
    due_date: '2026-08-29',
    status: 'OVERDUE',
    created_at: '2026-08-02'
  },
  {
    id: 'INV-1007',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-807',
    customer_name: 'Horizon Green Energy',
    customer_email: 'payments@horizongreen.org',
    original_amount: 150000,
    outstanding_amount: 150000,
    due_date: '2026-08-22',
    status: 'OVERDUE',
    created_at: '2026-07-22'
  },
  {
    id: 'INV-1008',
    merchant_id: 'MERCH-01',
    customer_id: 'CUST-808',
    customer_name: 'CyberPulse Security',
    customer_email: 'ar@cyberpulse.io',
    original_amount: 60000,
    outstanding_amount: 60000,
    due_date: '2026-08-27',
    status: 'OVERDUE',
    created_at: '2026-07-27'
  }
];

export const INITIAL_MESSAGES: CustomerMessage[] = [
  {
    id: 'MSG-1001',
    invoice_id: 'INV-1001',
    message_text: "I'll pay ₹30,000 tomorrow (2026-09-04) and the remaining ₹20,000 by Friday (2026-09-06).",
    received_at: '2026-09-03 09:15'
  },
  {
    id: 'MSG-1002',
    invoice_id: 'INV-1002',
    message_text: "We are releasing full payment of ₹120,000 on 2026-09-05 via RTGS.",
    received_at: '2026-09-03 10:30'
  },
  {
    id: 'MSG-1003',
    invoice_id: 'INV-1003',
    message_text: "We will pay ₹40,000 on 2026-09-02 and the rest of ₹35,000 next Monday 2026-09-08.",
    received_at: '2026-09-01 14:00'
  },
  {
    id: 'MSG-1004',
    invoice_id: 'INV-1004',
    message_text: "I'll pay half sometime next week when our vendor payments clear.",
    received_at: '2026-09-03 11:45'
  },
  {
    id: 'MSG-1005',
    invoice_id: 'INV-1005',
    message_text: "Our CFO is out of office. We will clear ₹100,000 on 2026-09-02 and balance ₹110,000 on 2026-09-07.",
    received_at: '2026-09-01 16:20'
  },
  {
    id: 'MSG-1006',
    invoice_id: 'INV-1006',
    message_text: "Checking on this with finance team.",
    received_at: '2026-09-03 13:10'
  }
];

export const INITIAL_COMMITMENTS: Commitment[] = [
  {
    id: 'CMT-1001-A',
    invoice_id: 'INV-1001',
    source_message_id: 'MSG-1001',
    promised_amount: 30000,
    remaining_amount: 0,
    deadline: '2026-09-04',
    status: 'FULFILLED',
    confidence: 0.98,
    source_text: "I'll pay ₹30,000 tomorrow",
    created_at: '2026-09-03 09:16',
    updated_at: '2026-09-04 11:00',
    reminder_count: 0,
    part_index: 1,
    total_parts: 2
  },
  {
    id: 'CMT-1001-B',
    invoice_id: 'INV-1001',
    source_message_id: 'MSG-1001',
    promised_amount: 20000,
    remaining_amount: 20000,
    deadline: '2026-09-06',
    status: 'BROKEN',
    confidence: 0.96,
    source_text: 'remaining ₹20,000 by Friday',
    created_at: '2026-09-03 09:16',
    updated_at: '2026-09-07 00:01',
    reminder_count: 1,
    part_index: 2,
    total_parts: 2
  },
  {
    id: 'CMT-1002-A',
    invoice_id: 'INV-1002',
    source_message_id: 'MSG-1002',
    promised_amount: 120000,
    remaining_amount: 120000,
    deadline: '2026-09-05',
    status: 'ACTIVE',
    confidence: 0.95,
    source_text: 'releasing full payment of ₹120,000 on 2026-09-05',
    created_at: '2026-09-03 10:31',
    updated_at: '2026-09-03 10:31',
    reminder_count: 0,
    part_index: 1,
    total_parts: 1
  },
  {
    id: 'CMT-1003-A',
    invoice_id: 'INV-1003',
    source_message_id: 'MSG-1003',
    promised_amount: 40000,
    remaining_amount: 0,
    deadline: '2026-09-02',
    status: 'FULFILLED',
    confidence: 0.94,
    source_text: 'pay ₹40,000 on 2026-09-02',
    created_at: '2026-09-01 14:01',
    updated_at: '2026-09-02 15:30',
    reminder_count: 0,
    part_index: 1,
    total_parts: 2
  },
  {
    id: 'CMT-1003-B',
    invoice_id: 'INV-1003',
    source_message_id: 'MSG-1003',
    promised_amount: 35000,
    remaining_amount: 35000,
    deadline: '2026-09-08',
    status: 'ACTIVE',
    confidence: 0.93,
    source_text: 'rest of ₹35,000 next Monday 2026-09-08',
    created_at: '2026-09-01 14:01',
    updated_at: '2026-09-01 14:01',
    reminder_count: 0,
    part_index: 2,
    total_parts: 2
  },
  {
    id: 'CMT-1005-A',
    invoice_id: 'INV-1005',
    source_message_id: 'MSG-1005',
    promised_amount: 100000,
    remaining_amount: 50000,
    deadline: '2026-09-02',
    status: 'PARTIALLY_FULFILLED',
    confidence: 0.91,
    source_text: 'clear ₹100,000 on 2026-09-02',
    created_at: '2026-09-01 16:21',
    updated_at: '2026-09-02 16:45',
    reminder_count: 0,
    part_index: 1,
    total_parts: 2
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'PAY-7001',
    invoice_id: 'INV-1001',
    amount: 30000,
    payment_reference: 'RTGS-20260904-8831',
    payment_date: '2026-09-04',
    matched_commitment_id: 'CMT-1001-A'
  },
  {
    id: 'PAY-7002',
    invoice_id: 'INV-1003',
    amount: 40000,
    payment_reference: 'NEFT-20260902-1190',
    payment_date: '2026-09-02',
    matched_commitment_id: 'CMT-1003-A'
  },
  {
    id: 'PAY-7003',
    invoice_id: 'INV-1005',
    amount: 50000,
    payment_reference: 'UPI-20260902-9942',
    payment_date: '2026-09-02',
    matched_commitment_id: 'CMT-1005-A'
  }
];

export const INITIAL_EXCEPTIONS: ExceptionCase[] = [
  {
    id: 'EXC-101',
    invoice_id: 'INV-1004',
    exception_type: 'AMBIGUOUS_DEADLINE',
    raw_message: "I'll pay half sometime next week when our vendor payments clear.",
    reason: "Date 'sometime next week' is too vague for financial commitment contract.",
    status: 'NEEDS_REVIEW',
    created_at: '2026-09-03 11:46'
  },
  {
    id: 'EXC-102',
    invoice_id: 'INV-1008',
    exception_type: 'AMBIGUOUS_AMOUNT',
    raw_message: "We will pay a small token amount on Friday.",
    reason: "Amount 'small token amount' cannot be quantified safely.",
    status: 'NEEDS_REVIEW',
    created_at: '2026-09-03 15:20'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-09-03 09:15:00',
    entity_type: 'MESSAGE',
    entity_id: 'MSG-1001',
    event_type: 'CUSTOMER_MESSAGE_RECEIVED',
    reason: 'Incoming WhatsApp promise received from Apex Industrial Logistics.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-09-03 09:16:01',
    entity_type: 'COMMITMENT',
    entity_id: 'CMT-1001-A',
    event_type: 'COMMITMENT_EXTRACTED',
    new_state: 'ACTIVE',
    decision: 'APPROVE',
    reason: 'Extracted ₹30,000 commitment for 2026-09-04 with 98% confidence.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-09-03 09:16:02',
    entity_type: 'COMMITMENT',
    entity_id: 'CMT-1001-B',
    event_type: 'COMMITMENT_EXTRACTED',
    new_state: 'ACTIVE',
    decision: 'APPROVE',
    reason: 'Extracted ₹20,000 commitment for 2026-09-06 with 96% confidence.'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-09-04 11:00:15',
    entity_type: 'PAYMENT',
    entity_id: 'PAY-7001',
    event_type: 'PAYMENT_MATCHED',
    previous_state: 'ACTIVE',
    new_state: 'FULFILLED',
    reason: 'Matched ₹30,000 payment against commitment CMT-1001-A.'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-09-07 00:01:00',
    entity_type: 'COMMITMENT',
    entity_id: 'CMT-1001-B',
    event_type: 'DEADLINE_EXPIRED',
    previous_state: 'ACTIVE',
    new_state: 'BROKEN',
    reason: 'Current date (2026-09-07) passed deadline 2026-09-06 with ₹20,000 outstanding.'
  },
  {
    id: 'AUD-006',
    timestamp: '2026-09-07 09:00:00',
    entity_type: 'RECOVERY_ACTION',
    entity_id: 'ACT-9001',
    event_type: 'RECOVERY_EVALUATED',
    decision: 'SEND_REMINDER',
    reason: 'Commitment broken, 0 prior reminders sent, policy limit 2 reminders.'
  },
  {
    id: 'AUD-007',
    timestamp: '2026-09-07 09:00:05',
    entity_type: 'RECOVERY_ACTION',
    entity_id: 'ACT-9001',
    event_type: 'REMINDER_EXECUTED',
    new_state: 'RECOVERY_EXECUTED',
    reason: 'Simulated payment reminder dispatch completed.'
  }
];

export function generateSyntheticBatch(): SyntheticTestCase[] {
  const cases: SyntheticTestCase[] = [];
  
  for (let i = 1; i <= 25; i++) {
    const isHeldout = i > 17;
    const invId = `INV-BATCH-${100 + i}`;
    const amount = 20000 + i * 2500;
    cases.push({
      id: `CASE-SINGLE-${i}`,
      category: 'CLEAR_SINGLE',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-S${i}`,
        customer_name: `Single Promise Client ${i}`,
        original_amount: amount,
        outstanding_amount: amount,
        due_date: '2026-08-20',
        status: 'OVERDUE',
        created_at: '2026-08-01'
      },
      message: {
        id: `MSG-S${i}`,
        invoice_id: invId,
        message_text: `We will process full payment of ₹${amount.toLocaleString()} on 2026-09-05.`,
        received_at: '2026-09-01 10:00'
      },
      expected_commitments_count: 1,
      simulated_current_date: '2026-09-03'
    });
  }

  for (let i = 1; i <= 15; i++) {
    const isHeldout = i > 10;
    const invId = `INV-BATCH-${200 + i}`;
    const part1 = 30000 + i * 1000;
    const part2 = 20000 + i * 500;
    const total = part1 + part2;
    cases.push({
      id: `CASE-MULTI-${i}`,
      category: 'MULTI_PART',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-M${i}`,
        customer_name: `Multi-Part Enterprise ${i}`,
        original_amount: total,
        outstanding_amount: total,
        due_date: '2026-08-18',
        status: 'OVERDUE',
        created_at: '2026-07-28'
      },
      message: {
        id: `MSG-M${i}`,
        invoice_id: invId,
        message_text: `I will pay ₹${part1.toLocaleString()} on 2026-09-04 and balance ₹${part2.toLocaleString()} on 2026-09-08.`,
        received_at: '2026-09-01 11:30'
      },
      expected_commitments_count: 2,
      simulated_current_date: '2026-09-03'
    });
  }

  for (let i = 1; i <= 15; i++) {
    const isHeldout = i > 10;
    const invId = `INV-BATCH-${300 + i}`;
    const amt = 45000 + i * 3000;
    cases.push({
      id: `CASE-FULL-${i}`,
      category: 'FULL_FULFILLMENT',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-F${i}`,
        customer_name: `Reliable Partner ${i}`,
        original_amount: amt,
        outstanding_amount: 0,
        due_date: '2026-08-25',
        status: 'PAID',
        created_at: '2026-08-05'
      },
      message: {
        id: `MSG-F${i}`,
        invoice_id: invId,
        message_text: `Payment of ₹${amt.toLocaleString()} committed for 2026-09-02.`,
        received_at: '2026-09-01 09:00'
      },
      payments: [
        {
          id: `PAY-F${i}`,
          invoice_id: invId,
          amount: amt,
          payment_reference: `RTGS-FULL-${i}`,
          payment_date: '2026-09-02'
        }
      ],
      expected_commitments_count: 1,
      simulated_current_date: '2026-09-03'
    });
  }

  for (let i = 1; i <= 15; i++) {
    const isHeldout = i > 10;
    const invId = `INV-BATCH-${400 + i}`;
    const promised = 60000;
    const paid = 25000;
    cases.push({
      id: `CASE-PART-${i}`,
      category: 'PARTIAL_FULFILLMENT',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-P${i}`,
        customer_name: `Partial Pay Corp ${i}`,
        original_amount: promised,
        outstanding_amount: promised - paid,
        due_date: '2026-08-22',
        status: 'PARTIALLY_PAID',
        created_at: '2026-08-02'
      },
      message: {
        id: `MSG-P${i}`,
        invoice_id: invId,
        message_text: `Will clear ₹${promised.toLocaleString()} on 2026-09-02.`,
        received_at: '2026-09-01 15:00'
      },
      payments: [
        {
          id: `PAY-P${i}`,
          invoice_id: invId,
          amount: paid,
          payment_reference: `UPI-PART-${i}`,
          payment_date: '2026-09-02'
        }
      ],
      expected_commitments_count: 1,
      simulated_current_date: '2026-09-03'
    });
  }

  for (let i = 1; i <= 15; i++) {
    const isHeldout = i > 10;
    const invId = `INV-BATCH-${500 + i}`;
    const amt = 50000 + i * 2000;
    cases.push({
      id: `CASE-BROKEN-${i}`,
      category: 'BROKEN',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-B${i}`,
        customer_name: `Delinquent Co ${i}`,
        original_amount: amt,
        outstanding_amount: amt,
        due_date: '2026-08-15',
        status: 'OVERDUE',
        created_at: '2026-07-15'
      },
      message: {
        id: `MSG-B${i}`,
        invoice_id: invId,
        message_text: `Promised ₹${amt.toLocaleString()} by 2026-08-30.`,
        received_at: '2026-08-25 10:00'
      },
      expected_commitments_count: 1,
      simulated_current_date: '2026-09-03'
    });
  }

  for (let i = 1; i <= 10; i++) {
    const isHeldout = i > 7;
    const invId = `INV-BATCH-${600 + i}`;
    cases.push({
      id: `CASE-AMBIG-${i}`,
      category: 'AMBIGUOUS',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-A${i}`,
        customer_name: `Vague Ventures ${i}`,
        original_amount: 35000,
        outstanding_amount: 35000,
        due_date: '2026-08-28',
        status: 'OVERDUE',
        created_at: '2026-08-01'
      },
      message: {
        id: `MSG-A${i}`,
        invoice_id: invId,
        message_text: `I'll pay half of it next week sometime when funds arrive.`,
        received_at: '2026-09-02 12:00'
      },
      expected_commitments_count: 0,
      simulated_current_date: '2026-09-03'
    });
  }

  for (let i = 1; i <= 5; i++) {
    const isHeldout = i > 3;
    const invId = `INV-BATCH-${700 + i}`;
    cases.push({
      id: `CASE-NOCOMMIT-${i}`,
      category: 'NO_COMMITMENT',
      is_heldout: isHeldout,
      invoice: {
        id: invId,
        merchant_id: 'MERCH-01',
        customer_id: `CUST-NC${i}`,
        customer_name: `Non-Responsive Inc ${i}`,
        original_amount: 80000,
        outstanding_amount: 80000,
        due_date: '2026-08-10',
        status: 'OVERDUE',
        created_at: '2026-07-10'
      },
      message: {
        id: `MSG-NC${i}`,
        invoice_id: invId,
        message_text: `Received invoice. Forwarded to accounts payable.`,
        received_at: '2026-09-01 16:00'
      },
      expected_commitments_count: 0,
      simulated_current_date: '2026-09-03'
    });
  }

  return cases;
}
