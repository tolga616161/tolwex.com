"use client";

import { MemberGate } from "@/components/smm/MemberGate";
import { AccountHelpHub } from "@/components/account-help/AccountHelpHub";

export default function AccountHelpPage() {
  return (
    <MemberGate>
      {() => (
        <div className="sp-page">
          <AccountHelpHub />
        </div>
      )}
    </MemberGate>
  );
}
