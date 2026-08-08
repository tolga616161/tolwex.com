import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let items = await prisma.newsItem.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (!items.length) {
    await prisma.newsItem.create({
      data: {
        type: "announcement",
        title: "TOLWEX SMM Panel hazır",
        body: "Yeni sipariş, toplu sipariş, bakiye, destek ve PerfectPanel uyumlu API aktif.",
      },
    });
    items = await prisma.newsItem.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  return NextResponse.json({ items });
}
