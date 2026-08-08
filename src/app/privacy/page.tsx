export default function PrivacyPage() {
  return (
    <div className="site-shell py-10 pb-20 prose-invert max-w-3xl">
      <h1 className="display text-4xl font-bold mb-6">Gizlilik Politikası</h1>
      <div className="space-y-5 muted leading-relaxed">
        <p>
          TOLWEX, Instagram hesap bağlantısını yalnızca resmi Meta/Instagram
          OAuth akışı üzerinden gerçekleştirir.
        </p>
        <h2 className="display text-2xl text-white">Meta / Instagram bağlantısı</h2>
        <p>
          Instagram hesabınız yalnızca resmi Meta bağlantısı üzerinden bağlanır.
          Instagram şifreniz platformumuz tarafından istenmez veya saklanmaz.
          Cookie, session, 2FA kodu veya recovery code talep edilmez.
        </p>
        <h2 className="display text-2xl text-white">Toplanan veriler</h2>
        <p>
          OAuth sonrası Meta API’nin döndürdüğü sınırlı hesap bilgileri (ör. kullanıcı
          kimliği, kullanıcı adı, verilen izinler) ve şifreli erişim token’ı
          saklanabilir. Access token şifreli tutulur ve frontend’e gönderilmez.
        </p>
        <h2 className="display text-2xl text-white">Saklamama / silme</h2>
        <p>
          Bağlantıyı kaldırdığınızda veya Meta veri silme bildirimi geldiğinde ilgili
          token ve bağlantı kayıtları silinir/iptal edilir. Veri silme talepleri için{" "}
          <a href="/data-deletion" className="underline">
            Veri Silme
          </a>{" "}
          sayfasını kullanabilirsiniz.
        </p>
        <h2 className="display text-2xl text-white">Üçüncü taraflar</h2>
        <p>
          Kimlik doğrulama Meta Platforms, Inc. altyapısı üzerinden yapılır. Meta’nın
          kendi gizlilik politikası da geçerlidir.
        </p>
      </div>
    </div>
  );
}
