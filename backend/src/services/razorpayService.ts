import crypto from 'crypto';

export class RazorpayService {
  /**
   * Verify Razorpay Webhook Signature using HMAC SHA256 against exact raw request body.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string, secret: string): boolean {
    if (!rawBody || !signature || !secret) {
      return false;
    }

    try {
      const bodyBuffer = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyBuffer)
        .digest('hex');

      const sigBuffer = Buffer.from(signature, 'utf-8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (e) {
      console.error('Error verifying Razorpay webhook signature:', e);
      return false;
    }
  }

  /**
   * Helper to generate a signature (useful for testing and verification)
   */
  public generateWebhookSignature(rawBody: string | Buffer, secret: string): string {
    const bodyBuffer = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody;
    return crypto
      .createHmac('sha256', secret)
      .update(bodyBuffer)
      .digest('hex');
  }

  /**
   * Create a Razorpay Test Mode order server-side.
   */
  public async createOrder(invoiceId: string, amountInRupees: number): Promise<{
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    notes: Record<string, string>;
  }> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(amountInRupees * 100);
    const receipt = `rcpt_${invoiceId}_${Date.now().toString().slice(-6)}`;
    const notes = { commit_invoice_id: invoiceId };

    if (keyId && keySecret && !keyId.includes('demo') && !keySecret.includes('demo')) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt,
            notes
          })
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          return data;
        }
      } catch (err) {
        console.warn('Failed to call Razorpay live API, generating local Test Mode Order:', err);
      }
    }

    // Standard local fallback for Test Mode simulation
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      notes
    };
  }
}

export const razorpayService = new RazorpayService();
