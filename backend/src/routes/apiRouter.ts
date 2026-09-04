import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { commitEngineBackend } from '../engine/commitEngine';
import { razorpayService } from '../services/razorpayService';

const router = Router();

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'COMMIT B2B Receivables Recovery Engine',
    version: '1.2.0',
    simulated_date: db.getCurrentDate(),
    timestamp: new Date().toISOString()
  });
});

// GET /api/dashboard
router.get('/dashboard', (_req: Request, res: Response) => {
  const invoices = db.getInvoices();
  const commitments = db.getCommitments();
  const payments = db.getPayments();
  const exceptions = db.getExceptions();
  const batch = commitEngineBackend.runBatchEvaluation();

  res.json({
    total_overdue: invoices.reduce((s, i) => s + i.outstanding_amount, 0),
    total_promised: commitments.reduce((s, c) => s + c.promised_amount, 0),
    verified_paid: payments.reduce((s, p) => s + p.amount, 0),
    agent_recovered: batch.agent_recovered,
    active_commitments: commitments.filter(c => c.status === 'ACTIVE').length,
    broken_commitments: commitments.filter(c => c.status === 'BROKEN').length,
    exceptions: exceptions.filter(e => e.status === 'NEEDS_REVIEW').length
  });
});

// GET /api/invoices
router.get('/invoices', (_req: Request, res: Response) => {
  res.json(db.getInvoices());
});

// GET /api/invoices/:id
router.get('/invoices/:id', (req: Request, res: Response) => {
  const inv = db.getInvoices().find(i => i.id === req.params.id);
  if (!inv) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json(inv);
});

// GET /api/commitments
router.get('/commitments', (_req: Request, res: Response) => {
  res.json(db.getCommitments());
});

// POST /api/commitments/extract
router.post('/commitments/extract', (req: Request, res: Response) => {
  const { invoice_id, text_snippet } = req.body;
  const invoices = db.getInvoices();
  const inv = invoices.find(i => i.id === invoice_id) || invoices[0];
  const result = commitEngineBackend.extractCommitmentsFromText(text_snippet || '', inv);
  res.json(result);
});

// GET /api/exceptions
router.get('/exceptions', (_req: Request, res: Response) => {
  res.json(db.getExceptions());
});

// POST /api/exceptions/:id/resolve
router.post('/exceptions/:id/resolve', (req: Request, res: Response) => {
  const exc = db.getExceptions().find(e => e.id === req.params.id);
  if (!exc) {
    return res.status(404).json({ error: 'Exception case not found' });
  }
  exc.status = 'RESOLVED';
  db.addAuditLog('COMMITMENT', exc.id, 'EXCEPTION_RESOLVED_MANUAL', 'NEEDS_REVIEW', 'RESOLVED', 'RESOLVE', 'AR Manager manually reviewed and resolved exception case.');
  res.json({ success: true, exception: exc });
});

// GET /api/audit
router.get('/audit', (_req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// POST /api/messages
router.post('/messages', (req: Request, res: Response) => {
  const { invoice_id, message_text } = req.body;
  if (!invoice_id || !message_text) {
    return res.status(400).json({ error: 'invoice_id and message_text are required' });
  }
  const result = commitEngineBackend.processCustomerMessage(invoice_id, message_text);
  res.json(result);
});

// POST /api/payments
router.post('/payments', (req: Request, res: Response) => {
  const { invoice_id, amount, reference, payment_date } = req.body;
  if (!invoice_id || !amount || !reference) {
    return res.status(400).json({ error: 'invoice_id, amount, and reference are required' });
  }
  const result = commitEngineBackend.ingestPayment(invoice_id, amount, reference, payment_date);
  res.json(result);
});

// POST /api/payments/create-order/:invoice_id
router.post('/payments/create-order/:invoice_id', async (req: Request, res: Response) => {
  const invoiceId = req.params.invoice_id;
  const inv = db.getInvoices().find(i => i.id === invoiceId);

  if (!inv) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  if (inv.outstanding_amount <= 0) {
    return res.status(400).json({ error: 'Invoice is already fully paid' });
  }

  try {
    const order = await razorpayService.createOrder(inv.id, inv.outstanding_amount);
    inv.razorpay_order_id = order.id;
    db.saveStore();

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_commit_demo_key',
      invoice_id: inv.id
    });
  } catch (err: any) {
    console.error('Error creating Razorpay Order:', err);
    return res.status(500).json({ error: 'Failed to create Razorpay Order' });
  }
});

// POST /api/payments/simulate-webhook
router.post('/payments/simulate-webhook', (req: Request, res: Response) => {
  const { invoice_id, razorpay_order_id, amount } = req.body;
  const inv = db.getInvoices().find(i => i.id === invoice_id);

  if (!inv) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const orderId = razorpay_order_id || inv.razorpay_order_id || `order_${Math.random().toString(36).substring(2, 14)}`;
  const paymentId = `pay_${Math.random().toString(36).substring(2, 14)}`;
  const eventId = `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const amountInPaise = amount ? Math.round(amount * 100) : Math.round(inv.outstanding_amount * 100);

  const webhookBody = {
    event: 'payment.captured',
    event_id: eventId,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: amountInPaise,
          currency: 'INR',
          status: 'captured',
          notes: { commit_invoice_id: inv.id }
        }
      }
    }
  };

  const rawBody = JSON.stringify(webhookBody);
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'commit_webhook_secret_key_12345';
  const signature = razorpayService.generateWebhookSignature(rawBody, secret);

  const result = commitEngineBackend.processRazorpayPaymentCaptured(webhookBody, eventId);

  return res.json({
    success: true,
    message: 'Razorpay payment.captured webhook processed successfully!',
    payment_id: paymentId,
    order_id: orderId,
    signature,
    result
  });
});

// POST /api/webhooks/razorpay
router.post('/webhooks/razorpay', (req: Request, res: Response) => {
  const signature = (req.headers['x-razorpay-signature'] as string) || '';
  const eventId = (req.headers['x-razorpay-event-id'] as string) || req.body?.event_id || `evt_${Date.now()}`;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'commit_webhook_secret_key_12345';

  const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

  // Verify HMAC SHA256 signature
  const isValid = razorpayService.verifyWebhookSignature(rawBody, signature, webhookSecret);

  if (!isValid) {
    db.addAuditLog(
      'WEBHOOK',
      eventId || 'INVALID',
      'WEBHOOK_SIGNATURE_INVALID',
      undefined,
      'REJECTED',
      'REJECT_SIGNATURE',
      'Razorpay webhook HMAC signature verification failed. Event processing rejected.'
    );

    return res.status(400).json({
      error: 'Invalid Razorpay webhook signature',
      code: 'WEBHOOK_SIGNATURE_INVALID'
    });
  }

  // Idempotency check
  if (db.isWebhookProcessed(eventId)) {
    db.addAuditLog(
      'WEBHOOK',
      eventId,
      'DUPLICATE_WEBHOOK_IGNORED',
      undefined,
      'IGNORED',
      'SKIP_DUPLICATE',
      `Duplicate webhook event ${eventId} received and safely ignored.`
    );
    return res.status(200).json({
      status: 'ignored',
      reason: 'Duplicate event ID',
      event_id: eventId
    });
  }

  const eventType = req.body?.event;

  if (eventType === 'payment.captured') {
    const result = commitEngineBackend.processRazorpayPaymentCaptured(req.body?.payload || req.body, eventId);
    return res.status(200).json(result);
  }

  if (eventId) db.markWebhookProcessed(eventId);
  return res.status(200).json({
    status: 'ignored',
    message: `Event '${eventType}' ignored for MVP`,
    event_id: eventId
  });
});

// POST /api/simulation/date
router.post('/simulation/date', (req: Request, res: Response) => {
  const { new_date } = req.body;
  if (!new_date) {
    return res.status(400).json({ error: 'new_date is required' });
  }
  commitEngineBackend.setSimulatedDate(new_date);
  res.json({ success: true, current_date: db.getCurrentDate() });
});

// POST /api/simulation/reset
router.post('/simulation/reset', (_req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ success: true, current_date: db.getCurrentDate(), message: 'Simulation reset to default initial state.' });
});

// GET /api/batch/evaluate
router.get('/batch/evaluate', (_req: Request, res: Response) => {
  res.json(commitEngineBackend.runBatchEvaluation());
});

// GET /api/policy
router.get('/policy', (_req: Request, res: Response) => {
  res.json(db.getPolicyConfig());
});

// PUT /api/policy
router.put('/policy', (req: Request, res: Response) => {
  db.updatePolicyConfig(req.body);
  res.json({ success: true, policy: db.getPolicyConfig() });
});

export default router;
