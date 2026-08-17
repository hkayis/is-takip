
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Interfaces
{
    public interface IJobRepository
    {
        Task<List<Job>> TumunuGetirAsync();
        Task<Job?> GetirAsync(int id);
        Task<Job?> GecmisleGetirAsync(int id);

        Task<List<Job>> DurumaGoreGecmisleGetirAsync(JobStatus durum);
        Task<bool> VarMiAsync(int id);


        void Ekle(Job job);
        void Guncelle(Job job);
        void Sil(Job job);
        void GecmisEkle(JobHistory kayit);

        Task KaydetAsync();
    }
}
