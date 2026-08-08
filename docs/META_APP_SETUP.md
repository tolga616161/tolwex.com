# Meta Developer App Kurulum Rehberi

1. https://developers.facebook.com/ adresinden uygulama oluşturun.
2. Ürün olarak **Facebook Login** / **Instagram** ekleyin (hesap türünüze uygun).
3. Ayarlar:
   - **App ID** → `META_APP_ID`
   - **App Secret** → `META_APP_SECRET` (asla frontend’e koymayın)
   - **Valid OAuth Redirect URIs** → `{APP_URL}/api/meta/oauth/callback`
   - **App Domains** → sitenizin domain’i
   - **Privacy Policy URL** → `{APP_URL}/privacy`
   - **Terms of Service URL** → `{APP_URL}/terms`
   - **Data Deletion Request URL** → `{APP_URL}/api/data-deletion`
4. Gerekli izinleri App Review sürecine göre talep edin (`instagram_basic`, `pages_show_list`, vb.).
5. Admin panelinden **Meta API Bağlantısını Test Et** ile doğrulayın.
6. Development mode’da yalnızca rol eklenmiş test kullanıcıları OAuth tamamlayabilir.

Credential yoksa uygulama çalışır; Meta özellikleri “yapılandırılmamış” kalır.
