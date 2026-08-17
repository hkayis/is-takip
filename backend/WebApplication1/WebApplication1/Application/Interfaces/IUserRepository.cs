using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> KullaniciAdiylaGetirAsync(string kullaniciAdi);
        
    }
}
