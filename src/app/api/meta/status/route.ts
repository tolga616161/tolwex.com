import { NextResponse } from "next/server";
import { getMetaPublicStatus } from "@/lib/meta/config";

export async function GET() {
  const status = await getMetaPublicStatus();
  return NextResponse.json(status);
}
