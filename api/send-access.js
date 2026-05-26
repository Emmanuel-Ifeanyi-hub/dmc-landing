module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

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
              <p style="margin:0;color:#9ca3af;font-size:13px;">E
