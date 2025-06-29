# Razorpay Integration Setup

This guide will help you set up Razorpay payment gateway in your e-commerce application.

## Prerequisites

1. A Razorpay account (sign up at https://razorpay.com)
2. Your application running locally

## Setup Steps

### 1. Get Razorpay API Keys

1. **Sign up for Razorpay**:
   - Go to https://razorpay.com
   - Click "Sign Up" and create an account
   - Complete your business verification

2. **Access your Dashboard**:
   - Log in to your Razorpay Dashboard: https://dashboard.razorpay.com
   - Go to **Settings** → **API Keys**

3. **Generate API Keys**:
   - Click "Generate Key Pair"
   - Copy your **Key ID** and **Key Secret**
   - **Important**: Keep your Key Secret secure and never share it

### 2. Configure Environment Variables

Replace the placeholder values in your `.env` file with your actual Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_actual_test_key_id_here
RAZORPAY_KEY_SECRET=your_actual_test_key_secret_here

# For production, use:
# RAZORPAY_KEY_ID=rzp_live_your_actual_live_key_id_here
# RAZORPAY_KEY_SECRET=your_actual_live_key_secret_here
```

**Important Notes:**
- Use test keys for development (`rzp_test_...`)
- Use live keys for production (`rzp_live_...`)
- Never commit your live keys to version control
- The current placeholder values will cause build errors

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
- ✅ Graceful handling of missing credentials

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

1. **"key_id or oauthToken is mandatory" Error**
   - Check your environment variables are set correctly
   - Ensure you're not using placeholder values
   - Verify your Razorpay account is active

2. **"Payment gateway not configured" Error**
   - Set your actual Razorpay API keys in `.env`
   - Restart your development server after changing environment variables

3. **"Invalid API Key" Error**
   - Check your environment variables
   - Ensure keys are correctly copied
   - Verify you're using the right environment (test/live)

4. **Payment Verification Fails**
   - Check the webhook signature verification
   - Ensure your key secret is correct
   - Verify the order ID format

5. **Modal Doesn't Open**
   - Check browser console for JavaScript errors
   - Ensure Razorpay script is loaded
   - Verify the API response format

### Development vs Production

- **Development**: Use test keys (`rzp_test_...`)
- **Production**: Use live keys (`rzp_live_...`)
- **Testing**: Use test payment methods provided by Razorpay

## Security Best Practices

1. **Never expose your API secret** in client-side code
2. **Use environment variables** for all sensitive data
3. **Verify payment signatures** on the server side
4. **Use HTTPS** in production
5. **Implement proper error handling**

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
- Razorpay Dashboard: https://dashboard.razorpay.com/ 