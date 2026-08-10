/**
 * Best-effort transactional email.
 * Uses Resend when RESEND_API_KEY is set; otherwise returns delivered:false
 * so the client can show OTP once (still gated by IP + unique phone/email).
 */
export async function sendOtpEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; delivered: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM || process.env.MAIL_FROM || "TOLWEX <onboarding@resend.dev>";

  if (!key) {
    console.info("[mail] RESEND_API_KEY yok — OTP e-posta gönderilmedi", opts.to);
    return { ok: true, delivered: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[mail] resend fail", res.status, t.slice(0, 200));
      return { ok: false, delivered: false, error: `mail ${res.status}` };
    }
    return { ok: true, delivered: true };
  } catch (e) {
    return {
      ok: false,
      delivered: false,
      error: e instanceof Error ? e.message : "mail hata",
    };
  }
}
