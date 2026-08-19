using WebApplication1.Application.DTOs;
using WebApplication1.Application.Interfaces;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Services
{
    public class JobService
    {
        private readonly IJobRepository _repo;

        public JobService(IJobRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<JobListDto>> GetAllAsync()
        {
            var isler = await _repo.TumunuGetirAsync();

            return isler.Select(j => new JobListDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                CreatedAt = j.CreatedAt,
                Deadline = j.Deadline,
                CompletedAt = j.CompletedAt,
                Status = j.Status,
                Stage = j.Stage,
                Priority = j.Priority,
                Adam = j.Adam,
                Gun = j.Gun,
                Buyukluk = j.Buyukluk,
            }).ToList();
        }

        public async Task<JobDetailDto?> GetByIdAsync(int id)
        {
            var job = await _repo.GecmisleGetirAsync(id);
            if (job is null) return null;

            return new JobDetailDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                Status = job.Status,
                Stage = job.Stage,
                Priority = job.Priority,
                CreatedAt = job.CreatedAt,
                Deadline = job.Deadline,
                CompletedAt = job.CompletedAt,
                Adam = job.Adam,
                Gun = job.Gun,
                Buyukluk = job.Buyukluk,
                Not = job.Not,
                History = job.History
                    .OrderBy(h => h.ChangedAt)
                    .Select(h => new JobHistoryDto
                    {
                        Id = h.Id,
                        OldStatus = h.OldStatus,
                        NewStatus = h.NewStatus,
                        OldStage = h.OldStage,
                        NewStage = h.NewStage,
                        ChangedAt = h.ChangedAt,
                        Note = h.Note,
                        Changes = h.Changes
                    }).ToList()
            };
        }

        public Task<bool> IdKullanimdaMi(int id) => _repo.VarMiAsync(id);

        public async Task<Job> CreateAsync(CreateJobDto dto)
        {
            var job = new Job
            {
                Id = dto.Id,                     // numarayı kullanıcı belirliyor
                Title = dto.Title,
                Description = dto.Description,
                Deadline = dto.Deadline,
                Priority = dto.Priority,
                Adam = dto.Adam,
                Gun = dto.Gun,
                Buyukluk = dto.Buyukluk,
                Status = JobStatus.Beklemede,
                CreatedAt = DateTime.UtcNow
            };

            // Id önceden belli olduğu için geçmiş kaydını aynı anda ekleyebiliyoruz
            job.History.Add(new JobHistory
            {
                OldStatus = null,                // ilk kayıt
                NewStatus = JobStatus.Beklemede,
                ChangedAt = DateTime.UtcNow,
                Note = "İş oluşturuldu"
            });

            _repo.Ekle(job);
            await _repo.KaydetAsync();

            return job;
        }

        public async Task<bool> UpdateAsync(int id, UpdateJobDto dto)
        {
            var job = await _repo.GetirAsync(id);
            if (job is null) return false;

            // 1) EZMEDEN ÖNCE farkları topla (job.X = eski, dto.X = yeni)
            var degisiklikler = new List<string>();
            if (job.Title != dto.Title) degisiklikler.Add("Başlık güncellendi");
            if (job.Description != dto.Description) degisiklikler.Add("Açıklama güncellendi");
            if (job.Deadline != dto.Deadline) degisiklikler.Add($"Termin: {job.Deadline:dd.MM.yyyy} → {dto.Deadline:dd.MM.yyyy}");
            if (job.Priority != dto.Priority) degisiklikler.Add($"Öncelik: {job.Priority} → {dto.Priority}");
            if (job.Buyukluk != dto.Buyukluk) degisiklikler.Add($"Büyüklük: {job.Buyukluk} → {dto.Buyukluk}");
            if (job.Adam != dto.Adam || job.Gun != dto.Gun)
                degisiklikler.Add($"Efor: {job.Adam}×{job.Gun} → {dto.Adam}×{dto.Gun}");
            if (job.Not != dto.Not) degisiklikler.Add("Not güncellendi");

            // 2) Alanları uygula
            job.Title = dto.Title;
            job.Description = dto.Description;
            job.Deadline = dto.Deadline;
            job.Priority = dto.Priority;
            job.Adam = dto.Adam;
            job.Gun = dto.Gun;
            job.Buyukluk = dto.Buyukluk;
            job.Not = dto.Not;

            // 3) Gerçekten bir şey değiştiyse geçmişe "düzenleme" satırı ekle
            if (degisiklikler.Count > 0)
            {
                _repo.GecmisEkle(new JobHistory
                {
                    JobId = job.Id,
                    OldStatus = job.Status,   // durum değişmiyor; kolon boş kalmasın diye mevcut durum
                    NewStatus = job.Status,
                    ChangedAt = DateTime.UtcNow,
                    Changes = string.Join(", ", degisiklikler)
                });
            }

            _repo.Guncelle(job);
            await _repo.KaydetAsync();
            return true;
        }

        public async Task<bool> ChangeStatusAsync(int jobId, ChangeStatusDto dto)
        {
            var job = await _repo.GetirAsync(jobId);
            if (job is null) return false;

            _repo.GecmisEkle(new JobHistory
            {
                JobId = job.Id,
                OldStatus = job.Status,
                NewStatus = dto.NewStatus,
                OldStage = job.Stage,
                NewStage = dto.NewStage,
                ChangedAt = DateTime.UtcNow,
                Note = dto.Note
            });

            job.Status = dto.NewStatus;
            job.Stage = dto.NewStatus == JobStatus.DevamEdiyor ? dto.NewStage : null;

            // Tamamlandı'ya geçişte ilk tamamlanma tarihini koru; çıkışta temizle
            job.CompletedAt = dto.NewStatus == JobStatus.Tamamlandi
                ? (job.CompletedAt ?? DateTime.UtcNow)
                : null;

            _repo.Guncelle(job);
            await _repo.KaydetAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var job = await _repo.GetirAsync(id);
            if (job is null) return false;

            _repo.Sil(job);
            await _repo.KaydetAsync();
            return true;
        }
    }
}