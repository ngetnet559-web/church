export class PaymentProvider {
  constructor(name) {
    this.name = name;
  }

  async initializePayment(_paymentData) {
    throw new Error(`${this.name}: initializePayment must be implemented`);
  }

  async verifyPayment(_payload) {
    throw new Error(`${this.name}: verifyPayment must be implemented`);
  }

  async refundPayment(_refundData) {
    throw new Error(`${this.name}: refundPayment must be implemented`);
  }
}
