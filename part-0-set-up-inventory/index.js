const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Firestore = require("@google-cloud/firestore");

const PROJECT_NAME = process.env.PROJECT_NAME;
const MERCHANT_NAME = "American Sock Market";

// Endpoint defintion
exports.session = async (req, res) => {
  const db = new Firestore({
    projectId: PROJECT_NAME,
    timestampsInSnapshots: true
  });

  let product = req.query.product;
  let productRef = db.collection("socks").doc(product);

  productRef
    .get()
    .then(async doc => {
      const data = doc.data();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            name: data.name,
            description: data.description,
            amount: data.price,
            currency: "usd",
            quantity: req.query.quantity
          }
        ],
        success_url: "https://www.ilovecats.com",
        cancel_url: "https://www.ilovecats.com"
      });

      res.send(session);
    })
    .catch(err => {
      console.log("err", err);
    });
};
