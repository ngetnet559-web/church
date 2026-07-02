import { PaymentProvider } from "./PaymentProvider.js";

export class PayPalProvider extends PaymentProvider {
  constructor() {
    super("PayPal");
  }

  async initializePayment(paymentData) {
    return {
      provider: this.name,
      success: true,
      paymentUrl: `/payments/paypal?ref=${paymentData.reference}`,
      orderId: `paypal_mock_${Date.now()}`,
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
      refundId: `paypal_refund_${Date.now()}`,
      ...refundData,
    };
  }
}
