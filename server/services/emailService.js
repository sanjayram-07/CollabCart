const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️  SMTP credentials not set — emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,              // force SSL — required for port 465 on Render
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // prevents self-signed cert errors on cloud hosts
    },
    connectionTimeout: 10000,  // 10s — prevents infinite hang
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return transporter;
}

async function sendMagicLinkEmail(toEmail, magicLink) {
  const trans = getTransporter();

  // Dev fallback — no SMTP configured
  if (!trans) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n📧 [DEV] Magic link (SMTP not configured):', magicLink, '\n');
      return { devMagicLink: magicLink };
    }
    throw new Error('Email service not configured.');
  }

  try {
    await trans.sendMail({
      from: process.env.SMTP_FROM || `"CollabCart Admin" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Your CollabCart Admin Login Link',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #4f63f5;">CollabCart Admin Login</h2>
          <p>Click the link below to log in. This link expires in <strong>10 minutes</strong>.</p>
          <p>
            <a href="${magicLink}"
               style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#4f63f5,#7c3aed);color:white;text-decoration:none;border-radius:8px;font-weight:600;">
              Log in to Admin
            </a>
          </p>
          <p style="color:#666;font-size:12px;">If you didn't request this, ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#999;font-size:11px;">CollabCart — Collaborative Shopping Cart</p>
        </div>
      `,
      text: `Your CollabCart Admin login link: ${magicLink}\n\nExpires in 10 minutes.`,
    });

    return { success: true };
  } catch (err) {
    // Reset transporter so next request retries a fresh connection
    transporter = null;
    console.error('❌ SMTP send failed:', err.message);
    throw new Error('Failed to send email: ' + err.message);
  }
}

module.exports = { sendMagicLinkEmail };
