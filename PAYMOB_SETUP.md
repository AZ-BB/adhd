# Paymob Payment Integration Setup Guide

This document explains how to set up Paymob payment integration for the application.

## Prerequisites

1. A Paymob merchant account
2. Access to Paymob dashboard
3. API credentials from Paymob

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Paymob API Configuration
PAYMOB_API_KEY=your_paymob_api_key_here
PAYMOB_HMAC_SECRET=your_paymob_hmac_secret_here
PAYMOB_INTEGRATION_ID=your_integration_id_here
PAYMOB_IFRAME_ID=your_iframe_id_here
PAYMOB_BASE_URL=https://accept.paymob.com/api
```

### How to Get These Values

1. **PAYMOB_API_KEY**: 
   - Log in to your Paymob dashboard
   - Navigate to Settings > API Keys
   - Copy your API Key

2. **PAYMOB_HMAC_SECRET**:
   - In Paymob dashboard, go to Settings > Security
   - Find your HMAC Secret (used for webhook verification)
   - Copy the secret value

3. **PAYMOB_INTEGRATION_ID**:
   - Go to Settings > Integrations
   - Select your payment method integration (e.g., Card Payment)
   - Copy the Integration ID

4. **PAYMOB_IFRAME_ID**:
   - In Settings > Integrations
   - Find your iframe ID (used for hosted payment form)
   - Copy the iframe ID

5. **PAYMOB_BASE_URL**:
   - For production: `https://accept.paymob.com/api`
   - For testing: `https://accept.paymob.com/api` (Paymob uses the same URL, but test mode is controlled in dashboard)

## Webhook Configuration

1. Log in to your Paymob dashboard
2. Navigate to Settings > Webhooks
3. Add a new webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Enable the webhook for transaction events
5. Save the HMAC secret (this should match `PAYMOB_HMAC_SECRET`)

## Database Migration

Run the database migration to create the payments and subscriptions tables:

```bash
# If using Supabase CLI
supabase migration up

# Or apply the migration manually through Supabase dashboard
```

The migration file is located at:
```
supabase/migrations/20251204000000_create_payments_module.sql
```

## Testing

### Test Mode

1. Enable test mode in your Paymob dashboard
2. Use test card numbers provided by Paymob
3. Test the complete payment flow:
   - Create payment intent
   - Complete payment in iframe
   - Verify webhook receives callback
   - Check subscription is created

### Test Cards

Paymob provides test card numbers in their dashboard. Common test cards:
- Success: Use the test card provided in Paymob dashboard
- Failure: Use invalid card details

## Payment Flow

1. **User selects package** on pricing page
2. **Payment intent created** via `/api/payments/create`
3. **User redirected** to `/payment/checkout` with Paymob iframe
4. **User completes payment** in iframe
5. **Paymob redirects** to `/api/payments/callback`
6. **Webhook received** at `/api/payments/webhook`
7. **Payment status updated** and subscription created
8. **User redirected** to `/payment/result` with status

## API Routes

### POST `/api/payments/create`
Creates a payment intent with Paymob.

**Request Body:**
```json
{
  "packageId": 1,
  "subscriptionType": "games",
  "amount": 299,
  "currency": "EGP"
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": 123,
  "iframeUrl": "https://accept.paymob.com/api/acceptance/iframes/...",
  "paymentToken": "...",
  "orderId": 456
}
```

### POST `/api/payments/webhook`
Handles Paymob webhook callbacks. This endpoint verifies HMAC signatures and updates payment status.

### GET `/api/payments/callback`
Handles payment redirect callbacks from Paymob and redirects users to the result page.

## Subscription Types

### Monthly Subscriptions
- `games`: Games Package subscription (monthly, creates/updates subscription)
- `group_sessions`: Group Sessions Package subscription (monthly, creates/updates subscription)

### One-Time Purchases
- `individual_session`: Individual session purchase (one-time purchase, does NOT create subscription)
  - Payment is recorded in the `payments` table
  - No subscription entry is created
  - Use `hasPurchasedIndividualSession()` or `getIndividualSessionPurchaseCount()` to check purchases

## Troubleshooting

### Payment Intent Creation Fails
- Check API key is correct
- Verify integration ID is valid
- Ensure billing data is complete

### Webhook Not Receiving Callbacks
- Verify webhook URL is correctly configured in Paymob dashboard
- Check HMAC secret matches
- Ensure webhook endpoint is publicly accessible
- Check server logs for errors

### Payment Status Not Updating
- Verify webhook is being called (check Paymob dashboard logs)
- Check HMAC verification is working
- Ensure database connection is working
- Review webhook handler logs

## Security Notes

- Never commit API keys or secrets to version control
- Always verify HMAC signatures in webhooks
- Use HTTPS for all payment-related endpoints
- Regularly rotate API keys and secrets
- Monitor payment transactions for suspicious activity

## Support

For Paymob-specific issues, contact Paymob support through their dashboard.
For integration issues, check the application logs and error messages.
