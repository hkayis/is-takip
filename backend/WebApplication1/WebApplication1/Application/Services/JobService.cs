using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Application.DTOs;
using WebApplication1.Data;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Services
{
    public class JobService
    {

        private readonly AppDbContext _context;

        public JobService (AppDbContext context)
        {
            _context = context;

        }

        public async Task<List<JobListDto>> GetAllAsync()
        {
           return await _context.Jobs.OrderByDescending(j => j.CreatedAt).Select(j => new JobListDto { 
               Title = j.Title,
               Id= j.Id,
               CreatedAt=j.CreatedAt,
               Deadline= j.Deadline,
               Status=j.Status,
               Stage= j.Stage
           }).ToListAsync();

        }


        public async Task<JobDetailDto?> GetByIdAsync(int id)
        {
            var job = await _context.Jobs
                .Include(j => j.History)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job is null) return null;

            return new JobDetailDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                Status = job.Status,
                Stage = job.Stage,
                CreatedAt = job.CreatedAt,
                Deadline = job.Deadline,
                CompletedAt = job.CompletedAt,
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
                        Note = h.Note
                    }).ToList()
            };
        }

        public async Task<Job> CreateAsync(CreateJobDto dto)
        {
            var job = new Job
            {
                Title = dto.Title,
                Description = dto.Description,
                Deadline = dto.Deadline,
                Status = JobStatus.Beklemede,
                CreatedAt = DateTime.UtcNow
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();   // Id oluşsun diye önce kaydet

            _context.JobHistories.Add(new JobHistory
            {
                JobId = job.Id,
                OldStatus = null,                // ilk kayıt
                NewStatus = JobStatus.Beklemede,
                ChangedAt = DateTime.UtcNow,
                Note = "İş oluşturuldu"
            });
            await _context.SaveChangesAsync();

            return job;
        }

        public async Task<bool> ChangeStatusAsync(int jobId, ChangeStatusDto dto)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job is null) return false;

            _context.JobHistories.Add(new JobHistory
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

            if (dto.NewStatus == JobStatus.Tamamlandi && job.CompletedAt is null)
                job.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync (int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return false;

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }



    }
}
