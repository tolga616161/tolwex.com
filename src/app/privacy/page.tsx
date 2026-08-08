export const metadata = { title: "Gizlilik" };

export default function PrivacyPage() {
  return (
    <div className="site-shell py-16 max-w-3xl">
      <h1 className="display text-3xl mb-6">Gizlilik Politikası</h1>
      <div className="grid gap-4 muted text-sm leading-relaxed">
        <p>
          TOLWEX bir SMM panel hizmetidir. Üyelik, sipariş ve bakiye işlemleri için
          gerekli hesap bilgilerini (kullanıcı adı, e-posta, şifre özeti) saklarız.
        </p>
        <h2 className="display text-xl text-white">Veri kullanımı</h2>
        <p>
          Sipariş linkleri ve işlem kayıtları hizmetin sunulması amacıyla tutulur.
          Veriler üçüncü taraf SMM tedarikçisine yalnızca siparişin yerine getirilmesi
          için iletilir.
        </p>
        <h2 className="display text-xl text-white">İletişim</h2>
        <p>Destek için WhatsApp veya panel içi Destek bölümünü kullanabilirsiniz.</p>
      </div>
    </div>
  );
}
