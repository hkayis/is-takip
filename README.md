# İş Takip Portalı

İş takip uygulaması. İşler liste ve kanban görünümünde takip edilir, durum ve
aşama değişiklikleri geçmişe yazılır, bu geçmişten aşama süreleri ve darboğaz
raporu üretilir.

Backend ASP.NET Core, frontend Angular. Tek kullanıcılı, JWT ile korunuyor.

## Gereksinimler

- .NET SDK 10.0+
- Node.js 20.19+ (22 veya 24 önerilir) ve npm
- SQL Server (Express / Developer) — Windows kimlik doğrulaması ile

## Kurulum

### Backend

```bash
cd backend/WebApplication1/WebApplication1
dotnet run
```

`http://localhost:5227` üzerinde açılır. İlk çalıştırmada veritabanını oluşturur,
migration'ları uygular ve tablo boşsa örnek verileri ekler — yani klonladıktan
sonra dolu bir panoyla karşılaşırsın.

**LocalDB kullanıyorsan** `appsettings.json` içindeki bağlantı dizesini değiştir:

```
Server=(localdb)\\MSSQLLocalDB;Database=IsTakipDb;Trusted_Connection=True;TrustServerCertificate=True;
```

### Frontend

Backend çalışırken ayrı bir terminalde:

```bash
cd frontend
npm ci
npm start
```

`http://localhost:4200` adresinde açılır.

## Giriş

| Kullanıcı | Şifre |
|-----------|-----------|
| admin     | Admin123! |

Giriş uç noktası IP başına 5 dakikada 5 denemeyle sınırlı; genel sınır dakikada
100 istek. Sınır aşılırsa arayüzde ne kadar beklenmesi gerektiğini söyleyen bir
mesaj çıkar.

## Ekranlar

| Ekran | İçerik |
|---|---|
| **Pano** | Durum kutuları (sayı + adam-gün) ve dört grafik yuvası |
| **İşler** | Liste ve kanban görünümü, sürükle-bırak, filtreler, Excel dışa aktarma |
| **Rapor** | Özet, aşama süreleri, büyüklük başına ortalama süre, teslim geçmişi |
| **Ayarlar** | Büyüklük eşikleri, hedef süreler, dikkat penceresi, tema, kanbanda tamamlananların görünme süresi |

### Pano yuvaları

Pano dört grafik gösterir ama kayıtta yedi grafik vardır. Her kartın başlığındaki
`⋯` menüsünden o yuvaya başka bir grafik konabilir; seçilen grafik başka bir
yuvadaysa ikisi yer değiştirir. Seçim tarayıcıda saklanır.

Mevcut grafikler: Dikkat Gerekenler, Öncelik Dağılımı, Büyüklük Dağılımı, Aşama
Dağılımı, Teslim Performansı, Aylık Tamamlanan, Tahmin vs Gerçekleşen.

Yeni grafik eklemek için: `jobs` input'u alan bir bileşen yaz, `grafikler.ts`
kaydına bir satır ekle, `dashboard.html`'deki `@switch`'e bir dal ekle.

## Proje yapısı

### Backend

```
backend/WebApplication1/WebApplication1/
  Domain/Entities/        Job, JobHistory, User — hiçbir katmana bağımlı değil
  Application/
    DTOs/                 API sınırındaki tipler
    Interfaces/           IJobRepository, IUserRepository
    Services/             JobService, ReportService, AuthService, TokenService
  Data/
    AppDbContext.cs       EF Core context
    Repositories/         Arayüzlerin EF Core implementasyonları
    Migrations/
  Controllers/            Auth, Jobs, Reports
  Program.cs              Kompozisyon kökü: DI, JWT, CORS, rate limit, seed
```

### Frontend

```
frontend/src/app/
  pages/           login, dashboard, jobs, rapor, ayarlar
  components/      Pano grafik kartları, yuva menüsü, kanban kartı
  dialogs/         Yeni iş, durum değiştirme, onay
  services/        auth, job-api, job-store (paylaşılan veri katmanı), ayar
  interceptors/    JWT ekleme, merkezi hata yakalama
  guard/           Oturum kontrolü
  grafikler.ts     Pano grafik kaydı
  etiketler.ts     Enum kodu → görünen ad eşlemeleri
```

## Teknik notlar

### Mimari ve bağımlılık yönü

Katmanlar tek yöne bakar: `Domain` hiçbir şeye, `Application` yalnızca `Domain`'e,
`Data` ve `Controllers` ise `Application`'a bağımlıdır.

Bunu mümkün kılan şey bağımlılığın tersine çevrilmesi: `IJobRepository` ve
`IUserRepository` arayüzleri `Application/Interfaces` altında tanımlıdır, EF Core
kullanan implementasyonları `Data/Repositories` altında durur. `JobService` EF
Core'u hiç tanımaz — `DbContext`, `Include`, `ToListAsync` gibi şeyler servis
katmanında geçmez. Veritabanı teknolojisi değişirse yalnızca `Data` katmanı
yeniden yazılır.

Arayüzlerin dili alan diline yakın tutuldu (`GecmisleGetirAsync`,
`DurumaGoreGecmisleGetirAsync`) ki servis "veriyi nasıl çekeyim" değil "ne
istiyorum" desin.

`Program.cs` kompozisyon köküdür — bütün katmanları tanıyan tek dosya orasıdır;
hangi arayüzün hangi sınıfa bağlanacağı orada kararlaştırılır.

### Veri katmanı

- **Code First + migration.** Şema C# sınıflarından üretilir, açılışta
  `MigrateAsync()` uygulanır.
- **Repository + Unit of Work.** `Ekle`/`Guncelle`/`Sil` değişiklikleri biriktirir,
  `KaydetAsync()` hepsini tek transaction'da yazar. Bir iş güncellenip geçmiş
  kaydı eklendiğinde ikisi ya birlikte olur ya hiç olmaz.
- **Enum'lar metin olarak saklanır** (`HasConversion<string>`). Veritabanına
  bakınca `2` yerine `DevamEdiyor` görünür ve enum'a yeni değer eklemek mevcut
  satırların anlamını kaydırmaz.
- **UTC dönüştürücü.** Okunan `DateTime`'lar `Kind=Utc` olarak işaretlenir; aksi
  halde `Unspecified` döner, JSON'a `Z` eklenmez ve istemci saati kaydırarak
  gösterir.
- **`ValueGeneratedNever()`.** İş numarasını kullanıcı belirlediği için otomatik
  artan kimlik kapalıdır.

### Denetim izi

Her durum ve aşama değişikliği `JobHistory` tablosuna yazılır; alan düzenlemeleri
de aynı tabloya, `Changes` alanı dolu olarak kaydedilir. Bu alan aynı zamanda
ayırt edici olarak kullanılır: aşama süresi hesabı yalnızca `Changes == null`
satırlarını, yani gerçek durum geçişlerini dikkate alır. Böylece tek bir tablo
hem "ne zaman ne oldu" zaman çizelgesini hem de düzenleme geçmişini taşır.

### Güvenlik

- JWT (HS256) ile kimlik doğrulama, şifreler BCrypt ile hash'lenir.
- **Rate limiting**: giriş için IP başına 5 dakikada 5 deneme (kaba kuvvet
  denemesine karşı), genel trafik için IP başına dakikada 100 istek. Sınır
  aşıldığında `Retry-After` başlığı ve kullanıcının anlayacağı bir mesaj döner.
- JWT anahtarı sürüm kontrolündeki `appsettings.json`'da tutulmaz; geliştirme
  değeri `appsettings.Development.json`'dadır, üretimde ortam değişkeninden gelir.

### Frontend mimarisi

- Standalone bileşenler, sinyal tabanlı durum (`signal`, `computed`,
  `input.required`); türetilmiş her değer `computed`, elle senkronlanan kopya
  durum yok.
- **`JobStore` tek veri kaynağıdır.** Sayfalar API'yi doğrudan çağırmaz; store'un
  sinyallerini okur. Bir iş güncellendiğinde store yenilenir ve onu dinleyen
  bütün ekranlar birlikte güncellenir.
- **İyimser güncelleme.** Kanban'da kart sürüklendiğinde arayüz sunucuyu
  beklemeden taşır; istek başarısız olursa store yenilenip değişiklik geri alınır.
- **Interceptor'lar.** Biri her isteğe JWT ekler, diğeri hataları tek yerde
  yakalar (401'de oturumu temizler, 429'da bekleme mesajını gösterir) — böylece
  her bileşende ayrı hata kodu kontrolü yapılmaz.
- **İçerik projeksiyonu** (`<ng-content>`). Pano yuva menüsü dashboard'da yazılır
  ama kartların başlığına yerleşir; kartlar menünün varlığından habersizdir ve
  kendi başlıklarının sahibi kalır.
- Kanban sürükle-bırak için Angular CDK, koyu tema için Material 3 tasarım
  token'ları ve `light-dark()`, pano ve rapor çıktıları için `@media print`
  kuralları.

## Notlar

- `appsettings.Development.json` içindeki JWT anahtarı yalnızca geliştirme
  içindir; üretimde `Jwt__Key` ortam değişkeninden verilmelidir.
- Ayarlar (eşikler, hedefler, tema, pano yuvaları) sunucuda değil tarayıcının
  localStorage'ında tutulur — makine değiştirince sıfırlanır.
