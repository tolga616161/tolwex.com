import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import {
  buildRecoveryWhatsAppMessage,
  caseNumberFromTicket,
  recoveryWhatsAppUrl,
  type AccountHelpKind,
} from "@/lib/account-help";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const tickets = await prisma.supportTicket.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      subject: true,
      message: true,
      kind: true,
      status: true,
      reply: true,
      createdAt: true,
      imageData: true,
    },
  });
  return NextResponse.json({
    tickets: tickets.map((t) => {
      const kind = (t.kind || "general") as AccountHelpKind | "general";
      const caseNumber =
        kind === "closed" || kind === "fake" || kind === "stolen"
          ? caseNumberFromTicket(kind, t.id)
          : null;
      return {
        id: t.id,
        subject: t.subject,
        message: t.message,
        kind: t.kind,
        status: t.status,
        reply: t.reply,
        createdAt: t.createdAt,
        hasImage: Boolean(t.imageData),
        caseNumber,
      };
    }),
  });
}

const schema = z.object({
  subject: z.string().min(3).max(160).optional(),
  message: z.string().min(1).max(4000).optional(),
  kind: z.enum(["general", "closed", "fake", "stolen"]).optional(),
  username: z.string().max(80).optional(),
  email: z.string().max(160).optional(),
  whenStolen: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
  analysisSummary: z.string().max(1000).optional(),
  analysisPoints: z.array(z.string().max(300)).max(12).optional(),
  closureGuess: z.string().max(300).optional(),
  imageData: z
    .string()
    .max(2_500_000)
    .optional()
    .refine((v) => !v || v.startsWith("data:image/"), "Görsel formatı geçersiz"),
});

const KIND_SUBJECT: Record<string, string> = {
  closed: "Kapanan hesap kurtarma",
  fake: "Adınıza açılan fake hesap",
  stolen: "Çalınan hesap kurtarma",
  general: "Destek talebi",
};

export async function POST(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Formu kontrol et";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const kind = parsed.data.kind || "general";
  const isHelp = kind === "closed" || kind === "fake" || kind === "stolen";

  if (isHelp) {
    if (!parsed.data.imageData) {
      return NextResponse.json({ error: "Görsel gerekli" }, { status: 400 });
    }
    if (!parsed.data.username?.trim()) {
      return NextResponse.json({ error: "Kullanıcı adı gerekli" }, { status: 400 });
    }
    if (!parsed.data.whenStolen?.trim()) {
      return NextResponse.json({ error: "Zaman bilgisini doldur" }, { status: 400 });
    }
    if (!parsed.data.note?.trim() || parsed.data.note.trim().length < 10) {
      return NextResponse.json({ error: "Detaylı açıklama yaz (en az 10 karakter)" }, { status: 400 });
    }
  }

  const subject =
    parsed.data.subject?.trim() || KIND_SUBJECT[kind] || "Destek talebi";

  const lines = [
    parsed.data.analysisSummary ? `ANALİZ: ${parsed.data.analysisSummary}` : "",
    parsed.data.closureGuess ? `Tahmini durum: ${parsed.data.closureGuess}` : "",
    ...(parsed.data.analysisPoints || []).map((p) => `• ${p}`),
    parsed.data.message?.trim() || "",
    parsed.data.username ? `Hesap: ${parsed.data.username.trim()}` : "",
    parsed.data.email ? `E-posta: ${parsed.data.email.trim()}` : "",
    parsed.data.whenStolen
      ? kind === "stolen"
        ? `Çalınma zamanı: ${parsed.data.whenStolen.trim()}`
        : kind === "closed"
          ? `Kapanma zamanı: ${parsed.data.whenStolen.trim()}`
          : `Fark edilme: ${parsed.data.whenStolen.trim()}`
      : "",
    parsed.data.note
      ? kind === "closed"
        ? `Kapanma sebebi:\n${parsed.data.note.trim()}`
        : `Detay:\n${parsed.data.note.trim()}`
      : "",
    parsed.data.imageData ? "[Ekran görüntüsü eklendi]" : "",
    isHelp ? "WhatsApp’a iletildi." : "",
  ].filter(Boolean);

  const message = lines.join("\n") || subject;

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        memberId: member.id,
        subject: subject.slice(0, 160),
        message: message.slice(0, 4000),
        kind,
        imageData: parsed.data.imageData || "",
      },
    });
    const caseNumber =
      kind === "closed" || kind === "fake" || kind === "stolen"
        ? caseNumberFromTicket(kind, ticket.id)
        : null;

    const whatsappMessage =
      caseNumber && (kind === "closed" || kind === "stolen" || kind === "fake")
        ? buildRecoveryWhatsAppMessage({
            kind,
            caseNumber,
            username: parsed.data.username?.trim() || "",
            email: parsed.data.email?.trim() || undefined,
            whenText: parsed.data.whenStolen?.trim() || "",
            detail: parsed.data.note?.trim() || "",
            memberUsername: member.username,
            memberEmail: member.email,
          })
        : null;

    return NextResponse.json({
      ok: true,
      caseNumber,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        kind: ticket.kind,
        status: ticket.status,
        createdAt: ticket.createdAt,
        caseNumber,
      },
      redirect: "/uye/destek",
      whatsappMessage,
      whatsappUrl: whatsappMessage ? recoveryWhatsAppUrl(whatsappMessage) : null,
      metaHelp: null,
    });
  } catch (e) {
    console.error("support_create_failed", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "Kayıt alınamadı — biraz sonra tekrar dene" },
      { status: 500 }
    );
  }
}
