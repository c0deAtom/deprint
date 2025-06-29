# Razorpay Integration Setup

This guide will help you set up Razorpay payment gateway in your e-commerce application.

## Prerequisites

1. A Razorpay account (sign up at https://razorpay.com)
2. Your application running locally

## Setup Steps

### 1. Get Razorpay API Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com
2. Go to **Settings** → **API Keys**
3. Generate a new API key pair
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Add your Razorpay credentials to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
```

**Important Notes:**
- Use test keys for development (`rzp_test_...`)
- Use live keys for production (`rzp_live_...`)
- Never commit your live keys to version control

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Add items to your cart
3. Proceed to checkout
4. Complete the order creation
5. You'll be redirected to the payment page
6. Click "Pay with Razorpay UPI" to test the payment flow

### 4. Test Payment Methods

For testing, you can use these test card details:

**Test Cards:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay`

### 5. Go Live

When ready for production:

1. Replace test keys with live keys in your environment
2. Update the store name in the payment page
3. Test thoroughly with small amounts
4. Ensure your webhook endpoints are configured

## Features Implemented

- ✅ Razorpay order creation
- ✅ Payment modal integration
- ✅ Payment verification
- ✅ Order status updates
- ✅ Error handling
- ✅ User-friendly UI

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── razorpay-order/
│   │       │   └── route.ts          # Creates Razorpay orders
│   │       └── verify/
│   │           └── route.ts          # Verifies payments
│   └── payment/
│       └── page.tsx                  # Payment page with Razorpay integration
└── prisma/
    └── schema.prisma                 # Updated with payment fields
```

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Check your environment variables
   - Ensure keys are correctly copied
   - Verify you're using the right environment (test/live)

2. **Payment Verification Fails**
   - Check the webhook signature verification
   - Ensure your key secret is correct
   - Verify the order ID format

3. **Modal Doesn't Open**
   - Check browser console for JavaScript errors
   - Ensure Razorpay script is loaded
   - Verify the API response format

### Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/ 