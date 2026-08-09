import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  {
    question: "Nasıl sipariş veririm?",
    answer:
      "Üye girişi yapın → Yeni Sipariş → kategori ve servis seçin → link ve adet girin → bakiyenizden düşülerek sipariş otomatik başlar.",
    sort: 1,
  },
  {
    question: "Bakiye nasıl yüklerim?",
    answer:
      "Bakiye Yükle sayfasından talep oluşturun veya kupon kodu kullanın. WhatsApp üzerinden de bilgilendirme yapabilirsiniz.",
    sort: 2,
  },
  {
    question: "API kullanabilir miyim?",
    answer:
      "Evet. Panel → API bölümünden anahtarınızı alın. PerfectPanel uyumlu /api/v1 uç noktası: services, add, status, balance.",
    sort: 3,
  },
  {
    question: "Sipariş durumu ne zaman güncellenir?",
    answer:
      "Sipariş durumları panelde periyodik olarak güncellenir. Siparişlerim ekranından takip edebilirsiniz.",
    sort: 4,
  },
];

export async function GET() {
  let faqs = await prisma.faq.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
  });

  if (!faqs.length) {
    await prisma.faq.createMany({ data: DEFAULTS });
    faqs = await prisma.faq.findMany({
      where: { active: true },
      orderBy: { sort: "asc" },
    });
  } else {
    // Refresh outdated seeded copy that named third-party providers
    const stale = faqs.filter(
      (f) =>
        /tedarikçi|smmapi|sağlayıcı/i.test(f.answer) ||
        (f.question.includes("Sipariş durumu") &&
          f.answer !== DEFAULTS[3].answer)
    );
    for (const f of stale) {
      const fresh = DEFAULTS.find((d) => d.question === f.question);
      if (fresh && fresh.answer !== f.answer) {
        await prisma.faq.update({
          where: { id: f.id },
          data: { answer: fresh.answer },
        });
      }
    }
    if (stale.length) {
      faqs = await prisma.faq.findMany({
        where: { active: true },
        orderBy: { sort: "asc" },
      });
    }
  }

  return NextResponse.json({ faqs });
}
