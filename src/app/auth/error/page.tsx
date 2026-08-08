import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="site-shell py-16 pb-24 max-w-xl">
      <h1 className="display text-3xl md:text-4xl font-bold mb-4">İşlem tamamlanamadı</h1>
      <p className="muted leading-relaxed mb-8">
        Instagram bağlama bu sitede kullanılmıyor. SMM hizmetleri için üye paneline gidin.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/hizmetler" className="btn btn-primary">
          Hizmetler
        </Link>
        <Link href="/uye/giris" className="btn btn-ghost">
          Üye girişi
        </Link>
      </div>
    </div>
  );
}
