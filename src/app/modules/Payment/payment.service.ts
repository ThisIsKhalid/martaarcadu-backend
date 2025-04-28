import stripe from "../../../helpars/stripe/stripe";

const authorizePayment = async (
  customerId: string,
  paymentMethodId: string,
  amount: number
) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: "usd",
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
    capture_method: "manual", // Authorize the payment without capturing
  });

  return paymentIntent;
};

export const PaymentService = {
  authorizePayment,
};
