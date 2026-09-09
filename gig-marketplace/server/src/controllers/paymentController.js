const crypto = require('crypto');
const { Order, Payment, User, Gig } = require('../models');
const { initializeTransaction, isValidWebhookSignature } = require('../utils/paystack');

// POST /api/payments/initialize  { orderId }
// Starts a Paystack transaction for an existing order and returns the
// checkout URL the frontend should redirect the buyer to.
async function initializePayment(req, res, next) {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId, { include: [Payment] });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the buyer can pay for this order' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'This order has already been paid for' });
    }

    const buyer = await User.findByPk(req.user.id);
    const reference = `ply_${order.id}_${crypto.randomBytes(4).toString('hex')}`;
    const amountKobo = Math.round(Number(order.price) * 100);

    // Create (or reuse) our local Payment record BEFORE calling Paystack,
    // in 'pending' state, so we have a record even if the webhook is delayed.
    const payment = await Payment.create({
      orderId: order.id,
      reference,
      amount: amountKobo,
      status: 'pending',
    });

    const { authorization_url: authorizationUrl } = await initializeTransaction({
      email: buyer.email,
      amountKobo,
      reference,
      callbackUrl: `${process.env.CLIENT_URL}/orders/${order.id}`,
      metadata: { orderId: order.id, paymentId: payment.id },
    });

    res.json({ authorizationUrl, reference });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/webhook
// Paystack calls this after a payment event. Must be idempotent: Paystack
// can send the same event more than once (retries on timeout), so we only
// act the first time we see a given reference move to 'success'.
async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-paystack-signature'];
    // req.body is a raw Buffer here because this route is mounted with
    // express.raw() in app.js, ahead of express.json().
    const rawBody = req.body;

    if (!isValidWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));

    if (event.event === 'charge.success') {
      const { reference, paid_at: paidAt } = event.data;

      const payment = await Payment.findOne({ where: { reference } });
      if (!payment) {
        // Unknown reference - acknowledge so Paystack stops retrying, but do nothing.
        return res.status(200).json({ received: true });
      }

      // Idempotency guard: if we've already marked this payment as successful,
      // skip re-processing (e.g. don't double-notify, don't re-flip order state).
      if (payment.status === 'success') {
        return res.status(200).json({ received: true, alreadyProcessed: true });
      }

      await payment.update({ status: 'success', paidAt: paidAt || new Date() });
      await Order.update({ isPaid: true }, { where: { id: payment.orderId } });
    }

    // Always return 200 quickly so Paystack doesn't retry unnecessarily.
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/:orderId/status - lets the frontend poll after redirect back
async function getPaymentStatus(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.orderId, { include: [Payment, Gig] });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isBuyer = order.buyerId === req.user.id;
    const isFreelancer = order.Gig?.freelancerId === req.user.id;
    if (!isBuyer && !isFreelancer && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({
      isPaid: order.isPaid,
      payment: order.Payment
        ? { status: order.Payment.status, reference: order.Payment.reference, paidAt: order.Payment.paidAt }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { initializePayment, handleWebhook, getPaymentStatus };
