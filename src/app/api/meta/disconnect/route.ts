import { NextResponse } from "next/server";
import { ensureVisitorSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto/tokens";
import { revokeMetaToken } from "@/lib/meta/oauth";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const { visitorId } = await ensureVisitorSession();
  const connection = await prisma.instagramConnection.findUnique({
    where: { visitorSessionId: visitorId },
  });

  if (!connection) {
    return NextResponse.json({
      ok: true,
      message: "Aktif Instagram bağlantısı bulunamadı.",
    });
  }

  if (connection.encryptedAccessToken) {
    try {
      const token = decryptSecret(connection.encryptedAccessToken);
      await revokeMetaToken(token);
    } catch {
      // Local disconnect still proceeds
    }
  }

  await prisma.instagramConnection.update({
    where: { id: connection.id },
    data: {
      connected: false,
      encryptedAccessToken: null,
      tokenStatus: "revoked",
      tokenExpiresAt: null,
      lastApiError: null,
      disconnectedAt: new Date(),
    },
  });

  await writeAuditLog({
    action: "oauth.disconnected",
    actorType: "visitor",
    actorId: visitorId,
    metadata: { connectionId: connection.id },
  });

  return NextResponse.json({
    ok: true,
    message: "Instagram bağlantınız kaldırıldı. Saklanan erişim bilgileri silindi.",
  });
}
