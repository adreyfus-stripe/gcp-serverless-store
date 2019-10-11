/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD
  }
});

const MERCHANT_NAME = "Tarpaulin Design Co.";

/* 
 * Sends the confirmation email to the customer 
 * @param {Object} checkoutSession - a Stripe CheckoutSession
 * https://stripe.com/docs/api/checkout/sessions
 */
async function sendConfirmationEmail(checkoutSesstion) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    checkoutSesstion.payment_intent
  );

  // Get information about the payment
  const successfulCharge = paymentIntent.charges.data.filter(charge => {
    return charge.status === "succeeded";
  });

  const billingDetails = successfulCharge.billing_details;

  // Format email
  const mailOptions = {
    from: `${MERCHANT_NAME} ${GMAIL_EMAIL}`,
    to: billingDetails.email
  };

  mailOptions.subject = `Your illustrations`;
  mailOptions.text = `Hey ${billingDetails.name ||
    ""}! Thanks for purchasing.`;
  return mailTransport.sendMail(mailOptions);
}

// Endpoint defintion
exports.confirm = async (req, res) => {
  let event;

  try {
    // Check headers for signature to make sure it's from Stripe
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.rawBody.toString(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("err", err);
    console.log(`⚠️  Webhook signature verification failed.`);
    return res.sendStatus(400);
  }
  // Extract the object from the event.
  const data = event.data;
  const eventType = event.type;

  switch (eventType) {
    case "checkout.session.completed":
      sendConfirmationEmail(data);
      return 200;
    default:
      return 200;
  }
};
