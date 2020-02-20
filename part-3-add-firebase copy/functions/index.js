const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const stripe = require('stripe')(functions.config().stripe.token);

// When a user is created, register them with Stripe
exports.createStripeCustomer = functions.auth.user().onCreate(async (user) => {
  const customer = await stripe.customers.create({email: user.email});
  await admin.firestore().collection('stripe_customers').doc(user.uid).set({customer_id: customer.id});
});
