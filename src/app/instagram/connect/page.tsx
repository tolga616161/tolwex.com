import { redirect } from "next/navigation";

/** Instagram bağlama kaldırıldı — SMM hizmetlerine yönlendir. */
export default function InstagramConnectPage() {
  redirect("/hizmetler");
}
