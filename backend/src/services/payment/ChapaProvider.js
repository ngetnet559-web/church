import { PaymentProvider } from "./PaymentProvider.js";

export class ChapaProvider extends PaymentProvider {
  constructor() {
    super("Chapa");
  }

  async initializePayment(paymentData) {
    return {
      provider: this.name,
      success: true,
      paymentUrl: `/payments/chapa?ref=${paymentData.reference}`,
      txRef: `chapa_mock_${Date.now()}`,
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
      refundId: `chapa_refund_${Date.now()}`,
      ...refundData,
    };
  }
}
