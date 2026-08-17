using Microsoft.EntityFrameworkCore;
using WebApplication1.Application.Interfaces;
using WebApplication1.Domain.Entities;
namespace WebApplication1.Data.Repositories
{
    public class JobRepository : IJobRepository
    {

        private readonly AppDbContext _context;

        public JobRepository(AppDbContext context) => _context = context;

        public Task<List<Job>> TumunuGetirAsync() =>
            _context.Jobs.OrderByDescending(j => j.CreatedAt).ToListAsync();

        public async Task<Job?> GetirAsync(int id) =>
            await _context.Jobs.FindAsync(id);

        public Task<Job?> GecmisleGetirAsync(int id) =>
            _context.Jobs.Include(j => j.History).FirstOrDefaultAsync(j => j.Id == id);

        public Task<List<Job>> DurumaGoreGecmisleGetirAsync(JobStatus durum) =>
            _context.Jobs
            .Where(j => j.Status == durum)
            .Include(Job=>Job.History)
            .ToListAsync();

        public Task<bool> VarMiAsync(int id) =>
            _context.Jobs.AnyAsync(j => j.Id == id);

        public void Ekle(Job job) => _context.Jobs.Add(job);
        public void Guncelle(Job job) => _context.Jobs.Update(job);
        public void Sil(Job job) => _context.Jobs.Remove(job);
        public void GecmisEkle(JobHistory kayit) =>
            _context.JobHistories.Add(kayit);

        public Task KaydetAsync() => _context.SaveChangesAsync();
    }
}
