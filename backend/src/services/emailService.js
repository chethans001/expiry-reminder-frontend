const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // In development without credentials, create a stream or ethereal transporter
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('--- [EMAIL DISPATCH - DEV SIMULATION] ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Preview: ${mailOptions.text || mailOptions.html.substring(0, 150)}...`);
          console.log('-----------------------------------------');
          return { messageId: 'simulated-' + Date.now() };
        }
      };
    }
  }
  return transporter;
}

async function sendExpiryReminderEmail(user, items) {
  try {
    const t = getTransporter();
    const itemsListHtml = items.map(item => `
      <li style="margin-bottom: 8px;">
        <strong>${item.name}</strong> (${item.category?.name || 'General'}) - 
        <span style="color: ${item.daysRemaining <= 0 ? '#e11d48' : '#d97706'}; font-weight: bold;">
          ${item.label}
        </span>
        <br/><small style="color: #64748b;">Location: ${item.storageLocation || 'Kitchen'}</small>
      </li>
    `).join('');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fafafa; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 20px; border-radius: 8px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Expiry Reminder</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9;">Your Household Expiry Alerts</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; margin-top: 16px;">
          <p style="font-size: 16px; color: #1e293b;">Hello ${user.name},</p>
          <p style="color: #475569;">Here is your personal expiry update for upcoming or expired household items:</p>
          <ul style="padding-left: 20px; color: #334155;">
            ${itemsListHtml}
          </ul>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Open My Expiry Dashboard
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
          This is an automated reminder from your personal Expiry Reminder assistant.
        </p>
      </div>
    `;

    return await t.sendMail({
      from: process.env.SMTP_FROM || '"Expiry Reminder" <reminders@expiryreminder.app>',
      to: user.email,
      subject: `⏰ Expiry Reminder: ${items.length} item(s) need your attention`,
      html,
      text: `Hello ${user.name},\nYou have ${items.length} items expiring or expired. Please check your dashboard: ${process.env.CLIENT_URL || 'http://localhost:5173'}`
    });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return null;
  }
}

async function sendPasswordResetEmail(user, resetToken) {
  try {
    const t = getTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fafafa; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 20px; border-radius: 8px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; margin-top: 16px;">
          <p style="font-size: 16px; color: #1e293b;">Hello ${user.name},</p>
          <p style="color: #475569;">You requested a password reset for your Expiry Reminder account. Click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset My Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Or copy and paste this link: ${resetUrl}</p>
          <p style="color: #94a3b8; font-size: 13px;">If you did not request this reset, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    return await t.sendMail({
      from: process.env.SMTP_FROM || '"Expiry Reminder" <reminders@expiryreminder.app>',
      to: user.email,
      subject: '🔑 Password Reset Request - Expiry Reminder',
      html,
      text: `Hello ${user.name},\nReset your password here: ${resetUrl}`
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    return null;
  }
}

module.exports = {
  sendExpiryReminderEmail,
  sendPasswordResetEmail
};
