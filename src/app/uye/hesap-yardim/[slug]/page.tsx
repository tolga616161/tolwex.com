"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MemberGate } from "@/components/smm/MemberGate";
import { AccountHelpForm } from "@/components/account-help/AccountHelpForm";
import { getAccountHelpTool } from "@/lib/account-help";

export default function AccountHelpToolPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const tool = getAccountHelpTool(slug);

  if (!tool) {
    return (
      <MemberGate>
        {() => (
          <div className="sp-page">
            <div className="sp-page-title">
              <h1>Servis bulunamadı</h1>
              <p>Bu hesap yardım servisi yok.</p>
            </div>
            <Link href="/uye/hesap-yardim" className="btn btn-primary">
              Hesap kurtarmaya dön
            </Link>
          </div>
        )}
      </MemberGate>
    );
  }

  return (
    <MemberGate>
      {() => (
        <div className="sp-page">
          <div className="sp-page-title">
            <p className="section-kicker">
              <Link href="/uye/hesap-yardim">Hesap Kurtarma</Link> · {tool.short}
            </p>
            <h1>{tool.title}</h1>
            <p>{tool.description}</p>
          </div>
          <div className="account-help-panel">
            <AccountHelpForm tool={tool} />
          </div>
        </div>
      )}
    </MemberGate>
  );
}
