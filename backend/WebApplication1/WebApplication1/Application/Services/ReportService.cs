using WebApplication1.Application.DTOs;
using WebApplication1.Application.Interfaces;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Services
{
    public class ReportService
    {
        private readonly IJobRepository _repo;

        public ReportService(IJobRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<AsamaSuresiDto>> AsamaSureleriAsync()
        {
            var simdi = DateTime.UtcNow;

            var isler = await _repo.DurumaGoreGecmisleGetirAsync(JobStatus.DevamEdiyor);

            var toplamGun = new Dictionary<string, double>();     
            var isKumesi = new Dictionary<string, HashSet<int>>(); 

            foreach (var job in isler)
            {
                var olaylar = job.History
                    .Where(h => h.Changes == null)
                    .OrderBy(h => h.ChangedAt)
                    .ToList();

                if (olaylar.Count == 0) continue;

                for (int i = 0; i < olaylar.Count; i++)
                {
                    var baslangic = olaylar[i].ChangedAt;
                    var bitis = (i + 1 < olaylar.Count)
                        ? olaylar[i + 1].ChangedAt
                        : simdi;                       
                    var gun = (bitis - baslangic).TotalDays;
                    if (gun <= 0) continue;

                    var asama = olaylar[i].NewStage?.ToString() ?? "Beklemede";

                    toplamGun[asama] = (toplamGun.TryGetValue(asama, out var t) ? t : 0) + gun;
                    if (!isKumesi.TryGetValue(asama, out var set))
                        isKumesi[asama] = set = new HashSet<int>();
                    set.Add(job.Id);
                }
            }

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