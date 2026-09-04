export type InvoiceStatus = 'OPEN' | 'OVERDUE' | 'PARTIALLY_PAID' | 'PAID';

export type CommitmentStatus = 
  | 'CREATED'
  | 'ACTIVE'
  | 'FULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'BROKEN'
  | 'RECOVERY_PENDING'
  | 'RECOVERY_EXECUTED'
  | 'STOPPED'
  | 'NEEDS_REVIEW';

export type RecoveryActionType = 'WAIT' | 'SEND_REMINDER' | 'ESCALATE' | 'STOP' | 'BLOCK';

export type ExceptionType = 
  | 'AMBIGUOUS_DEADLINE'
  | 'AMBIGUOUS_AMOUNT'
  | 'EXCEEDS_INVOICE_AMOUNT'
  | 'DUPLICATE_COMMITMENT'
  | 'UNMATCHED_PAYMENT'
  | 'LOW_CONFIDENCE'
  | 'MALFORMED_OUTPUT';

export interface Invoice {
  id: string; // e.g., INV-1001
  merchant_id: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  original_amount: number;
  outstanding_amount: number;
  due_date: string; // YYYY-MM-DD
  status: InvoiceStatus;
  created_at: string;
  razorpay_order_id?: string;
}

export interface CustomerMessage {
  id: string;
  invoice_id: string;
  message_text: string;
  received_at: string;
}

export interface Commitment {
  id: string;
  invoice_id: string;
  source_message_id?: string;
  promised_amount: number;
  remaining_amount: number;
  deadline: string; // YYYY-MM-DD
  status: CommitmentStatus;
  confidence: number;
  source_text: string;
  created_at: string;
  updated_at: string;
  reminder_count: number;
  part_index?: number;
  total_parts?: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_reference: string;
  payment_date: string; // YYYY-MM-DD
  matched_commitment_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_event_id?: string;
}

export interface RecoveryAction {
  id: string;
  commitment_id: string;
  invoice_id: string;
  action_type: RecoveryActionType;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'BLOCKED';
  reason: string[];
  executed_at: string;
  simulated_payload?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  entity_type: 'INVOICE' | 'MESSAGE' | 'COMMITMENT' | 'PAYMENT' | 'RECOVERY_ACTION' | 'POLICY' | 'WEBHOOK';
  entity_id: string;
  event_type: string;
  previous_state?: string;
  new_state?: string;
  decision?: string;
  reason?: string;
  policy_version?: string;
}

export interface ExceptionCase {
  id: string;
  invoice_id: string;
  commitment_id?: string;
  exception_type: ExceptionType;
  raw_message: string;
  reason: string;
  status: 'NEEDS_REVIEW' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface ExtractionResult {
  commitments: Array<{
    amount: number;
    deadline: string;
    confidence: number;
    text_snippet: string;
  }>;
  ambiguities: string[];
  is_valid: boolean;
  refusal_reason?: string;
}

export interface PolicyConfig {
  max_reminders: number;
  minimum_hours_between_reminders: number;
  auto_action_confidence_threshold: number;
  allow_duplicate_actions: boolean;
}

export interface BatchMetrics {
  total_cases: number;
  dev_cases: number;
  heldout_cases: number;
  extraction_accuracy: number;
  amount_accuracy: number;
  deadline_accuracy: number;
  payment_matching_accuracy: number;
  state_transition_accuracy: number;
  total_overdue: number;
  total_promised: number;
  verified_paid: number;
  agent_recovered: number;
  baseline_recovered: number;
  incremental_recovery: number;
  recovery_rate: number;
  active_commitments_count: number;
  broken_commitments_count: number;
  exceptions_count: number;
}
