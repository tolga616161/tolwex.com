import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecoveryApplicationForm } from "@/components/recovery/RecoveryApplicationForm";
import { getRecoveryService, RECOVERY_SERVICES } from "@/lib/recovery";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getRecoveryService(slug);
  if (!service) return { title: "Başvuru" };
  return {
    title: `${service.title} Başvurusu`,
    description: service.description,
  };
}

export function generateStaticParams() {
  return RECOVERY_SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function BasvuruPage({ params }: Props) {
  const { slug } = await params;
  const service = getRecoveryService(slug);
  if (!service) notFound();

  return (
    <div className="rec-apply">
      <div className="rec-apply-bg" aria-hidden />
      <div className="site-shell rec-apply-shell">
        <p className="rec-apply-kicker">
          <Link href="/">TOLWEX</Link> · {service.short}
        </p>
        <h1 className="display rec-apply-title">{service.title}</h1>
        <p className="rec-apply-lead">{service.description}</p>
        <div className="rec-apply-panel">
          <RecoveryApplicationForm service={service} />
        </div>
      </div>
    </div>
  );
}
