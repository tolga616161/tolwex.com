import { NextRequest, NextResponse } from "next/server";
import { ensureVisitorSession } from "@/lib/session";
import { buildConnectionDashboard } from "@/lib/meta/dashboard";
import { MetaIntegrationError, userMessageFor } from "@/lib/meta/errors";

export async function GET(req: NextRequest) {
  try {
    const { visitorId } = await ensureVisitorSession();
    const refresh = req.nextUrl.searchParams.get("refresh") !== "0";
    const data = await buildConnectionDashboard(visitorId, refresh);
    return NextResponse.json(data);
  } catch (e) {
    const kind = e instanceof MetaIntegrationError ? e.kind : "unknown";
    return NextResponse.json(
      {
        error: true,
        kind,
        message: userMessageFor(kind),
      },
      { status: e instanceof MetaIntegrationError ? e.httpStatus : 500 }
    );
  }
}
