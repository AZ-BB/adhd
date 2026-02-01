-- Add Stripe-related columns to payments (keep Paymob columns for historical data)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);
