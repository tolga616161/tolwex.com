import { MemberAuthForm } from "@/components/auth/MemberAuthForm";

export const metadata = { title: "Üye Girişi" };

export default function MemberLoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-shell-bg" aria-hidden />
      <div className="auth-shell-inner">
        <MemberAuthForm mode="login" />
      </div>
    </div>
  );
}
