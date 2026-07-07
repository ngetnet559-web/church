/*

  Email Service (Placeholder)

  Configure SMTP credentials in environment variables when ready:

  MAIL_HOST=smtp.example.com
  MAIL_PORT=587
  MAIL_USER=your@email.com
  MAIL_PASS=your-password
  MAIL_FROM=noreply@sundayschool.com

  Then import nodemailer and implement the methods below.

*/

const emailService = {
  async sendWelcomeEmail(user) {
    // TODO: Send welcome email to user.email
    console.log(`[EMAIL] Welcome email to ${user.email}`);
  },

  async sendCertificateEmail(user, certificate) {
    // TODO: Send certificate email with attachment
    console.log(`[EMAIL] Certificate email to ${user.email}`);
  },

  async sendDonationReceipt(user, donation) {
    // TODO: Send donation receipt to user.email
    console.log(`[EMAIL] Donation receipt to ${user.email}`);
  },

  async sendAttendanceReminder(user, session) {
    // TODO: Send attendance reminder to user.email
    console.log(`[EMAIL] Attendance reminder to ${user.email}`);
  },

  async sendAnnouncementEmail(user, announcement) {
    // TODO: Send announcement email to user.email
    console.log(`[EMAIL] Announcement email to ${user.email}`);
  },
};

export default emailService;
