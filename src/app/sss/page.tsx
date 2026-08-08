"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Faq = { id: string; question: string; answer: string };

export default function PublicFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFaqs(d?.faqs || []));
  }, []);

  return (
    <div className="site-shell py-12 pb-24">
      <div className="section-head mb-8">
        <p className="section-kicker">Destek</p>
        <h1 className="section-title">SSS</h1>
        <p className="section-sub">TOLWEX SMM paneli hakkında sık sorulanlar</p>
      </div>
      <div className="sp-faq-list">
        {faqs.map((f) => (
          <details key={f.id} className="sp-card sp-faq">
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/uye/kayit" className="btn btn-primary">
          Hemen üye ol
        </Link>
      </div>
    </div>
  );
}
