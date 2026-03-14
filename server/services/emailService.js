const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials not set. Magic link emails will not be sent.');
    console.warn('   Set SMTP_USER and SMTP_PASS in .env (or use Ethereal for testing)');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Sends magic link email. Returns the magicLink when SMTP is not configured (dev mode)
 * so the API can include it in the response for the user to use.
 */
async function sendMagicLinkEmail(toEmail, magicLink) {
  const trans = getTransporter();
  if (!trans) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n📧 [DEV] Magic link (SMTP not configured):', magicLink, '\n');
      return { devMagicLink: magicLink };
    }
    throw new Error('Email service not configured.');
  }

  await trans.sendMail({
    from: process.env.SMTP_FROM || '"CollabCart Admin" <noreply@collabcart.com>',
    to: toEmail,
    subject: 'Your CollabCart Admin Login Link',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4f63f5;">CollabCart Admin Login</h2>
        <p>Click the link below to log in to the admin dashboard. This link expires in 10 minutes.</p>
        <p>
          <a href="${magicLink}" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f63f5, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Log in to Admin
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #999; font-size: 11px;">CollabCart — Collaborative Shopping Cart</p>
      </div>
    `,
    text: `Your CollabCart Admin login link: ${magicLink}\n\nThis link expires in 10 minutes.`,
  });
  return {};
}

module.exports = { sendMagicLinkEmail };
