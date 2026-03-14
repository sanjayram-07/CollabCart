// emailService.js
// Uses Resend HTTP API — works on Render free tier (no SMTP ports needed)
// Sign up free at https://resend.com → API Keys → Create Key
// Add RESEND_API_KEY to Render environment variables

async function sendMagicLinkEmail(toEmail, magicLink) {
  const apiKey = process.env.RESEND_API_KEY;

  // Dev fallback — no API key configured
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n📧 [DEV] Magic link (Resend not configured):', magicLink, '\n');
      return { devMagicLink: magicLink };
    }
    throw new Error('RESEND_API_KEY is not set.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CollabCart <onboarding@resend.dev>', // works without a custom domain
      to: toEmail,
      subject: '🔐 Your CollabCart Admin Login Link',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#4f63f5;margin-bottom:8px;">CollabCart Admin</h2>
          <p style="color:#444;">Click the button below to log in to your admin dashboard.</p>
          <p style="color:#888;font-size:13px;">This link expires in <strong>10 minutes</strong>.</p>
          <a href="${magicLink}"
             style="display:inline-block;margin:24px 0;padding:14px 28px;
                    background:linear-gradient(135deg,#4f63f5,#7c3aed);
                    color:white;text-decoration:none;border-radius:10px;
                    font-weight:600;font-size:15px;">
            Log in to Admin Panel
          </a>
          <p style="color:#999;font-size:12px;">
            If you didn't request this, you can safely ignore this email.<br/>
            Or copy this link: <a href="${magicLink}" style="color:#4f63f5;">${magicLink}</a>
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#bbb;font-size:11px;">CollabCart — Collaborative Shopping Cart</p>
        </div>
      `,
      text: `Your CollabCart Admin login link:\n${magicLink}\n\nThis link expires in 10 minutes.`,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    console.error('❌ Resend error:', error);
    throw new Error(`Resend failed: ${error.message || res.statusText}`);
  }

  const data = await res.json();
  console.log('✅ Magic link email sent via Resend, id:', data.id);
  return { success: true };
}

module.exports = { sendMagicLinkEmail };
