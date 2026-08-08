import { SetupWizard } from "@/components/admin/SetupWizard";
import { DomainSetupCard } from "@/components/meta/DomainSetupCard";
import { getMetaDomainHints } from "@/lib/meta/public-urls";

export default function AdminSetupPage() {
  const domains = getMetaDomainHints();
  return (
    <div className="site-shell py-10 pb-20 space-y-8">
      <DomainSetupCard
        appDomains={domains.appDomains}
        siteUrl={domains.siteUrl}
        redirectUri={domains.oauthRedirectUri}
      />
      <SetupWizard />
    </div>
  );
}
