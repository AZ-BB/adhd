-- Add contact_phone and payment_id to solo_session_requests for "request + pay" flow
ALTER TABLE solo_session_requests
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS payment_id INT REFERENCES payments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_solo_requests_payment ON solo_session_requests(payment_id);
