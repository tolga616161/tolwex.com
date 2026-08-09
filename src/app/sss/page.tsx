import Link from "next/link";
import { IadeKosullari } from "@/components/legal/IadeKosullari";

export default function IadeKosullariPage() {
  return (
    <div className="site-shell py-12 pb-24">
      <div className="section-head mb-8">
        <p className="section-kicker">Yasal</p>
        <h1 className="section-title">İade Koşulları</h1>
        <p className="section-sub">
          Sipariş, iptal, telafi ve bakiye iadesi kuralları
        </p>
      </div>
      <IadeKosullari variant="public" />
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/terms" className="btn btn-ghost">
          Kullanım şartları
        </Link>
        <Link href="/uye/kayit" className="btn btn-primary">
          Hemen üye ol
        </Link>
      </div>
    </div>
  );
}
