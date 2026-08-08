export default async function DataDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="site-shell py-10 pb-20 max-w-3xl">
      <h1 className="display text-4xl font-bold mb-6">Veri Silme</h1>
      <div className="space-y-5 muted leading-relaxed">
        <p>
          Meta uygulama ayarlarından veri silme talebi oluşturduğunuzda sistem
          bağlantı kaydınızı ve şifreli token’ı kaldırır.
        </p>
        <p>
          Ayrıca sitedeki “Instagram bağlantısını kaldır” düğmesiyle de token’ınızı
          silebilirsiniz.
        </p>
        <p>
          Meta Developer Console’da Data Deletion Callback URL olarak şunu kullanın:
        </p>
        <code className="block surface rounded-xl p-4 text-sm text-white break-all">
          {`${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/api/data-deletion`}
        </code>
        {code ? (
          <div className="surface rounded-xl p-4 text-white">
            Silme onay kodu: <strong>{code}</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}
