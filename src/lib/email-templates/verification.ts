export function verificationTemplate(code: string) {
  const subject = "Your Plugr verification code";
  const plainText = `Your Plugr verification code is ${code}. It expires in 15 minutes.`;
  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #0f172a;">
      <div style="max-width:600px;margin:0 auto;padding:24px;border-radius:8px;border:1px solid #e6edf3;background:#ffffff;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <img src="https://www.useplugr.app/plugr.png" alt="Plugr" width="84" style="display:block;" />
          <h2 style="margin:0;color:#0b1220">Plugr</h2>
        </div>
        <p style="margin:0 0 16px 0;color:#475569">Your verification code expires in 15 minutes. Use the code below to confirm your email address.</p>
        <div style="display:flex;align-items:center;justify-content:center;margin:18px 0;padding:18px;border-radius:8px;background:linear-gradient(90deg,#0f172a, #111827);color:#fff;font-size:20px;letter-spacing:2px;font-weight:700;">${code}</div>
        <p style="margin:0;color:#64748b;font-size:13px">If you didn't request this code, you can safely ignore this email or contact our support.</p>
        <p style="margin-top:16px;color:#94a3b8;font-size:13px">Thanks — the Plugr team</p>
      </div>
    </div>
  `;

  return { subject, plainText, html };
}
