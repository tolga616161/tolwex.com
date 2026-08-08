import { AdminShell } from "@/components/admin/saas/AdminShell";
import type { ReactNode } from "react";

export const metadata = {
  title: {
    default: "Admin | TOLWEX",
    template: "%s | TOLWEX Admin",
  },
  robots: { index: false, follow: false },
};

export default function Admin61Layout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
