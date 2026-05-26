export function genericTemplate(subject: string, plainText: string) {
  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #0f172a;">
      <div style="max-width:600px;margin:0 auto;padding:24px;border-radius:8px;border:1px solid #e6edf3;background:#ffffff;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <img src="https://www.useplugr.app/plugr.png" alt="Plugr" width="84" style="display:block;" />
          <h2 style="margin:0;color:#0b1220">Plugr</h2>
        </div>
        <div style="margin-top:8px;color:#475569">${plainText.replace(/\n/g, '<br/>')}</div>
        <p style="margin-top:16px;color:#94a3b8;font-size:13px">Thanks — the Plugr team</p>
      </div>
    </div>
  `;

  return { subject, plainText, html };
}
