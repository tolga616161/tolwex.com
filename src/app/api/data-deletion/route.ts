import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { getMetaConfig } from "@/lib/meta/config";
import { writeAuditLog } from "@/lib/audit";

/**
 * Meta data deletion callback.
 * https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const expected = createHmac("sha256", appSecret).update(payload).digest();
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) {
    return null;
  }

  const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as { user_id?: string };
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const signedRequest = form?.get("signed_request");
  if (typeof signedRequest !== "string") {
    return NextResponse.json({ error: "signed_request required" }, { status: 400 });
  }

  const config = await getMetaConfig();
  if (!config.configured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const data = parseSignedRequest(signedRequest, config.appSecret);
  if (!data?.user_id) {
    return NextResponse.json({ error: "invalid_signed_request" }, { status: 400 });
  }

  const connections = await prisma.instagramConnection.findMany({
    where: { metaUserId: data.user_id },
  });

  for (const conn of connections) {
    await prisma.instagramConnection.update({
      where: { id: conn.id },
      data: {
        connected: false,
        encryptedAccessToken: null,
        tokenStatus: "revoked",
        igUsername: null,
        tokenExpiresAt: null,
        disconnectedAt: new Date(),
      },
    });
  }

  const confirmationCode = `del_${data.user_id}_${Date.now()}`;
  await writeAuditLog({
    action: "meta.data_deletion",
    actorType: "system",
    actorId: data.user_id,
    metadata: { confirmationCode, removed: connections.length },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.json({
    url: `${base}/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

export async function GET(req: NextRequest) {
  // Webhook verification style probe
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const config = await getMetaConfig();

  if (mode === "subscribe" && token && config.webhookVerifyToken && token === config.webhookVerifyToken) {
    return new NextResponse(challenge || "", { status: 200 });
  }

  return NextResponse.json({
    status: "ok",
    info: "Meta data deletion endpoint. Use POST with signed_request.",
  });
}
