const express = require('express');
const { authenticate } = require('../middleware/auth');
const { initializePayment, handleWebhook, getPaymentStatus } = require('../controllers/paymentController');

const router = express.Router();

// Note: webhook must NOT go through authenticate (Paystack calls it directly,
// no user is logged in) and needs the raw body - that's handled in app.js.
router.post('/webhook', handleWebhook);

router.post('/initialize', authenticate, initializePayment);
router.get('/:orderId/status', authenticate, getPaymentStatus);

module.exports = router;
