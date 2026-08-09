import { MemberAuthForm } from "@/components/auth/MemberAuthForm";

export const metadata = { title: "Üye Ol" };

export default function MemberRegisterPage() {
  return (
    <div className="auth-shell">
      <div className="auth-shell-bg" aria-hidden />
      <div className="auth-shell-inner">
        <MemberAuthForm mode="register" />
      </div>
    </div>
  );
}
