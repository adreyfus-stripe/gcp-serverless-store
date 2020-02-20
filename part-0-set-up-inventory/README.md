# Part 0 - Set up inventory

Before launching our sock shop, let's create an inventory of socks to sell. It's important to put sensitive data about the inventory on the server -- do not pass amounts to charge from the client, since that can be easily manipulated by your users.

Instead, pass the IDs of the items the customer wants to purchase, and use a Cloud Function to look up pricing information.

## Step 1: Inventory on Firestore

Set up your inventory with Firestore. We will create a new collection called "socks" and create four documents (one for each sock we want to sell).

| ID      | Description                          | Price |
| ------- | :----------------------------------- | ----- |
| apple   | For the apple lover in your life     | 1999  |
| donut   | Some super sweet socks               | 1999  |
| stripes | Classy and classic design            | 1299  |
| blue    | Simple, yet shockingly sophisticated | 999   |

## Step 2: Checkout with Function

Next, let's create a function that can manage your customer's checkout session. We will appropriate be using Stripe's CheckoutSessions API.

Checkout Sessions will generate a hosted payment page on Stripe that we can redirect our customers to when they want to check out.

fetch('https://us-central1-friendlychat-e6731.cloudfunctions.net/create-session?quantity=1&product=apple')
