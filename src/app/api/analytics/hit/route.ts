import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = req.headers.get("x-real-ip")?.trim();
  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  return xf || real || vercel || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`visit:${ip}`, 60, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      path?: string;
      referrer?: string;
      event?: "enter" | "leave";
      visitId?: string;
    };

    const sessionId = String(body.sessionId || "").slice(0, 80);
    if (!sessionId) {
      return NextResponse.json({ error: "session gerekli" }, { status: 400 });
    }

    const event = body.event === "leave" ? "leave" : "enter";
    const path = String(body.path || "/").slice(0, 300);
    if (path.startsWith("/admin61") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (event === "leave") {
      const id = String(body.visitId || "").slice(0, 40);
      if (id) {
        await prisma.siteVisit
          .update({
            where: { id },
            data: { leftAt: new Date() },
          })
          .catch(() => null);
      }
      return NextResponse.json({ ok: true });
    }

    const ua = (req.headers.get("user-agent") || "").slice(0, 280);
    const referrer = String(body.referrer || "").slice(0, 500);
    const country = (req.headers.get("x-vercel-ip-country") || "").slice(0, 8);

    // Same session + path within 2 minutes → bump hitCount
    const recent = await prisma.siteVisit.findFirst({
      where: {
        sessionId,
        path,
        enteredAt: { gt: new Date(Date.now() - 2 * 60_000) },
      },
      orderBy: { enteredAt: "desc" },
    });

    if (recent) {
      const updated = await prisma.siteVisit.update({
        where: { id: recent.id },
        data: { hitCount: { increment: 1 }, leftAt: null },
      });
      return NextResponse.json({ ok: true, id: updated.id });
    }

    const visit = await prisma.siteVisit.create({
      data: {
        sessionId,
        ip,
        path,
        referrer,
        userAgent: ua,
        country,
      },
    });

    // Keep table lean
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.siteVisit
      .deleteMany({ where: { enteredAt: { lt: cutoff } } })
      .catch(() => null);

    return NextResponse.json({ ok: true, id: visit.id });
  } catch (e) {
    console.error("analytics_hit_failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
