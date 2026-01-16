-- ============================================
-- Payments & Subscriptions Module
-- ============================================

-- Payment status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded');
    END IF;
END$$;

-- Subscription type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
        CREATE TYPE subscription_type AS ENUM ('games', 'group_sessions', 'individual_session');
    END IF;
END$$;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    paymob_order_id VARCHAR(255) UNIQUE, -- Paymob order ID
    paymob_transaction_id VARCHAR(255) UNIQUE, -- Paymob transaction ID
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EGP', -- EGP or AED
    status payment_status DEFAULT 'pending' NOT NULL,
    payment_method VARCHAR(50), -- card, wallet, etc.
    subscription_type subscription_type NOT NULL,
    package_id INT, -- Reference to package (1 = Games, 2 = Group Sessions, etc.)
    metadata JSONB, -- Store additional payment data
    paymob_response JSONB, -- Store full Paymob response
    error_message TEXT,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    payment_id INT REFERENCES payments(id) ON DELETE SET NULL,
    subscription_type subscription_type NOT NULL,
    package_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- active, expired, cancelled
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EGP'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paymob_order ON payments(paymob_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_paymob_transaction ON payments(paymob_transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_type ON subscriptions(subscription_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- Unique constraint: One active subscription per user per subscription_type per package_id
-- This ensures users can only have one active subscription of each type/package combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_unique_active 
    ON subscriptions(user_id, subscription_type, package_id) 
    WHERE status = 'active';

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at_trg
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

CREATE TRIGGER update_subscriptions_updated_at_trg
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = payments.user_id
            AND users.auth_id = auth.uid()
        )
    );

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = subscriptions.user_id
            AND users.auth_id = auth.uid()
        )
    );

-- Note: Service role bypasses RLS automatically when using service_role key
-- These policies are not needed as service role operations bypass RLS
-- API routes using service role will have full access without these policies
