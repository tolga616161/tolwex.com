import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const featured = req.nextUrl.searchParams.get("featured") === "1";
  const category = req.nextUrl.searchParams.get("category");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(featured ? { featured: true } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ products });
}
