const crypto = require('crypto');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify Paystack signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;

  // Only process successful payments
  if (event.event !== 'charge.success') {
    return res.status(200).json({ message: 'Event ignored' });
  }

  const customerEmail = event.data.customer.email;
  const customerName = event.data.customer.first_name || 'Student';

  // Send welcome email via Brevo
  const emailPayload = {
    sender: {
      name: 'Emmanuel Ifeanyi — DMC Program',
      email: 'nuelifeanyi48@gmail.com'
    },
    to: [{ email: customerEmail, name: customerName }],
    subject: '🎉 Welcome to DMC Program — Your Access Code Inside',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0814; color: #f1f0ff; padding: 40px; border-radius: 12px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #fbbf24; font-size: 28px; margin-bottom: 8px;">Welcome to the DMC Program! 🚀</h1>
          <p style="color: #c4b5fd; font-size: 16px;">You just made one of the best decisions of your life.</p>
        </div>

        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
          Hi ${customerName},<br><br>
          Your payment was successful and your spot in the <strong style="color: #fbbf24;">Digital Marketing Cashflow (DMC) Program 2026</strong> is confirmed.
        </p>

        <div style="background: #1c1840; border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 28px; margin: 28px 0; text-align: center;">
          <p style="color: #a78bfa; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">Your Access Code</p>
          <div style="background: #302b63; color: #fbbf24; font-size: 32px; font-weight: 900; letter-spacing: 6px; padding: 16px 32px; border-radius: 8px; display: inline-block;">
            dmc2026
          </div>
        </div>

        <div style="background: #13102a; border-radius: 12px; padding: 24px; margin: 28px 0;">
          <p style="color: #fbbf24; font-weight: 700; font-size: 16px; margin-bottom: 16px;">📋 How to Access Your Program:</p>
          <ol style="color: #c4b5fd; font-size: 15px; line-height: 2; padding-left: 20px;">
            <li>Go to <a href="https://nueldigitalvault.vercel.app" style="color: #8b5cf6;">nueldigitalvault.vercel.app</a></li>
            <li>Click <strong style="color: #fff;">Sign Up</strong> and create your account</li>
            <li>Confirm your email address</li>
            <li>Log in and enter your access code: <strong style="color: #fbbf24;">dmc2026</strong></li>
            <li>You're in! Start watching immediately 🎉</li>
          </ol>
        </div>

        <div style="background: #1c1840; border-left: 4px solid #10b981; border-radius: 4px; padding: 16px 20px; margin: 28px 0;">
          <p style="color: #6ee7b7; font-size: 14px; margin: 0;">
            💬 <strong>Need help?</strong> Reply to this email or reach us on WhatsApp/Telegram. We're here to make sure you succeed.
          </p>
        </div>

        <p style="font-size: 15px; color: #c4b5fd; line-height: 1.7;">
          See you inside,<br>
          <strong style="color: #fff;">Emmanuel Ifeanyi</strong><br>
          <span style="color: #8b5cf6; font-size: 13px;">9-Figure Digital Marketing Expert & Founder, DMC Program</span>
        </p>

        <div style="border-top: 1px solid rgba(139,92,246,0.2); margin-top: 32px; padding-top: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px;">© 2026 Emmanuel Ifeanyi · emmanuelifeanyi.vercel.app</p>
        </div>

      </div>
    `
  };

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    if (!brevoResponse.ok) {
      const error = await brevoResponse.json();
      console.error('Brevo error:', error);
      return res.status(500).json({ message: 'Email failed', error });
    }

    return res.status(200).json({ message: 'Email sent successfully' });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
