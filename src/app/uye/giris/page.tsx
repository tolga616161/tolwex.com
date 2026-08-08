import { MemberAuthForm } from "@/components/auth/MemberAuthForm";

export const metadata = { title: "Üye Girişi — TOLWEX" };

export default function MemberLoginPage() {
  return (
    <div className="site-shell py-12 pb-24 max-w-lg mx-auto">
      <MemberAuthForm mode="login" />
    </div>
  );
}
