# PayMongo Payment Gateway Setup Guide

This guide explains how to set up PayMongo for PaddlePit's payment processing.

## Prerequisites

- PayMongo account (sign up at https://paymongo.com)
- Python 3.8+
- FastAPI backend running

## Step 1: Create a PayMongo Account

1. Go to https://paymongo.com
2. Sign up for a free account
3. Verify your email
4. Complete your business profile

## Step 2: Get Your API Keys

1. Log in to PayMongo Dashboard: https://dashboard.paymongo.com
2. Go to **Settings → Developers → API Keys**
3. You'll see two keys:
   - **Secret Key** (starts with `sk_test_` for testing)
   - **Public Key** (starts with `pk_test_` for testing)
4. Keep these keys secure and never commit them to version control

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Open `backend/.env` and add your PayMongo keys:
   ```
   PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
   PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
   PAYMONGO_WEBHOOK_SECRET=whsec_test_your_webhook_secret_here
   ```

3. **Where to get Webhook Secret:**
   - Dashboard → Settings → Webhooks
   - Create/view webhook → Copy the signing secret
   - Starts with `whsec_test_` or `whsec_live_`

4. Never commit `.env` to git (it's in `.gitignore`)

## Step 4: Understand PayMongo Payment Flow

### Payment Intent API (Current Implementation)

Our booking endpoint uses PayMongo's **Payment Intents API**:

1. **Create Payment Intent** (Server)
   - Amount in centavos (1 PHP = 100 centavos)
   - Customer details
   - Metadata (booking ID, etc.)

2. **Get Client Key** (Server → Frontend)
   - Frontend receives `client_key` to complete payment

3. **Confirm Payment** (Frontend → PayMongo)
   - User enters card/payment details
   - Frontend sends payment details to PayMongo

4. **Payment Status** (Webhook or Polling)
   - PayMongo notifies backend of payment result
   - Or backend polls for status

## Step 5: Test Your Setup

### Test Cards

Use these test cards in test mode:

| Card Type | Card Number | Exp | CVC |
|-----------|-------------|-----|-----|
| Visa | 4242424242424242 | 12/25 | 123 |
| Mastercard | 5555555555554444 | 12/25 | 123 |
| Failed Payment | 4000000000000002 | 12/25 | 123 |

### Test Webhook URLs

1. Use [ngrok](https://ngrok.com) to expose local server:
   ```bash
   ngrok http 8000
   ```

2. PayMongo Dashboard → Settings → Webhooks
3. Add webhook URL: `https://your-ngrok-url/webhook/paymongo`

## Step 5.5: Configure Webhooks

Webhooks allow PayMongo to notify your backend of payment status changes.

### For Development (Local Testing)

1. **Install ngrok:** https://ngrok.com/download
2. **Start ngrok tunnel:**
   ```bash
   ngrok http 8000
   ```
3. **Get your public URL:** `https://abc123.ngrok.io`

### Configure Webhook in PayMongo

1. Log in to PayMongo Dashboard
2. Go to **Settings → Webhooks**
3. Click **Add Webhook**
4. Enter:
   - **URL:** `https://your-url.com/webhook/paymongo`
   - **Events:** Select these events:
     - ✅ `payment.succeeded`
     - ✅ `payment.failed`
     - ✅ `payment_intent.processing` (optional)

5. After creating, copy the **Signing Secret** and add to `.env`:
   ```
   PAYMONGO_WEBHOOK_SECRET=whsec_test_xxx
   ```

### Test Webhook

PayMongo Dashboard has a test feature in Webhooks section:
- Click the webhook
- Look for "Send Test Event" button
- Select an event type and send
- Check your backend logs for webhook receipt

## Step 6: API Endpoint Usage

### Create a Booking with Payment

```bash
curl -X POST http://localhost:8000/booking \
  -H "Content-Type: application/json" \
  -d '{
    "booker_name": "Juan Dela Cruz",
    "email": "juan@email.com",
    "phone": "+63-9175558899",
    "booking_items": [
      {
        "court_id": "court-1",
        "start_time": "2026-09-09T10:00:00",
        "end_time": "2026-09-09T12:00:00"
      }
    ],
    "promo_code": "PROMO20"
  }'
```

### Validate Promo Code

```bash
curl http://localhost:8000/promo/PROMO20
```

## Important Notes

### Amount Conversion
- PayMongo requires amounts in **centavos**
- 1 PHP = 100 centavos
- Example: ₱700.00 = 70000 centavos

### Authentication
- Use Basic Auth with Secret Key: `Authorization: Basic base64(sk_xxx:)`
- Secret Key only for server-side API calls
- Never expose Secret Key to frontend

### Payment Status Tracking
Current implementation:
- ✅ Creates payment intent
- ✅ Records transaction as "pending"
- ❌ Does not handle webhooks yet (TODO)
- ❌ Does not poll for status updates (TODO)

### Next Steps
1. Implement webhook handlers for payment confirmation
2. Add polling mechanism to update transaction status
3. Add error handling for declined cards
4. Implement refund processing
5. Add email confirmations

## Troubleshooting

### "Invalid API Key"
- Check that you're using the correct Secret Key
- Ensure key is not accidentally modified
- Keys should start with `sk_test_` or `sk_live_`

### "Amount must be greater than 0"
- Ensure amount is in centavos (multiply by 100)
- Minimum amount is 100 centavos (₱1.00)

### "Invalid Payment Intent"
- Payment intent may have already been confirmed
- Each intent can only be used once

### Webhook Not Triggering
- Ensure webhook URL is publicly accessible
- Use ngrok for local testing
- Check PayMongo webhook logs in Dashboard

## Production Considerations

Before going live:
1. Switch from `sk_test_` to `sk_live_` keys
2. Set `PAYMONGO_MODE=live` in environment
3. Implement webhook signature verification
4. Add proper error logging and monitoring
5. Set up payment failure notifications
6. Test with real payment cards
7. Ensure SSL/TLS on all endpoints
8. Implement PCI compliance measures

## Resources

- [PayMongo API Documentation](https://developers.paymongo.com)
- [Payment Intents Guide](https://developers.paymongo.com/docs/payments-api#payment-intents)
- [Webhook Documentation](https://developers.paymongo.com/docs/webhooks)
- [Test Cards](https://developers.paymongo.com/docs/test-payment-details)

curl -X POST http://localhost:8000/booking \
  -H "Content-Type: application/json" \
  -d '{
    "booker_name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "phone": "+63-9175558899",
    "booking_items": [
      {
        "court_id": "court-1",
        "start_time": "2026-09-20T10:00:00",
        "end_time": "2026-09-20T12:00:00"
      }
    ]
  }'
