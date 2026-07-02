import { PaymentProvider } from "./PaymentProvider.js";

export class TelebirrProvider extends PaymentProvider {
  constructor() {
    super("Telebirr");
  }

  async initializePayment(paymentData) {
    return {
      provider: this.name,
      success: true,
      paymentUrl: `/payments/telebirr?ref=${paymentData.reference}`,
      transactionId: `telebirr_mock_${Date.now()}`,
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
      refundId: `telebirr_refund_${Date.now()}`,
      ...refundData,
    };
  }
}
