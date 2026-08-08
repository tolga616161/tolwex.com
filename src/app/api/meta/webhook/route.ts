import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig } from "@/lib/meta/config";
import { writeAuditLog } from "@/lib/audit";

/**
 * Meta Webhooks verification + event receiver.
 * Developer Console → Webhooks → Verify Token alanına META_WEBHOOK_VERIFY_TOKEN değerini yazın.
 * Callback URL: {APP_URL}/api/meta/webhook
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const config = await getMetaConfig();

  if (
    mode === "subscribe" &&
    token &&
    config.webhookVerifyToken &&
    token === config.webhookVerifyToken
  ) {
    await writeAuditLog({
      action: "meta.webhook_verified",
      actorType: "system",
      metadata: { ok: true },
    });
    return new NextResponse(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(
    { error: "Webhook doğrulaması başarısız. Verify Token eşleşmiyor." },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  // Receive webhook events; do not log raw payloads that may contain PII.
  await req.json().catch(() => null);
  await writeAuditLog({
    action: "meta.webhook_event",
    actorType: "system",
    metadata: { received: true },
  });
  return NextResponse.json({ ok: true });
}
