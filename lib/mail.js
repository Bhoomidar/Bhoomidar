// Sends email through Brevo (https://developers.brevo.com/reference/sendtransacemail).
// Settings in .env: BREVO_API_KEY, MAIL_FROM_NAME, MAIL_FROM_EMAIL.
// Server only. Without a key (local development) the mail is written to the terminal instead.

const BRAND = "Bhoomidar";

export async function sendMail({ to, subject, html, text, logText }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") throw new Error("BREVO_API_KEY is not set.");
    console.log(`\n[mail] To: ${to}\n[mail] Subject: ${subject}\n${logText ?? text}\n`);
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
function layout(title, body, footer = "If you did not ask for this, you can ignore this email. Nobody can use it without access to your inbox.") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${BRAND}</title>
<style>
  @media only screen and (max-width: 520px) {
    .outer { padding: 10px 8px !important; }
    .card { padding: 22px 18px !important; }
    .title { font-size: 20px !important; }
    .btn { display: block !important; text-align: center !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:#fbf7f0;font-family:Arial,Helvetica,sans-serif;color:#1b1511;-webkit-text-size-adjust:100%">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf7f0"><tr><td class="outer" align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px"><tr><td class="card" style="padding:32px">
<p style="margin:0 0 20px;font-size:20px;font-weight:bold;color:#8c4821">${BRAND}</p>
<h1 class="title" style="margin:0 0 12px;font-size:22px;line-height:1.25">${title}</h1>
${body}
<p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#7a6f66">${footer}</p>
</td></tr></table>
</td></tr></table></body></html>`;
}

export function otpMail(code, purpose) {
  const what =
    purpose === "register"
      ? "verify your email and create your partner account"
      : purpose === "customer"
        ? "verify your email and register as a Bhoomidar customer"
        : "log in to your partner account";
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
<p style="margin:0 0 20px"><a class="btn" href="${link}" style="display:inline-block;background:#b5622f;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:12px">Choose a new password</a></p>
<p style="margin:0;font-size:12px;color:#7a6f66;word-break:break-all">Or copy this link: ${link}</p>`,
    ),
  };
}

// Text from a person goes into the page only after this (a name like <b> must not become markup).
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// The welcome mail for a new partner: the partner ID, the login email, where to log in and what comes next.
// It carries the password the partner chose when they registered. It is used for this one mail only: it is
// not saved anywhere and not printed in any log (logText has it hidden).
export function welcomeMail({ name, code, email, password, loginUrl, forgotUrl, amountText, phone, hours }) {
  const first = String(name ?? "").trim().split(/\s+/)[0] || "Partner";
  const row = (label, value, mono = false) =>
    `<div style="margin:0 0 12px"><div style="margin:0 0 3px;font-size:12px;color:#7a6f66">${label}</div><div style="font-size:${mono ? 18 : 15}px;line-height:1.35;font-weight:bold;${mono ? "font-family:Consolas,Menlo,monospace;letter-spacing:1px;color:#8c4821;" : ""}overflow-wrap:anywhere;word-break:break-word">${value}</div></div>`;
  // The number stays on one line (never split in the middle) and can be tapped to call. The hours go on their own line.
  const telHref = `tel:${String(phone ?? "").replace(/[^\d+]/g, "")}`;
  const help = phone
    ? `Questions? Call us on <a href="${esc(telHref)}" style="white-space:nowrap;font-weight:bold;color:#8c4821;text-decoration:none">${esc(phone)}</a>${hours ? `<br><span style="font-size:13px;color:#7a6f66">${esc(hours)}</span>` : ""}`
    : "Questions? Just reply to this email.";

  const textOf = (shownPassword) =>
    [
      `Hello ${name},`,
      "",
      `Your ${BRAND} partner account is ready.`,
      "",
      `Partner ID: ${code}`,
      `Login email: ${email}`,
      `Password: ${shownPassword}`,
      "Keep this email private.",
      "",
      `Log in: ${loginUrl}`,
      `Forgot your password? Choose a new one: ${forgotUrl}`,
      "",
      "What comes next:",
      `1. Pay the joining amount of ${amountText}.`,
      "2. When we receive it, your account is activated: your dashboard opens and your partner ID starts working for invites.",
      "",
      phone ? `Questions? Call us on ${phone}${hours ? ` (${hours})` : ""}.` : "Questions? Just reply to this email.",
    ].join("\n");

  return {
    subject: `Welcome to ${BRAND}, ${first}`,
    text: textOf(password),
    logText: textOf("(hidden)"),
    html: layout(
      `Welcome, ${esc(first)}!`,
      `<p style="margin:0 0 16px;font-size:15px;line-height:1.5">Your ${BRAND} partner account is ready. Please keep this email private.</p>
<div style="margin:0 0 18px;background:#fbf7f0;border-radius:12px;padding:16px 16px 4px">
${row("Partner ID", esc(code), true)}
${row("Login email", esc(email))}
${row("Password", esc(password), true)}
</div>
<p style="margin:0 0 14px"><a class="btn" href="${esc(loginUrl)}" style="display:inline-block;background:#b5622f;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:12px">Log in</a></p>
<p style="margin:0 0 20px;font-size:13px;color:#4a403a">Forgot your password? <a href="${esc(forgotUrl)}" style="color:#8c4821">Choose a new one</a>.</p>
<p style="margin:0 0 8px;font-size:15px;font-weight:bold">What comes next</p>
<ol style="margin:0 0 18px;padding-left:20px;font-size:14px;line-height:1.6;color:#4a403a">
<li>Pay the joining amount of <b>${esc(amountText)}</b>.</li>
<li>When we receive it, your account is activated: your dashboard opens and your partner ID starts working for invites.</li>
</ol>
<p style="margin:0;font-size:14px;color:#4a403a">${help}</p>`,
      "You are receiving this because a partner account was created with this email address at Bhoomidar.",
    ),
  };
}
