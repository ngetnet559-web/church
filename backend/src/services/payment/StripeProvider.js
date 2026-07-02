import { PaymentProvider } from "./PaymentProvider.js";

export class StripeProvider extends PaymentProvider {
  constructor() {
    super("Stripe");
  }

  async initializePayment(paymentData) {
    return {
      provider: this.name,
      success: true,
      paymentUrl: `/payments/stripe?ref=${paymentData.reference}`,
      checkoutSessionId: `stripe_mock_${Date.now()}`,
      ...paymentData,
    };
  }

  async verifyPayment(payload) {
    return { provider: this.name, verified: true, payload };
  }

  async refundPayment(refundData) {
    return {
      provider: this.name,
      refunded: true,
      refundId: `stripe_refund_${Date.now()}`,
      ...refundData,
    };
  }
}
