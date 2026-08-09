import { prisma } from "@/lib/db";
import { fetchSmmMultiStatus } from "@/lib/smm/client";
import { adjustBalance } from "@/lib/member";
import { pushOrdersToGist } from "@/lib/orders-durable";

function normStatus(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

const OPEN_STATUSES = [
  "pending",
  "processing",
  "inprogress",
  "in progress",
  "awaiting",
  "partial",
];

export async function syncOpenOrderStatuses(limit = 100) {
  const open = await prisma.smmOrder.findMany({
    where: {
      providerOrderId: { not: null },
      NOT: {
        status: {
          in: ["completed", "refunded", "canceled", "cancelled", "error"],
        },
      },
    },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });

  const withIds = open.filter((o) => o.providerOrderId);
  if (!withIds.length) return { checked: 0, updated: 0 };

  // smmapi multi-status in chunks of 50
  let updated = 0;
  for (let i = 0; i < withIds.length; i += 50) {
    const chunk = withIds.slice(i, i + 50);
    const ids = chunk.map((o) => o.providerOrderId!);
    const result = await fetchSmmMultiStatus(ids);

    for (const order of chunk) {
      const row = result[String(order.providerOrderId)];
      if (!row?.status) continue;
      const status = normStatus(String(row.status));
      const startCounter =
        row.start_count !== undefined ? Number(row.start_count) : order.startCounter;
      const remains = row.remains !== undefined ? Number(row.remains) : order.remains;

      const prev = normStatus(order.status);
      await prisma.smmOrder.update({
        where: { id: order.id },
        data: {
          status,
          startCounter: Number.isFinite(startCounter as number)
            ? (startCounter as number)
            : null,
          remains: Number.isFinite(remains as number) ? (remains as number) : null,
        },
      });
      updated += 1;

      if (
        (status === "canceled" || status === "cancelled" || status === "refunded") &&
        prev !== status &&
        prev !== "refunded"
      ) {
        await adjustBalance(
          order.memberId,
          order.charge,
          "adjust",
          `İade · sipariş ${order.id.slice(0, 8)}`,
          order.id
        );
      } else if (
        status === "partial" &&
        remains != null &&
        order.quantity > 0 &&
        prev !== "partial"
      ) {
        const delivered = Math.max(0, order.quantity - Number(remains));
        const unused = order.quantity - delivered;
        if (unused > 0) {
          const refund =
            Math.round(((order.charge * unused) / order.quantity) * 10000) / 10000;
          if (refund > 0) {
            await adjustBalance(
              order.memberId,
              refund,
              "adjust",
              `Kısmi iade · sipariş ${order.id.slice(0, 8)}`,
              order.id
            );
          }
        }
      }
    }
  }

  if (updated > 0) {
    await pushOrdersToGist().catch(() => null);
  }

  return { checked: withIds.length, updated, openStatuses: OPEN_STATUSES.length };
}
