import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { db } from '../db/store';
import { commitEngineBackend } from '../engine/commitEngine';
import { razorpayService } from '../services/razorpayService';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING COMMIT - RAZORPAY INTEGRATION AUTOMATED TEST SUITE');
  console.log('===============================================================\n');

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'commit_webhook_secret_key_12345';
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] Test ${totalTests}: ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] Test ${totalTests}: ${testName}`);
      if (detail) console.error(`   └─ FAILURE DETAIL: ${detail}`);
    }
  }

  // Reset database before test run
  db.resetToDefaults();

  // Test 1: Webhook HMAC Signature Verification
  console.log('--- 1. Testing Webhook HMAC Signature Verification ---');
  const samplePayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_001',
          order_id: 'order_test_1001',
          amount: 5000000, // ₹50,000 in paise
          currency: 'INR',
          status: 'captured',
          notes: { commit_invoice_id: 'INV-1001' }
        }
      }
    }
  });

  const validSignature = razorpayService.generateWebhookSignature(samplePayload, webhookSecret);
  const isValidSig = razorpayService.verifyWebhookSignature(samplePayload, validSignature, webhookSecret);
  assert(isValidSig === true, 'Valid Razorpay HMAC SHA256 Signature Verification', `Signature: ${validSignature.substring(0, 16)}...`);

  // Test 2: Invalid Signature Rejection
  console.log('\n--- 2. Testing Invalid Signature Rejection ---');
  const invalidSig = 'invalid_signature_hash_1234567890abcdef';
  const isInvalidSigRejected = razorpayService.verifyWebhookSignature(samplePayload, invalidSig, webhookSecret);
  assert(isInvalidSigRejected === false, 'Invalid Razorpay Signature Rejection', 'Invalid signature rejected as expected.');

  // Setup Invoice & Commitment for Partial Payment Test
  console.log('\n--- 3. Testing Razorpay Order Creation & Partial Payment ---');
  const invoice1 = db.getInvoices().find(i => i.id === 'INV-1001');
  if (!invoice1) throw new Error('INV-1001 not found');

  // Create Razorpay Order server side
  const order1 = await razorpayService.createOrder(invoice1.id, invoice1.outstanding_amount);
  invoice1.razorpay_order_id = order1.id;
  db.saveStore();
  assert(invoice1.razorpay_order_id === order1.id, 'Razorpay Order Creation & Invoice Mapping', `Mapped Order ID ${order1.id} to INV-1001`);

  const partialPaymentPaise = 5000000; // ₹50,000 in paise (against ₹1,50,000 original)

  const webhookEvent1 = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_rzp_test_50k',
          order_id: order1.id,
          amount: partialPaymentPaise,
          currency: 'INR',
          status: 'captured',
          notes: { commit_invoice_id: 'INV-1001' }
        }
      }
    }
  };

  const res1 = commitEngineBackend.processRazorpayPaymentCaptured(webhookEvent1, 'evt_test_001');
  assert(res1.success === true && res1.status === 'PAYMENT_PROCESSED', 'Partial Payment Processed Successfully', `Processed ₹50,000 against ₹1,50,000 invoice`);

  const updatedInv1 = db.getInvoices().find(i => i.id === 'INV-1001');
  assert(updatedInv1?.outstanding_amount === 100000, 'Invoice Outstanding Amount Safely Updated', `New Outstanding: ₹${updatedInv1?.outstanding_amount}`);
  assert(updatedInv1?.status === 'PARTIALLY_PAID', 'Invoice Status Changed to PARTIALLY_PAID', `Status: ${updatedInv1?.status}`);

  const comm1 = db.getCommitments().find(c => c.id === 'COMM-501');
  assert(comm1?.status === 'PARTIALLY_FULFILLED' && comm1?.remaining_amount === 100000, 'Matched Commitment 1 Partially Fulfilled', `COMM-501 status: ${comm1?.status}, remaining: ₹${comm1?.remaining_amount}`);

  // Test 4: Idempotency / Duplicate Webhook Event
  console.log('\n--- 4. Testing Duplicate Webhook Idempotency ---');
  const resDuplicate = commitEngineBackend.processRazorpayPaymentCaptured(webhookEvent1, 'evt_test_001');
  assert(resDuplicate.status === 'DUPLICATE_WEBHOOK_IGNORED', 'Duplicate Webhook Event Ignored Idempotently', `Duplicate event ID evt_test_001 received HTTP 200 / ignored`);
  const postDupInv = db.getInvoices().find(i => i.id === 'INV-1001');
  assert(postDupInv?.outstanding_amount === 100000, 'Outstanding Amount Unchanged on Duplicate Event', `Outstanding remains ₹1,00,000`);

  // Test 5: Full Payment Completion
  console.log('\n--- 5. Testing Remaining Payment Completion (Full Payment) ---');
  const remainingPaymentPaise = 10000000; // ₹1,00,000 in paise
  const webhookEvent2 = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_rzp_test_100k',
          order_id: order1.id,
          amount: remainingPaymentPaise,
          currency: 'INR',
          status: 'captured',
          notes: { commit_invoice_id: 'INV-1001' }
        }
      }
    }
  };

  const res2 = commitEngineBackend.processRazorpayPaymentCaptured(webhookEvent2, 'evt_test_002');
  assert(res2.success === true, 'Full Payment Webhook Processed', `Processed ₹1,00,000 final payment`);

  const finalInv1 = db.getInvoices().find(i => i.id === 'INV-1001');
  assert(finalInv1?.outstanding_amount === 0, 'Invoice Outstanding Balance is ₹0', `Outstanding: ₹${finalInv1?.outstanding_amount}`);
  assert(finalInv1?.status === 'PAID', 'Invoice Status Updated to PAID', `Status: ${finalInv1?.status}`);

  const comm1Final = db.getCommitments().find(c => c.id === 'COMM-501');
  assert(comm1Final?.status === 'FULFILLED', 'Matched Commitment Fully Fulfilled', `COMM-501 final status: ${comm1Final?.status}`);

  // Test 6: Unmatched Payment Exception Handling
  console.log('\n--- 6. Testing Unmatched Payment Exception Handling ---');
  const unmatchedWebhookEvent = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_unmatched_999',
          order_id: 'order_non_existent_999999',
          amount: 1500000, // ₹15,000
          currency: 'INR',
          status: 'captured',
          notes: {}
        }
      }
    }
  };

  const resUnmatched = commitEngineBackend.processRazorpayPaymentCaptured(unmatchedWebhookEvent, 'evt_unmatched_001');
  assert(resUnmatched.success === false && resUnmatched.status === 'PAYMENT_UNMATCHED', 'Unmatched Payment Triggers PAYMENT_UNMATCHED', `Handled unmatched payment safely`);

  const excCase = db.getExceptions().find(e => e.exception_type === 'UNMATCHED_PAYMENT');
  assert(!!excCase, 'Unmatched Payment Exception Record Created', `Exception ID: ${excCase?.id}, Status: ${excCase?.status}`);

  // Test 7: Audit Trail Event Integrity
  console.log('\n--- 7. Testing Audit Trail Event Integrity ---');
  const auditLogs = db.getAuditLogs();

  const hasWebhookReceived = auditLogs.some(l => l.event_type === 'WEBHOOK_RECEIVED');
  const hasSigVerified = auditLogs.some(l => l.event_type === 'WEBHOOK_SIGNATURE_VERIFIED');
  const hasPaymentMatched = auditLogs.some(l => l.event_type === 'PAYMENT_MATCHED_TO_INVOICE');
  const hasCommitmentPartiallyFulfilled = auditLogs.some(l => l.event_type === 'COMMITMENT_PARTIALLY_FULFILLED');
  const hasCommitmentFulfilled = auditLogs.some(l => l.event_type === 'COMMITMENT_FULFILLED');
  const hasInvoicePartiallyPaid = auditLogs.some(l => l.event_type === 'INVOICE_PARTIALLY_PAID');
  const hasInvoicePaid = auditLogs.some(l => l.event_type === 'INVOICE_PAID');
  const hasDuplicateIgnored = auditLogs.some(l => l.event_type === 'DUPLICATE_WEBHOOK_IGNORED');
  const hasUnmatchedLog = auditLogs.some(l => l.event_type === 'PAYMENT_UNMATCHED');

  assert(
    hasWebhookReceived &&
      hasSigVerified &&
      hasPaymentMatched &&
      hasCommitmentPartiallyFulfilled &&
      hasCommitmentFulfilled &&
      hasInvoicePartiallyPaid &&
      hasInvoicePaid &&
      hasDuplicateIgnored &&
      hasUnmatchedLog,
    'All Required Audit Trail Events Generated',
    `Verified presence of WEBHOOK_RECEIVED, WEBHOOK_SIGNATURE_VERIFIED, PAYMENT_MATCHED_TO_INVOICE, COMMITMENT_PARTIALLY_FULFILLED, COMMITMENT_FULFILLED, INVOICE_PARTIALLY_PAID, INVOICE_PAID, DUPLICATE_WEBHOOK_IGNORED, PAYMENT_UNMATCHED`
  );

  console.log('\n===============================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY`);
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
