# Paymob Production Go-Live Checklist

This guide will help you switch from test mode to production mode with Paymob.

## Pre-Launch Checklist

### 1. Get Production Credentials from Paymob

Log in to your Paymob dashboard and obtain the following **production** credentials:

- [ ] **PAYMOB_API_KEY** - Production API Key
- [ ] **PAYMOB_HMAC_SECRET** - Production HMAC Secret
- [ ] **PAYMOB_INTEGRATION_ID** - Production Integration ID
- [ ] **PAYMOB_IFRAME_ID** - Production Iframe ID

**Where to find them:**
- API Key: Settings > API Keys > Production API Key
- HMAC Secret: Settings > Security > Production HMAC Secret
- Integration ID: Settings > Integrations > Card Payment > Production Integration ID
- Iframe ID: Settings > Integrations > Card Payment > Production Iframe ID

### 2. Update Environment Variables

Update your production environment variables (`.env.production` or your hosting platform's environment variables):

```env
# Paymob Production Configuration
PAYMOB_API_KEY=your_production_api_key_here
PAYMOB_HMAC_SECRET=your_production_hmac_secret_here
PAYMOB_INTEGRATION_ID=your_production_integration_id_here
PAYMOB_IFRAME_ID=your_production_iframe_id_here
PAYMOB_BASE_URL=https://accept.paymob.com/api
```

**Important:** 
- Make sure these are **production** credentials, not test credentials
- Never commit these to version control
- Update them in your hosting platform (Vercel, etc.)

### 3. Configure Production Webhook

1. Log in to Paymob Dashboard
2. Navigate to **Settings > Webhooks**
3. Add/Update webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
   Replace `yourdomain.com` with your actual production domain
4. Enable webhook for:
   - Transaction success
   - Transaction failure
   - Transaction pending
5. Save the **Production HMAC Secret** - it must match `PAYMOB_HMAC_SECRET` in your environment variables

### 4. Disable Test Mode

1. In Paymob Dashboard, go to **Settings > General**
2. **Disable Test Mode** or switch to **Production Mode**
3. Save changes

### 5. Verify Base URL

The base URL is already set to production:
```
PAYMOB_BASE_URL=https://accept.paymob.com/api
```

This is correct for production. No changes needed.

### 6. Test Production Payment Flow

Before going fully live, test with a small real transaction:

1. **Test with real card** (use a small amount)
2. Verify payment appears in Paymob dashboard
3. Verify webhook is received
4. Verify subscription is created in database
5. Verify user can access paid features

### 7. Monitor Payment Logs

After going live, monitor:
- Paymob Dashboard > Transactions
- Application logs for payment errors
- Webhook delivery status in Paymob dashboard
- Database for successful payment records

## Post-Launch Verification

### Check These Items:

- [ ] Production API key is set correctly
- [ ] Production HMAC secret matches Paymob dashboard
- [ ] Production Integration ID is correct
- [ ] Production Iframe ID is correct
- [ ] Webhook URL is configured in Paymob dashboard
- [ ] Webhook URL uses HTTPS (required for production)
- [ ] Test mode is disabled in Paymob dashboard
- [ ] Test payment completed successfully
- [ ] Webhook received and processed correctly
- [ ] Subscription created in database
- [ ] User can access paid features

## Common Issues & Solutions

### Issue: Payment fails with "Invalid API Key"
**Solution:** 
- Verify you're using production API key, not test key
- Check for extra spaces in environment variable
- Ensure environment variables are loaded correctly

### Issue: Webhook not received
**Solution:**
- Verify webhook URL is publicly accessible (HTTPS required)
- Check webhook URL in Paymob dashboard matches exactly
- Verify HMAC secret matches
- Check server logs for webhook errors
- Ensure firewall/security settings allow Paymob IPs

### Issue: HMAC verification fails
**Solution:**
- Verify `PAYMOB_HMAC_SECRET` matches production secret in Paymob dashboard
- Check for encoding issues (should be plain text, not base64)
- Ensure secret doesn't have extra spaces

### Issue: Iframe not loading
**Solution:**
- Verify `PAYMOB_IFRAME_ID` is production iframe ID
- Check iframe URL is correct: `https://accept.paymob.com/api/acceptance/iframes/{IFRAME_ID}?payment_token=...`
- Ensure integration is active in Paymob dashboard

## Security Reminders

- ✅ Never commit production credentials to git
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS for all payment endpoints
- ✅ Verify HMAC signatures on all webhooks
- ✅ Monitor transactions for suspicious activity
- ✅ Rotate API keys periodically
- ✅ Keep Paymob dashboard access secure

## Support

- **Paymob Support:** Contact through Paymob dashboard
- **Application Issues:** Check server logs and error messages
- **Webhook Issues:** Check Paymob dashboard > Webhooks > Delivery Logs

## Quick Reference

**Production URLs:**
- API Base: `https://accept.paymob.com/api`
- Iframe: `https://accept.paymob.com/api/acceptance/iframes/{IFRAME_ID}?payment_token={TOKEN}`

**Webhook Endpoint:**
- `https://yourdomain.com/api/payments/webhook`

**Callback Endpoint:**
- `https://yourdomain.com/api/payments/callback`

---

**Ready to go live?** Follow the checklist above and test thoroughly before processing real payments.
