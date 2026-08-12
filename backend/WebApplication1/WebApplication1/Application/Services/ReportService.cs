using Microsoft.EntityFrameworkCore;
using WebApplication1.Application.DTOs;
using WebApplication1.Data;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Services
{
    public class ReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AsamaSuresiDto>> AsamaSureleriAsync()
        {
            var simdi = DateTime.UtcNow;

            // Sadece devam eden işleri, geçmişleriyle birlikte al
            var isler = await _context.Jobs
                .Where(j => j.Status == JobStatus.DevamEdiyor)
                .Include(j => j.History)
                .ToListAsync();

            var toplamGun = new Dictionary<string, double>();      // aşama -> toplam gün
            var isKumesi = new Dictionary<string, HashSet<int>>(); // aşama -> o aşamaya giren iş id'leri

            foreach (var job in isler)
            {
                // Gerçek olaylar: düzenleme satırlarını (Changes dolu) AT, zamana göre sırala
                var olaylar = job.History
                    .Where(h => h.Changes == null)
                    .OrderBy(h => h.ChangedAt)
                    .ToList();

                if (olaylar.Count == 0) continue;

                // Ardışık iki olay arası aralığı, o aralığın BAŞINDAKİ aşamaya yaz
                for (int i = 0; i < olaylar.Count; i++)
                {
                    var baslangic = olaylar[i].ChangedAt;
                    var bitis = (i + 1 < olaylar.Count)
                        ? olaylar[i + 1].ChangedAt
                        : simdi;                       // son aralık AÇIK → şimdiye kadar say
                    var gun = (bitis - baslangic).TotalDays;
                    if (gun <= 0) continue;

                    // Aralık boyunca iş, o olayın NewStage'indeydi; aşama yoksa Beklemede
                    var asama = olaylar[i].NewStage?.ToString() ?? "Beklemede";

                    toplamGun[asama] = (toplamGun.TryGetValue(asama, out var t) ? t : 0) + gun;
                    if (!isKumesi.TryGetValue(asama, out var set))
                        isKumesi[asama] = set = new HashSet<int>();
                    set.Add(job.Id);
                }
            }

            // Sabit sıra: Beklemede, Analiz, Gelistirme, Test, Tasima
            var sira = new[] { "Beklemede", "Analiz", "Gelistirme", "Test", "Tasima" };

            return toplamGun
                .Select(kv => new AsamaSuresiDto
                {
                    Asama = kv.Key,
                    ToplamGun = Math.Round(kv.Value, 1),
                    IsSayisi = isKumesi[kv.Key].Count,
                    OrtalamaGun = Math.Round(kv.Value / isKumesi[kv.Key].Count, 1),
                })
                .OrderBy(x => Array.IndexOf(sira, x.Asama))
                .ToList();
        }
    }
}