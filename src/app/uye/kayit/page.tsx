import { MemberAuthForm } from "@/components/auth/MemberAuthForm";

export const metadata = { title: "Üye Ol" };

export default function MemberRegisterPage() {
  return (
    <div className="site-shell py-12 pb-24 max-w-lg mx-auto">
      <MemberAuthForm mode="register" />
    </div>
  );
}
