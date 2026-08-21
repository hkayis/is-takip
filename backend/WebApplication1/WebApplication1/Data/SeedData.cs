using Microsoft.EntityFrameworkCore;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Data
{
    public static class SeedData
    {
        public static async Task UygulaAsync(AppDbContext db)
        {
            if (!await db.Users.AnyAsync())
            {
                db.Users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            
                });
                await db.SaveChangesAsync();
            }
            if (!await db.Jobs.AnyAsync())
            {
                var bugun = DateTime.UtcNow.Date;

                JobSize BuyuklukBul(int? adam, int? gun)
                {
                    var efor = (adam ?? 0) * (gun ?? 0);
                    if (efor <= 5) return JobSize.FastTrack;
                    if (efor <= 10) return JobSize.XS;
                    if (efor <= 25) return JobSize.S;
                    if (efor <= 50) return JobSize.M;
                    if (efor <= 100) return JobSize.L;
                    return JobSize.XL;
                }

                Job Olustur(
                    int id, string baslik, string aciklama,
                    int teslimGun, JobStatus durum, JobPriority oncelik,
                    int? adam, int? gun, int acilisGunOnce,
                    (JobStage asama, int gunSonra)[]? yolculuk = null,
                    int? kapanisGunOnce = null,
                    string? not = null,
                    string? duzenlemeOzeti = null)
                {
                    var acilis = bugun.AddDays(-acilisGunOnce);
                    DateTime? kapanis = kapanisGunOnce.HasValue ? bugun.AddDays(-kapanisGunOnce.Value) : null;

                    if (yolculuk is null && kapanis.HasValue)
                    {
                        var toplam = (kapanis.Value - acilis).TotalDays;
                        yolculuk = new[]
                        {
                            (JobStage.Analiz,     (int)(toplam * 0.10)),
                            (JobStage.Gelistirme, (int)(toplam * 0.25)),
                            (JobStage.Test,       (int)(toplam * 0.70)),
                            (JobStage.Tasima,     (int)(toplam * 0.88)),
                        };
                    }
                    yolculuk ??= Array.Empty<(JobStage, int)>();

                    var job = new Job
                    {
                        Id = id,
                        Title = baslik,
                        Description = aciklama,
                        Deadline = bugun.AddDays(teslimGun),
                        Status = durum,
                        Stage = durum == JobStatus.DevamEdiyor && yolculuk.Length > 0
                                ? yolculuk[^1].asama
                                : null,
                        Priority = oncelik,
                        Adam = adam,
                        Gun = gun,
                        Buyukluk = BuyuklukBul(adam, gun),
                        Not = not,
                        CreatedAt = acilis,
                        CompletedAt = durum == JobStatus.Tamamlandi ? kapanis : null,
                    };

                    job.History.Add(new JobHistory
                    {
                        OldStatus = null,
                        NewStatus = JobStatus.Beklemede,
                        ChangedAt = acilis,
                        Note = "İş oluşturuldu",
                    });

                    var oncekiDurum = JobStatus.Beklemede;
                    JobStage? oncekiAsama = null;

                    foreach (var (asama, gunSonra) in yolculuk)
                    {
                        job.History.Add(new JobHistory
                        {
                            OldStatus = oncekiDurum,
                            NewStatus = JobStatus.DevamEdiyor,
                            OldStage = oncekiAsama,
                            NewStage = asama,
                            ChangedAt = acilis.AddDays(gunSonra),
                            Note = oncekiAsama is null ? "Çalışmaya başlandı" : null,
                        });
                        oncekiDurum = JobStatus.DevamEdiyor;
                        oncekiAsama = asama;
                    }

                    if (durum is JobStatus.Tamamlandi or JobStatus.Iptal)
                    {
                        job.History.Add(new JobHistory
                        {
                            OldStatus = oncekiDurum,
                            NewStatus = durum,
                            OldStage = oncekiAsama,
                            NewStage = null,
                            ChangedAt = kapanis ?? acilis.AddDays(1),
                            Note = durum == JobStatus.Tamamlandi ? "Tamamlanıp teslim edildi" : "Talep geri çekildi",
                        });
                    }

                    if (duzenlemeOzeti is not null)
                    {
                        job.History.Add(new JobHistory
                        {
                            OldStatus = durum,
                            NewStatus = durum,
                            ChangedAt = acilis.AddDays(2),
                            Changes = duzenlemeOzeti,
                        });
                    }

                    return job;
                }

                db.Jobs.AddRange(
                    Olustur(1001, "Ödeme altyapısı entegrasyonu", "Yeni ödeme sağlayıcısının sisteme entegre edilmesi.",
                            -5, JobStatus.DevamEdiyor, JobPriority.Acil, 3, 12, 40,
                            new[] { (JobStage.Analiz, 2), (JobStage.Gelistirme, 6) },
                            not: "Sağlayıcının API dokümanı bekleniyor, geliştirme duraksadı."),

                    Olustur(1003, "Sunucu güvenlik yaması", "Kritik güvenlik güncellemelerinin üretim ortamına uygulanması.",
                            -2, JobStatus.DevamEdiyor, JobPriority.Acil, 1, 2, 12,
                            new[] { (JobStage.Analiz, 1), (JobStage.Gelistirme, 3), (JobStage.Test, 8) }),

                    Olustur(1004, "Ekip performans değerlendirmesi", "Çeyrek dönem performans görüşmelerinin planlanması.",
                            0, JobStatus.DevamEdiyor, JobPriority.Normal, 1, 4, 14,
                            new[] { (JobStage.Analiz, 1) }),

                    Olustur(1005, "Müşteri demo hazırlığı", "Yeni modülün müşteriye sunulacak demo ortamının hazırlanması.",
                            2, JobStatus.DevamEdiyor, JobPriority.Yuksek, 2, 4, 20,
                            new[] { (JobStage.Analiz, 2), (JobStage.Gelistirme, 6) }),

                    Olustur(1007, "Yeni CRM entegrasyonu", "Satış ekibinin kullandığı CRM ile sistemin entegre edilmesi.",
                            30, JobStatus.DevamEdiyor, JobPriority.Yuksek, 2, 15, 25,
                            new[] { (JobStage.Analiz, 3) },
                            duzenlemeOzeti: "Öncelik: Normal → Yuksek, Efor: 2×10 → 2×15"),

                    Olustur(1015, "Raporlama modülü", "Yönetim raporlarının otomatik üretilmesi için modül geliştirilmesi.",
                            6, JobStatus.DevamEdiyor, JobPriority.Normal, 2, 10, 30,
                            new[] { (JobStage.Analiz, 2), (JobStage.Gelistirme, 7), (JobStage.Test, 20), (JobStage.Tasima, 27) }),

                    Olustur(1002, "Tedarikçi sözleşme yenileme", "Lojistik tedarikçisiyle yıllık sözleşmenin gözden geçirilmesi.",
                            -12, JobStatus.Beklemede, JobPriority.Yuksek, 1, 5, 30),
                    Olustur(1006, "Bütçe revizyonu", "Yılsonu bütçesinin güncel harcamalara göre revize edilmesi.",
                            5, JobStatus.Beklemede, JobPriority.Normal, 1, 3, 6),
                    Olustur(1008, "Ofis taşınma planı", "Yeni ofise taşınma sürecinin planlanması ve koordinasyonu.",
                            40, JobStatus.Beklemede, JobPriority.Normal, 3, 6, 5),
                    Olustur(1009, "Yıllık strateji dokümanı", "Gelecek yıl hedeflerinin dokümante edilmesi.",
                            25, JobStatus.Beklemede, JobPriority.Dusuk, 1, 10, 3),
                    Olustur(1010, "Arşiv düzenleme", "Eski evrak arşivinin dijitalleştirilmesi ve tasnifi.",
                            60, JobStatus.Beklemede, JobPriority.Dusuk, 2, 20, 45,
                            not: "Öncelik düşük, uygun bir dönemde ele alınacak."),
                    Olustur(1016, "Veri ambarı migrasyonu", "Raporlama verisinin yeni ambara taşınması.",
                            90, JobStatus.Beklemede, JobPriority.Yuksek, 4, 30, 10),

                    Olustur(1101, "Fatura şablonu düzeltmesi", "Fatura çıktısındaki hatalı alan düzeltildi.",
                            -143, JobStatus.Tamamlandi, JobPriority.Normal, 1, 2, 150, kapanisGunOnce: 144),
                    Olustur(1102, "E-posta imza güncellemesi", "Kurumsal e-posta imzalarının yenilenmesi.",
                            -92, JobStatus.Tamamlandi, JobPriority.Dusuk, 2, 2, 100, kapanisGunOnce: 93),
                    Olustur(1103, "Yazıcı sözleşmesi yenileme", "Ofis yazıcı bakım sözleşmesinin uzatılması.",
                            -50, JobStatus.Tamamlandi, JobPriority.Dusuk, 1, 3, 60, kapanisGunOnce: 45),

                    Olustur(1104, "Personel oryantasyon kiti", "Yeni çalışanlar için karşılama dokümanları hazırlandı.",
                            -114, JobStatus.Tamamlandi, JobPriority.Normal, 2, 4, 130, kapanisGunOnce: 115),
                    Olustur(1105, "Depo sayım uygulaması", "Mobil sayım aracının devreye alınması.",
                            -65, JobStatus.Tamamlandi, JobPriority.Normal, 1, 7, 85, kapanisGunOnce: 60),
                    Olustur(1106, "Mobil bildirim ayarları", "Uygulama bildirim tercihlerinin eklenmesi.",
                            -27, JobStatus.Tamamlandi, JobPriority.Yuksek, 3, 3, 45, kapanisGunOnce: 28),

                    Olustur(1107, "Muhasebe entegrasyon testi", "Muhasebe yazılımıyla veri alışverişinin doğrulanması.",
                            -104, JobStatus.Tamamlandi, JobPriority.Normal, 2, 8, 140, kapanisGunOnce: 105),
                    Olustur(1108, "Bayi portalı iyileştirme", "Bayi ekranlarındaki performans sorunlarının giderilmesi.",
                            -55, JobStatus.Tamamlandi, JobPriority.Yuksek, 3, 7, 95, kapanisGunOnce: 50,
                            duzenlemeOzeti: "Termin: güncellendi, Açıklama güncellendi"),
                    Olustur(1109, "KVKK uyum çalışması", "Kişisel veri süreçlerinin mevzuata uyumlandırılması.",
                            -37, JobStatus.Tamamlandi, JobPriority.Yuksek, 1, 15, 70, kapanisGunOnce: 38),
                    Olustur(1110, "Çağrı merkezi raporu", "Çağrı istatistiklerinin raporlanması.",
                            -14, JobStatus.Tamamlandi, JobPriority.Normal, 4, 5, 55, kapanisGunOnce: 15),

                    Olustur(1111, "İK portalı yenileme", "İnsan kaynakları self-servis ekranlarının yenilenmesi.",
                            -94, JobStatus.Tamamlandi, JobPriority.Normal, 3, 12, 160, kapanisGunOnce: 95),
                    Olustur(1112, "Stok yönetim modülü", "Depo stok takibinin sisteme taşınması.",
                            -45, JobStatus.Tamamlandi, JobPriority.Yuksek, 5, 8, 120, kapanisGunOnce: 35),
                    Olustur(1113, "Tedarik zinciri panosu", "Tedarik süreçleri için izleme panosu geliştirildi.",
                            -21, JobStatus.Tamamlandi, JobPriority.Normal, 2, 20, 90, kapanisGunOnce: 22),

                    Olustur(1114, "ERP sürüm yükseltme", "ERP sisteminin yeni ana sürüme geçirilmesi.",
                            -84, JobStatus.Tamamlandi, JobPriority.Yuksek, 4, 20, 200, kapanisGunOnce: 85),
                    Olustur(1115, "Mağaza otomasyon projesi", "Şube kasa ve stok sistemlerinin yenilenmesi.",
                            -40, JobStatus.Tamamlandi, JobPriority.Acil, 5, 15, 170, kapanisGunOnce: 25),

                    Olustur(1116, "Veri merkezi taşıma", "Sunucuların yeni veri merkezine taşınması.",
                            -55, JobStatus.Tamamlandi, JobPriority.Acil, 6, 25, 260, kapanisGunOnce: 40,
                            not: "Taşıma penceresi iki kez ertelendi."),

                    Olustur(1014, "Fuar katılımı", "Sektör fuarına stant ile katılım organizasyonu.",
                            20, JobStatus.Iptal, JobPriority.Normal, 2, 5, 18, kapanisGunOnce: 10)
                );

                await db.SaveChangesAsync();
            }
        }
    }
}
