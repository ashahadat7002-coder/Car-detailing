const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment amount.',
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required.',
      });
    }

    const options = {
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        bookingId: String(bookingId),
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create order.',
      error:error.message||'Unknown error'
    });
  }
});

// 2. Verify Razorpay Payment Signature
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required payment details are missing.',
      });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac(
        'sha256',
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(sign)
      .digest('hex');

    // Compare signatures safely
    const expectedBuffer = Buffer.from(expectedSign, 'hex');
    const receivedBuffer = Buffer.from(
      razorpay_signature,
      'hex'
    );

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature.',
      });
    }

    // Signature verified successfully
    return res.status(200).json({
      success: true,
      message: 'Payment signature verified successfully.',
    });
  } catch (error) {
    console.error('Payment Verification Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
    });
  }
});

module.exports = router;


