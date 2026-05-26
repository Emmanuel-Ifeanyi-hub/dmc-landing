const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const email = event.data.customer.email;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Emmanuel Ifeanyi <onboarding@resend.dev>',
          to: [email],
          subject: 'Your DMC Program Access is Ready 🔥',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0814;color:#f1f0ff;padding:40px;border-radius:12px;">
              <h1 style="color:#f59e0b;font-size:28px;margin-bottom:8px;">Welcome to DMC! 🎉</h1>
              <p style="color:#c4b5fd;font-size:16px;margin-bottom:24px;">Your payment was successful. Here's everything you need to get started:</p>
              <div style="background:#1c1840;border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">Step 1 — Visit the Platform</p>
                <a href="https://nueldigitalvault.vercel.app" style="color:#f59e0b;font-size:16px;font-weight:bold;">nueldigitalvault.vercel.app</a>
              </div>
              <div style="background:#1c1840;border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">Step 2 — Create Your Account</p>
                <p style="margin:0;color:#e0d7ff;">Click <strong>Sign Up</strong>, enter your email and create a password. Confirm your email when prompted.</p>
              </div>
              <div style="background:#1c1840;border:1px solid rgba(245,158,11,0.4);border-radius:10px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">Step 3 — Enter Your Access Code</p>
                <p style="font-size:32px;font-weight:900;color:#f59e0b;letter-spacing:4px;margin:8px 0;">DMC2026</p>
                <p style="margin:0;color:#9ca3af;font-size:13px;">Enter this code on the DMC course card to unlock your full access instantly.</p>
              </div>
              <div style="background:#1c1840;border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:24px;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;">Step 4 — Join the Community</p>
                <p style="margin:0;color:#e0d7ff;">Your first lesson inside the platform has the Telegram community link. Join immediately — that's where live classes are announced.</p>
              </div>
              <p style="color:#9ca3af;font-size:14px;text-align:center;">Having issues? WhatsApp: <a href="https://wa.me/2347069624136" style="color:#f59e0b;">07069624136</a></p>
            </div>
          `
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Resend error:', err);
      }
    } catch (err) {
      console.error('Email error:', err);
    }
  }

  return res.status(200).json({ received: true });
};
