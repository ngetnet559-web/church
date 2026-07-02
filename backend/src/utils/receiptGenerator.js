export const generateReceiptData = (donation, churchName = "Global Sunday School") => ({
  churchName,
  logoPlaceholder: "[Church Logo]",
  receiptNumber: donation.receiptNumber,
  donorName: donation.anonymous ? "Anonymous Donor" : donation.donorName,
  donorEmail: donation.anonymous ? "" : donation.donorEmail,
  amount: donation.amount,
  currency: donation.currency || "ETB",
  paymentMethod: donation.paymentMethod,
  paymentStatus: donation.paymentStatus,
  donationType: donation.donationType,
  donatedAt: donation.donatedAt,
  message: donation.message,
  qrCodePlaceholder: `[QR:${donation.receiptNumber}]`,
});

export const generateReceiptHtml = (donation, churchName = "Global Sunday School") => {
  const data = generateReceiptData(donation, churchName);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${data.receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 640px; margin: 40px auto; color: #1f2937; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
    .logo { width: 80px; height: 80px; border: 2px dashed #d1d5db; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #6b7280; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .label { color: #6b7280; }
    .qr { margin-top: 24px; text-align: center; border: 2px dashed #d1d5db; padding: 24px; color: #6b7280; }
    .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${data.logoPlaceholder}</div>
    <h1>${data.churchName}</h1>
    <p>Official Donation Receipt</p>
    <p><strong>${data.receiptNumber}</strong></p>
  </div>
  <div class="row"><span class="label">Donor</span><span>${data.donorName}</span></div>
  ${data.donorEmail ? `<div class="row"><span class="label">Email</span><span>${data.donorEmail}</span></div>` : ""}
  <div class="row"><span class="label">Date</span><span>${new Date(data.donatedAt).toLocaleDateString()}</span></div>
  <div class="row"><span class="label">Amount</span><span><strong>${data.amount} ${data.currency}</strong></span></div>
  <div class="row"><span class="label">Payment Method</span><span>${data.paymentMethod}</span></div>
  <div class="row"><span class="label">Donation Type</span><span>${data.donationType}</span></div>
  <div class="row"><span class="label">Status</span><span>${data.paymentStatus}</span></div>
  ${data.message ? `<div class="row"><span class="label">Message</span><span>${data.message}</span></div>` : ""}
  <div class="qr">${data.qrCodePlaceholder}</div>
  <div class="footer">Thank you for your generous support. This receipt serves as proof of donation.</div>
</body>
</html>`;
};

export const generateReceiptUrl = (donationId, receiptNumber) =>
  `/api/donations/${donationId}/receipt?number=${receiptNumber}`;
