import { PaymentProvider } from "./PaymentProvider.js";

export class CBEBirrProvider extends PaymentProvider {
  constructor() {
    super("CBE Birr");
  }

  async initializePayment(paymentData) {
    return {
      provider: this.name,
      success: true,
      paymentUrl: `/payments/cbebirr?ref=${paymentData.reference}`,
      transactionId: `cbebirr_mock_${Date.now()}`,
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
      refundId: `cbebirr_refund_${Date.now()}`,
      ...refundData,
    };
  }
}
