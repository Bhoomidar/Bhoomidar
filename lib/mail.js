// Sends email through Brevo (https://developers.brevo.com/reference/sendtransacemail).
// Settings in .env: BREVO_API_KEY, MAIL_FROM_NAME, MAIL_FROM_EMAIL.
// Server only. Without a key (local development) the mail is written to the terminal instead.

const BRAND = "Bhoomidar";

export async function sendMail({ to, subject, html, text }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") throw new Error("BREVO_API_KEY is not set.");
    console.log(`\n[mail] To: ${to}\n[mail] Subject: ${subject}\n${text}\n`);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: process.env.MAIL_FROM_NAME || BRAND, email: process.env.MAIL_FROM_EMAIL || "noreply@bhoomidar.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

// One plain, centered card in the colours of the site.
function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#fbf7f0;font-family:Arial,Helvetica,sans-serif;color:#1b1511">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 20px;font-size:20px;font-weight:bold;color:#8c4821">${BRAND}</p>
<h1 style="margin:0 0 12px;font-size:22px">${title}</h1>
${body}
<p style="margin:28px 0 0;font-size:12px;color:#7a6f66">If you did not ask for this, you can ignore this email. Nobody can use it without access to your inbox.</p>
</td></tr></table>
</td></tr></table></body></html>`;
}

export function otpMail(code, purpose) {
  const what = purpose === "register" ? "verify your email and create your partner account" : "log in to your partner account";
  return {
    subject: `${code} is your ${BRAND} code`,
    text: `Your ${BRAND} code is ${code}. Use it to ${what}. It works for 10 minutes. Do not share it with anyone.`,
    html: layout(
      "Your one-time code",
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.5">Use this code to ${what}.</p>
<p style="margin:0 0 16px;font-size:34px;font-weight:bold;letter-spacing:8px;color:#8c4821">${code}</p>
<p style="margin:0;font-size:14px;color:#4a403a">It works for 10 minutes. Do not share it with anyone.</p>`,
    ),
  };
}

export function resetMail(link) {
  return {
    subject: `Reset your ${BRAND} password`,
    text: `Open this link to choose a new password: ${link}\nIt works for 30 minutes and only once.`,
    html: layout(
      "Reset your password",
      `<p style="margin:0 0 20px;font-size:15px;line-height:1.5">Press the button to choose a new password. The link works for 30 minutes and only once.</p>
<p style="margin:0 0 20px"><a href="${link}" style="display:inline-block;background:#b5622f;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:12px">Choose a new password</a></p>
<p style="margin:0;font-size:12px;color:#7a6f66;word-break:break-all">Or copy this link: ${link}</p>`,
    ),
  };
}
