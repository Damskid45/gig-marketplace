const crypto = require('crypto');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initializes a transaction with Paystack and returns the authorization URL
// the client should redirect the buyer to.
async function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || 'Failed to initialize Paystack transaction');
  }
  return data.data; // { authorization_url, access_code, reference }
}

// Verifies a transaction directly with Paystack (used as a fallback/manual check,
// separate from webhook-based confirmation).
async function verifyTransaction(reference) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || 'Failed to verify Paystack transaction');
  }
  return data.data;
}

// Verifies that a webhook payload actually came from Paystack by recomputing
// the HMAC SHA512 signature with our secret key and comparing it to the
// x-paystack-signature header. This prevents attackers from forging "payment
// successful" events.
function isValidWebhookSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const hash = crypto.createHmac('sha512', SECRET_KEY).update(rawBody).digest('hex');
  return hash === signatureHeader;
}

module.exports = { initializeTransaction, verifyTransaction, isValidWebhookSignature };
