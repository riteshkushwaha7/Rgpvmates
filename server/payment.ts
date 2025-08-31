import { Router } from 'express';
import Razorpay from 'razorpay';
import { db } from './db.js';
import { users, payments } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// Initialize Razorpay lazily when first needed
let razorpay: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not found in environment variables');
      console.error('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
      console.error('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');
      throw new Error('Razorpay credentials are required. Please check your .env file.');
    }

    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log('✅ Razorpay initialized successfully');
  }
  return razorpay;
}

// Payment status check
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured',
    },
  });
});

// Create payment order
router.post('/create-order', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { amount } = req.body;

    // Create Razorpay order
    const order = await getRazorpayInstance().orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Save payment record
    const [payment] = await db.insert(payments).values({
      userId: req.session.userId,
      amount,
      status: 'pending',
      razorpayPaymentId: order.id,
    }).returning();

    res.json({
      orderId: order.id,
      paymentId: payment.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status
    await db.update(payments)
      .set({
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        updatedAt: new Date(),
      })
      .where(eq(payments.razorpayPaymentId, razorpay_order_id));

    // Update user payment status
    await db.update(users)
      .set({
        paymentDone: true,
        paymentId: razorpay_payment_id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.session.userId));

    res.json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Premium bypass for testing
router.post('/bypass', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Update user payment status
    await db.update(users)
      .set({
        paymentDone: true,
        premiumBypassed: true,
        paymentId: 'BYPASS',
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.session.userId));

    res.json({ message: 'Premium bypassed successfully' });
  } catch (error) {
    console.error('Premium bypass error:', error);
    res.status(500).json({ error: 'Failed to bypass premium' });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const paymentHistory = await db.select().from(payments)
      .where(eq(payments.userId, req.session.userId))
      .orderBy(payments.createdAt);

    res.json(paymentHistory);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

export { router as paymentRoutes };
