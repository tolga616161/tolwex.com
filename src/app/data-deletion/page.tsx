export default function DataDeletionPage() {
  return (
    <div className="site-shell py-10 pb-20 max-w-3xl">
      <h1 className="display text-4xl font-bold mb-6">Veri Silme</h1>
      <div className="space-y-5 muted leading-relaxed">
        <p>
          Veri silme talepleriniz için WhatsApp üzerinden yazın:
          +90 533 823 61 75
        </p>
        <p>
          Meta uygulama ayarlarından da veri silme talebi oluşturabilirsiniz.
          Bağlantı kaydı ve şifreli token’lar talep üzerine kaldırılır.
        </p>
        <code className="block surface rounded-xl p-4 text-sm text-white break-all">
          https://tolwex.com/data-deletion
        </code>
      </div>
    </div>
  );
}
