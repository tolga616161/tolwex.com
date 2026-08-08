import { redirect } from "next/navigation";

export const metadata = { title: "Yeni Sipariş" };

/** Classic panels use home as New Order — keep old URL working. */
export default async function NewOrderRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const service = typeof sp.service === "string" ? sp.service : "";
  const sid = typeof sp.sid === "string" ? sp.sid : "";
  const q = new URLSearchParams();
  if (service) q.set("service", service);
  if (sid) q.set("sid", sid);
  const qs = q.toString();
  redirect(qs ? `/uye?${qs}` : "/uye");
}
