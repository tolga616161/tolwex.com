import { VerifyForm } from "@/components/auth/VerifyForm";

export const metadata = {
  title: "Hesap Doğrulama",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <div className="auth-shell">
      <div className="auth-shell-bg" aria-hidden />
      <div className="auth-shell-inner">
        <VerifyForm />
      </div>
    </div>
  );
}
