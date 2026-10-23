import "server-only";
import Stripe from "stripe";

// Null until STRIPE_SECRET_KEY is configured. Without it the shop runs in demo payment mode
// (see payOrder): orders can be "paid" with a simulated payment so the flow stays testable.
const key = process.env.STRIPE_SECRET_KEY;
export const stripe: Stripe | null = key ? new Stripe(key) : null;

export const isDemoPayments = !stripe;
