import AuthShell from "@/components/auth/AuthShell";
import ResetForm from "@/components/auth/ResetForm";
import { peekResetToken } from "@/lib/authCodes";

export const metadata = { title: "New Password | Bhoomidar" };

// The link of the "forgot password" email: /reset-password?token=...
export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && (await peekResetToken(token));

  return (
    <AuthShell bare>
      {valid ? (
        <ResetForm token={token} />
      ) : (
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_40px_80px_-36px_rgba(110,60,20,0.55)] ring-1 ring-black/5 sm:p-8">
          <h1 className="font-display text-3xl font-bold text-ink">Link not valid</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
            This link has expired or was already used. Ask for a new one.
          </p>
          <a
            href="/forgot-password"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
          >
            Send me a new link
          </a>
        </div>
      )}
    </AuthShell>
  );
}
