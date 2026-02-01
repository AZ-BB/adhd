# Stripe Payment Integration Setup

This app uses **Stripe Checkout** for payments. Customers are redirected to Stripe’s hosted checkout page and return to your site on success or cancel.

## Environment variables

Add to `.env.local` (and your production env):

```env
# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_test_...   # or sk_live_... in production
STRIPE_WEBHOOK_SECRET=whsec_... # from Stripe Dashboard > Developers > Webhooks

# Optional: used for success/cancel URLs when creating Checkout Sessions
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

- **STRIPE_SECRET_KEY**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → API Keys.
- **STRIPE_WEBHOOK_SECRET**: [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → Add endpoint → select `checkout.session.completed` → copy “Signing secret”.

## Database migration

Run the Stripe payments migration so the `payments` table has Stripe fields:

```bash
npx supabase migration up
# or apply supabase/migrations/20251228000000_add_stripe_payments.sql manually
```

This adds `stripe_checkout_session_id` (and optional `stripe_payment_intent_id`) to `payments`. Existing Paymob columns are kept for old data.

## Webhook configuration

1. In Stripe Dashboard go to **Developers → Webhooks**.
2. **Add endpoint**.
3. **Endpoint URL**: `https://yourdomain.com/api/payments/stripe-webhook`
4. **Events to send**: enable `checkout.session.completed`.
5. Create the endpoint and copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

The webhook:

- Verifies the `Stripe-Signature` header.
- On `checkout.session.completed`, finds the payment by `client_reference_id` (payment id), marks it successful, creates/extends the subscription, and marks solo session requests as paid when applicable.

## Flow summary

1. **Create payment**  
   User chooses a plan or solo session → `POST /api/payments/create` → a row is inserted in `payments` and a Stripe Checkout Session is created.

2. **Redirect to Stripe**  
   Frontend redirects the user to the Session’s `url` (Stripe Checkout).

3. **Success**  
   Stripe redirects to `NEXT_PUBLIC_APP_URL/payment/result?status=success&session_id={CHECKOUT_SESSION_ID}`.  
   Stripe also sends `checkout.session.completed` to your webhook; the webhook updates the payment and subscription/solo session.

4. **Cancel**  
   Stripe redirects to `NEXT_PUBLIC_APP_URL/payment/result?status=cancelled`.

## Supported currencies

Stripe is used with the currency chosen on the pricing page (e.g. **USD**, **EGP**). No conversion is done in the app; amounts are sent to Stripe in the selected currency.

## Testing

- Use [Stripe test keys](https://dashboard.stripe.com/test/apikeys) and test cards (e.g. `4242 4242 4242 4242`).
- For local webhook testing use [Stripe CLI](https://stripe.com/docs/stripe-cli):  
  `stripe listen --forward-to localhost:3000/api/payments/stripe-webhook`  
  and set `STRIPE_WEBHOOK_SECRET` to the CLI’s secret.

## Paymob (legacy)

- **Callback** `GET /api/payments/callback` is still used for old Paymob redirects (query params: `success`, `order`, `id`).
- **Webhook** `POST /api/payments/webhook` is for Paymob HMAC callbacks.
- New payments are created with Stripe only; Paymob env vars are not required for the Stripe flow.
