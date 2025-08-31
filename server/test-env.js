// Test script to verify environment variables
const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Environment Variables Test');
console.log('=============================');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('=============================');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials are missing!');
  console.error('Please check your .env file and ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
}
